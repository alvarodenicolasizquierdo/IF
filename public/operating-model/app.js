(function () {
  "use strict";

  const data = window.OPERATING_MODEL_DATA;
  if (!data || !Array.isArray(data.items)) return;

  const areas = [
    { key: "sell", label: "1 · Sell", scope: "10 capabilities" },
    { key: "deliver", label: "2 · Deliver", scope: "10 capabilities" },
    { key: "support", label: "3 · Support & Run", scope: "7 capabilities" },
    { key: "enable", label: "4 · Enable Ourselves", scope: "7 capabilities" },
  ];

  const capabilities = [
    "Commercial & GTM",
    "Architecture & Solution",
    "Delivery & Programme",
    "Platform & Engineering",
    "Governance, Security & Legal",
    "Measurement & Value",
    "Adoption & Enablement",
    "Support & Client Success",
  ];

  const schemes = {
    status: {
      label: "Status",
      note: "Status is normalized from the source status field. The exact source wording remains visible in each capability detail.",
      values: {
        "Available now": { label: "Available now", colour: "#10b981" },
        "Operating rule agreed": { label: "Operating rule agreed", colour: "#9f7aea" },
        "Open decision / resourcing": { label: "Open decision / resourcing", colour: "#8b7ca0" },
        "In progress / partial": { label: "In progress / partial", colour: "#f59e0b" },
        "Planned / not started": { label: "Planned / not started", colour: "#38bdf8" },
      },
    },
    timing: {
      label: "When",
      note: "Timing is normalized from the source target date so the map can be read as a sequence. The exact target remains visible in each detail.",
      values: {
        "Now–Oct 2026": { label: "Now–Oct 2026", colour: "#10b981" },
        "Q4 2026": { label: "Q4 2026", colour: "#f59e0b" },
        "Q1 2027": { label: "Q1 2027", colour: "#9f7aea" },
        "Later 2027": { label: "Later 2027", colour: "#38bdf8" },
      },
    },
    reuse: {
      label: "Reuse",
      note: "Reuse is a working planning classification. Reusable core is maintained once, configurable packs adapt by market or stack, and client-specific items are engagement instances.",
      values: {
        "Reusable core": { label: "Reusable core", colour: "#10b981" },
        "Configurable pack": { label: "Reusable + configurable", colour: "#9f7aea" },
        "Client-specific": { label: "Client-specific", colour: "#ff5a2c" },
      },
    },
    criticality: {
      label: "Criticality",
      note: "Criticality is a working classification for challenge. It does not replace the roadmap decision or imply that later work can be ignored.",
      values: {
        Foundational: { label: "Foundational", colour: "#ff5a2c" },
        Required: { label: "Required", colour: "#f59e0b" },
        "Nice to have": { label: "Nice to have", colour: "#8b7ca0" },
      },
    },
    roadmapCoverage: {
      label: "Roadmap cover",
      note: "Roadmap cover groups the workbook mappings. A mapped row may cover only part of a capability; see the exact mapping and gap. Inclusion in a proposal is not funding approval.",
      values: {
        "Mapped to roadmap": { label: "Mapped to roadmap", colour: "#10b981" },
        "Proposed row": { label: "Proposed row", colour: "#f59e0b" },
        "No dedicated row": { label: "No dedicated row", colour: "#ff5a2c" },
      },
    },
  };

  const state = { lens: "status", query: "", capability: "", area: "", roadmapCoverage: "" };
  const els = {
    matrix: document.getElementById("matrix"),
    mobile: document.getElementById("mobile-list"),
    legend: document.getElementById("legend"),
    search: document.getElementById("search"),
    capability: document.getElementById("capability-filter"),
    area: document.getElementById("area-filter"),
    roadmap: document.getElementById("roadmap-filter"),
    visible: document.getElementById("visible-elements"),
    total: document.getElementById("total-elements"),
    coverage: document.getElementById("delivery-coverage"),
    lens: document.getElementById("current-lens"),
    lensNote: document.getElementById("lens-note"),
    empty: document.getElementById("empty-state"),
    dialog: document.getElementById("detail-dialog"),
    detail: document.getElementById("detail-content"),
  };

  capabilities.forEach((name) => els.capability.add(new Option(name, name)));
  areas.forEach((area) => els.area.add(new Option(area.label, area.key)));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function currentValue(item) {
    return item[state.lens];
  }

  function colourFor(item) {
    return schemes[state.lens].values[currentValue(item)]?.colour || "#8b7ca0";
  }

  function matches(item) {
    if (state.capability && item.capability !== state.capability) return false;
    if (state.area && item.area !== state.area) return false;
    if (state.roadmapCoverage && item.roadmapCoverage !== state.roadmapCoverage) return false;
    if (!state.query) return true;
    const haystack = [
      item.id, item.areaLabel, item.capability, item.element, item.description,
      item.roadmapRow, item.gap, item.sourceStatus, item.owner, item.by,
      item.status, item.timing, item.reuse, item.criticality, item.roadmapCoverage,
    ].join(" ").toLowerCase();
    return haystack.includes(state.query);
  }

  function tile(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "capability-tile";
    button.style.setProperty("--tile-colour", colourFor(item));
    button.setAttribute("aria-label", `${item.id}: ${item.element}. ${schemes[state.lens].label}: ${currentValue(item)}`);
    button.innerHTML = `
      <span class="tile-meta"><span>${escapeHtml(item.id)}</span><span>${escapeHtml(item.by)}</span></span>
      <span class="tile-title">${escapeHtml(item.element)}</span>
      <span class="tile-capability">${escapeHtml(item.capability)}</span>
      <span class="tile-footer"><span>${escapeHtml(item.roadmapCoverage)}</span><span>${escapeHtml(currentValue(item))}</span></span>
    `;
    button.addEventListener("click", () => openDetail(item));
    return button;
  }

  function renderLegend(filtered) {
    const scheme = schemes[state.lens];
    const counts = filtered.reduce((acc, item) => {
      acc[currentValue(item)] = (acc[currentValue(item)] || 0) + 1;
      return acc;
    }, {});
    els.legend.innerHTML = Object.entries(scheme.values).map(([key, value]) => `
      <span class="legend-item">
        <span class="legend-swatch" style="--swatch:${value.colour}"></span>
        <span>${escapeHtml(value.label)}</span>
        <span class="legend-count">${counts[key] || 0}</span>
      </span>
    `).join("");
  }

  function renderMatrix(filtered) {
    els.matrix.innerHTML = "";

    const corner = document.createElement("div");
    corner.className = "matrix-corner";
    corner.innerHTML = "<strong>Capability family</strong><span>Rows show who owns the capability</span>";
    els.matrix.appendChild(corner);

    areas.forEach((area) => {
      const header = document.createElement("div");
      header.className = "moment-header";
      const count = filtered.filter((item) => item.area === area.key).length;
      header.innerHTML = `<span>${escapeHtml(area.scope)} · ${count} visible</span><strong>${escapeHtml(area.label)}</strong>`;
      els.matrix.appendChild(header);
    });

    capabilities.forEach((capability) => {
      const laneItems = filtered.filter((item) => item.capability === capability);
      const lane = document.createElement("div");
      lane.className = "lane-header";
      lane.innerHTML = `<strong>${escapeHtml(capability)}</strong><span>${laneItems.length} visible</span>`;
      els.matrix.appendChild(lane);

      areas.forEach((area) => {
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        laneItems
          .filter((item) => item.area === area.key)
          .sort((a, b) => a.sourceNumber - b.sourceNumber)
          .forEach((item) => cell.appendChild(tile(item)));
        els.matrix.appendChild(cell);
      });
    });
  }

  function renderMobile(filtered) {
    const groups = areas
      .map((area) => ({ ...area, items: filtered.filter((item) => item.area === area.key) }))
      .filter((group) => group.items.length);
    els.mobile.innerHTML = "";
    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "mobile-group";
      const header = document.createElement("div");
      header.className = "mobile-group-header";
      header.innerHTML = `<strong>${escapeHtml(group.label)}</strong><span>${group.items.length} capabilities</span>`;
      section.appendChild(header);
      group.items
        .sort((a, b) => a.sourceNumber - b.sourceNumber)
        .forEach((item) => section.appendChild(tile(item)));
      els.mobile.appendChild(section);
    });
  }

  function openDetail(item) {
    els.detail.innerHTML = `
      <p class="detail-kicker">${escapeHtml(item.id)} · ${escapeHtml(item.areaLabel)}</p>
      <h2 id="detail-title" class="detail-title">${escapeHtml(item.element)}</h2>
      <div class="detail-tags">
        <span class="detail-tag">${escapeHtml(item.status)}</span>
        <span class="detail-tag">${escapeHtml(item.roadmapCoverage)}</span>
        <span class="detail-tag">${escapeHtml(item.capability)}</span>
        <span class="detail-tag">${escapeHtml(item.reuse)}</span>
      </div>
      <section class="detail-section">
        <h3>What it is</h3>
        <p>${escapeHtml(item.description) || "No description recorded."}</p>
      </section>
      <section class="detail-section">
        <h3>Gap against the roadmap</h3>
        <p>${escapeHtml(item.gap) || "No additional gap recorded."}</p>
      </section>
      <section class="detail-section detail-grid">
        <div class="detail-field"><span>Exact source status</span><strong>${escapeHtml(item.sourceStatus)}</strong></div>
        <div class="detail-field"><span>Proposed owner</span><strong>${escapeHtml(item.owner)}</strong></div>
        <div class="detail-field"><span>Target</span><strong>${escapeHtml(item.by)}</strong></div>
        <div class="detail-field"><span>Workbook mapping</span><strong>${escapeHtml(item.roadmapRow) || "—"}</strong></div>
      </section>
      <section class="detail-section detail-grid">
        <div class="detail-field"><span>Planning timing</span><strong>${escapeHtml(item.timing)}</strong></div>
        <div class="detail-field"><span>Reuse model</span><strong>${escapeHtml(item.reuse)}</strong></div>
        <div class="detail-field"><span>Criticality</span><strong>${escapeHtml(item.criticality)}</strong></div>
        <div class="detail-field"><span>Operating area</span><strong>${escapeHtml(item.areaLabel)}</strong></div>
      </section>
    `;
    if (!els.dialog.open) els.dialog.showModal();
    history.replaceState(null, "", `#${item.id}`);
  }

  function closeDetail() {
    els.dialog.close();
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function render() {
    const filtered = data.items.filter(matches);
    els.total.textContent = data.items.length;
    els.visible.textContent = filtered.length;
    els.coverage.textContent = data.roadmap.length;
    els.lens.textContent = schemes[state.lens].label;
    els.lensNote.textContent = schemes[state.lens].note;
    renderLegend(filtered);
    renderMatrix(filtered);
    renderMobile(filtered);
    els.empty.hidden = filtered.length !== 0;
    document.querySelector(".map-section").classList.toggle("has-no-results", filtered.length === 0);
  }

  function resetFilters() {
    state.query = "";
    state.capability = "";
    state.area = "";
    state.roadmapCoverage = "";
    els.search.value = "";
    els.capability.value = "";
    els.area.value = "";
    els.roadmap.value = "";
    render();
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function downloadCsv() {
    const rows = data.items.filter(matches);
    const columns = [
      ["ID", "id"], ["Operating area", "areaLabel"], ["Capability family", "capability"],
      ["Capability", "element"], ["What it is", "description"],
      ["Workbook row", "roadmapRow"], ["Gap against row", "gap"],
      ["Exact source status", "sourceStatus"], ["Proposed owner", "owner"], ["By", "by"],
      ["Normalized status", "status"], ["Timing", "timing"], ["Reuse", "reuse"],
      ["Criticality", "criticality"], ["Roadmap cover", "roadmapCoverage"],
    ];
    const csv = [columns.map(([label]) => csvCell(label)).join(",")]
      .concat(rows.map((item) => columns.map(([, key]) => csvCell(item[key])).join(",")))
      .join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Intelligent_Flow_operating_model_visible.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  document.querySelectorAll(".lens-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.lens = button.dataset.lens;
      document.querySelectorAll(".lens-button").forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });
      render();
    });
  });

  els.search.addEventListener("input", (event) => { state.query = event.target.value.trim().toLowerCase(); render(); });
  els.capability.addEventListener("change", (event) => { state.capability = event.target.value; render(); });
  els.area.addEventListener("change", (event) => { state.area = event.target.value; render(); });
  els.roadmap.addEventListener("change", (event) => { state.roadmapCoverage = event.target.value; render(); });
  document.getElementById("reset-filters").addEventListener("click", resetFilters);
  document.getElementById("download-csv").addEventListener("click", downloadCsv);
  document.getElementById("close-dialog").addEventListener("click", closeDetail);
  els.dialog.addEventListener("click", (event) => { if (event.target === els.dialog) closeDetail(); });
  els.dialog.addEventListener("close", () => {
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
  });

  function openFromHash() {
    const itemId = decodeURIComponent(window.location.hash.slice(1));
    if (!itemId) return;
    const item = data.items.find((candidate) => candidate.id === itemId);
    if (item) openDetail(item);
  }

  window.addEventListener("hashchange", openFromHash);
  render();
  document.getElementById("reconciliation-note").textContent = data.meta.reconciliation;
  document.getElementById("build-rows").innerHTML = data.roadmap.map(row => `
    <details class="build-row"><summary><strong>${escapeHtml(row.id)} · ${escapeHtml(row.element)}</strong> <span>${escapeHtml(row.readyBy)}</span></summary>
    <p>${escapeHtml(row.description)}</p>
    <p><strong>Exit 2026 forecast:</strong> ${escapeHtml(row.exit2026)}</p>
    <p><strong>Evidence of done:</strong> ${escapeHtml(row.done)}</p>
    <p>${escapeHtml(row.source)}${['EA-13','EA-14'].includes(row.id) ? ' · Proposed; Juan to confirm' : ''}</p></details>`).join('');
  openFromHash();
})();
