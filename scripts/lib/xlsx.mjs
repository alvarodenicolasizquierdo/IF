/**
 * Read a sheet out of an .xlsx without adding a dependency.
 *
 * An .xlsx is a zip of XML, and the two pieces needed here — the shared
 * string table and one worksheet's cells — are simple enough to take
 * directly. A parser bought from npm to read two tables would be a supply
 * chain for the sake of forty lines, in a repository whose whole argument is
 * that you should know what is in your build.
 *
 * Deliberately narrow: it reads cell values as text, in row order, and knows
 * nothing about formatting, formulas, merged cells or dates-as-numbers. The
 * schedule stores its dates as text, which is the only reason that is enough.
 */
import { inflateRawSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

/** Pull the named entries out of a zip archive. */
function unzip(buf) {
  // The central directory is found from the end-of-central-directory record,
  // which is the last thing in the file and may carry a trailing comment.
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd -= 1;
  if (eocd < 0) throw new Error('not a zip: no end-of-central-directory record');

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();

  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory entry');
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);

    // The local header repeats the name and extra fields, and its extra field
    // length can differ from the central one — so read the local header's own.
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compressedSize);

    files.set(name, method === 0 ? raw : inflateRawSync(raw));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const unescapeXml = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');

const textOf = (xml) => {
  let out = '';
  for (const m of xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) out += unescapeXml(m[1]);
  return out;
};

/**
 * @returns {{sheets: string[], rows: (name: string) => string[][]}}
 */
export function readWorkbook(path) {
  const files = unzip(readFileSync(path));
  const read = (name) => files.get(name)?.toString('utf8') ?? '';

  const shared = [...read('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    textOf(m[1]),
  );

  // Sheet name to file. The workbook lists sheets in order and the relationship
  // ids map onto worksheet files; in every workbook this script is pointed at
  // the order is the file order, so index is enough — but check it resolves.
  const names = [...read('xl/workbook.xml').matchAll(/<sheet[^>]*name="([^"]*)"/g)].map((m) =>
    unescapeXml(m[1]),
  );

  const rows = (wanted) => {
    const i = names.indexOf(wanted);
    if (i < 0) throw new Error(`no sheet named ${wanted} — have: ${names.join(', ')}`);
    const xml = read(`xl/worksheets/sheet${i + 1}.xml`);
    if (!xml) throw new Error(`sheet ${wanted} resolved to a file that is not in the archive`);

    return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) =>
      [...row[1].matchAll(/<c([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g)].map((cell) => {
        const attrs = cell[1];
        const body = cell[2] ?? '';
        const type = /\bt="([^"]*)"/.exec(attrs)?.[1];
        if (type === 'inlineStr') return textOf(body);
        const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
        if (v == null) return '';
        return type === 's' ? (shared[Number(v)] ?? '') : unescapeXml(v);
      }),
    );
  };

  return { sheets: names, rows };
}
