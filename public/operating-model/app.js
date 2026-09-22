(function () {
  "use strict";

  const data = window.OPERATING_MODEL_DATA;
  if (!data || !Array.isArray(data.items)) return;

  const moments = [
    { key: "win", label: "1 · Win", stages: "S0–S3" },
    { key: "commit", label: "2 · Commit", stages: "S4" },
    { key: "mobilise", label: "3 · Mobilise", stages: "S5" },
    { key: "design", label: "4 · Design", stages: "S6" },
    { key: "deliver", label: "5 · Deliver", stages: "S7–S9" },
    { key: "scale", label: "6 · Scale & Operate", stages: "S10–S11" },
    { key: "retain", label: "7 · Retain & Expand", stages: "S12" },
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
      label: "Maturity",
      note: "Maturity is copied directly from the asset register. Position shows where each element belongs in the client lifecycle.",
      values: {
        "Available now": { label: "Available now", colour: "#10b981" },
        "In build · 7 Dec": { label: "In build · 7 Dec", colour: "#9f7aea" },
        Planned: { label: "Planned", colour: "#38bdf8" },
        Partial: { label: "Partial / wrong shape", colour: "#f59e0b" },
        "Not on roadmap": { label: "Not on roadmap", colour: "#ff5a2c" },
      },
    },
    timing: {
      label: "When",
      note: "Timing is an initial lifecycle classification: Early covers win through mobilisation, Middle covers design through the transformation plan, and Late covers scale, operations and retention.",
      values: {
        Early: { label: "Early", colour: "#10b981" },
        Middle: { label: "Middle", colour: "#9f7aea" },
        Late: { label: "Late", colour: "#38bdf8" },
        "Cross-cutting": { label: "Cross-cutting", colour: "#f59e0b" },
      },
    },
    reuse: {
      label: "Reuse",
      note: "Reuse is an initial planning classification. Reusable core should be maintained once, configurable packs adapt by stack or market, and client-specific items are engagement instances.",
      values: {
        "Reusable core": { label: "Reusable core", colour: "#10b981" },
        "Configurable pack": { label: "Reusable + configurable", colour: "#9f7aea" },
        "Client-specific": { label: "Client-specific", colour: "#ff5a2c" },
      },
    },
    criticality: {
      label: "Criticality",
      note: "Criticality is a transparent proxy from source priority: High = Foundational, Medium = Required, Low = Nice to have. It is a starting point for challenge, not a new source fact.",
      values: {
        Foundational: { label: "Foundational", colour: "#ff5a2c" },
        Required: { label: "Required", colour: "#f59e0b" },
        "Nice to have": { label: "Nice to have", colour: "#8b7ca0" },
      },
    },
  };

  const state = { lens: "status", query: "", capability: "", moment: "", priority: "" };
  const els = {
    matrix: document.getElementById("matrix"),
    mobile: document.getElementById("mobile-list"),
    cross: document.getElementById("cross-list"),
    legend: document.getElementById("legend"),
    search: document.getElementById("search"),
    capability: document.getElementById("capability-filter"),
    moment: document.getElementById("moment-filter"),
    priority: document.getElementById("priority-filter"),
    visible: document.getElementById("visible-elements"),
    total: document.getElementById("total-elements"),
    coverage: document.getElementById("delivery-coverage"),
    lens: document.getElementById("current-lens"),
    lensNote: document.getElementById("lens-note"),
    crossCount: document.getElementById("cross-count"),
    empty: document.getElementById("empty-state"),
    dialog: document.getElementById("detail-dialog"),
    detail: document.getElementById("detail-content"),
  };

  capabilities.forEach((name) => els.capability.add(new Option(name, name)));
  moments.forEach((moment) => els.moment.add(new Option(moment.label, moment.key)));
  els.moment.add(new Option("Cross-cutting", "cross"));

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
    if (state.moment && item.moment !== state.moment) return false;
    if (state.priority && item.priority !== state.priority) return false;
    if (!state.query) return true;
    const haystack = [
      item.id, item.stage, item.stageName, item.type, item.element, item.description,
      item.status, item.evidence, item.gap, item.owner, item.capability,
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
      <span class="tile-meta"><span>${escapeHtml(item.id)}</span><span>${escapeHtml(item.type)}</span></span>
      <span class="tile-title">${escapeHtml(item.element)}</span>
      <span class="tile-footer"><span>${escapeHtml(item.stage)}</span><span>${escapeHtml(currentValue(item))}</span></span>
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

  function renderCross(filtered) {
    const items = filtered.filter((item) => item.moment === "cross");
    els.cross.replaceChildren(...items.map(tile));
    els.crossCount.textContent = `${items.length} ${items.length === 1 ? "element" : "elements"}`;
    document.querySelector(".cross-cutting").hidden = items.length === 0;
  }

  function renderMatrix(filtered) {
    const lifecycleItems = filtered.filter((item) => item.moment !== "cross");
    els.matrix.innerHTML = "";

    const corner = document.createElement("div");
    corner.className = "matrix-corner";
    corner.innerHTML = "<strong>Capability family</strong><span>Rows own the work</span>";
    els.matrix.appendChild(corner);

    moments.forEach((moment) => {
      const header = document.createElement("div");
      header.className = "moment-header";
      const count = lifecycleItems.filter((item) => item.moment === moment.key).length;
      header.innerHTML = `<span>${moment.stages} · ${count} elements</span><strong>${escapeHtml(moment.label)}</strong>`;
      els.matrix.appendChild(header);
    });

    capabilities.forEach((capability) => {
      const laneItems = lifecycleItems.filter((item) => item.capability === capability);
      const lane = document.createElement("div");
      lane.className = "lane-header";
      lane.innerHTML = `<strong>${escapeHtml(capability)}</strong><span>${laneItems.length} visible</span>`;
      els.matrix.appendChild(lane);

      moments.forEach((moment) => {
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        laneItems
          .filter((item) => item.moment === moment.key)
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
          .forEach((item) => cell.appendChild(tile(item)));
        els.matrix.appendChild(cell);
      });
    });
  }

  function renderMobile(filtered) {
    const groups = moments
      .map((moment) => ({ ...moment, items: filtered.filter((item) => item.moment === moment.key) }))
      .filter((group) => group.items.length);
    els.mobile.innerHTML = "";
    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "mobile-group";
      const header = document.createElement("div");
      header.className = "mobile-group-header";
      header.innerHTML = `<strong>${escapeHtml(group.label)}</strong><span>${group.items.length} elements</span>`;
      section.appendChild(header);
      group.items
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
        .forEach((item) => section.appendChild(tile(item)));
      els.mobile.appendChild(section);
    });
  }

  function openDetail(item) {
    const priorityLabel = { H: "High", M: "Medium", L: "Low" }[item.priority] || item.priority;
    els.detail.innerHTML = `
      <p class="detail-kicker">${escapeHtml(item.id)} · ${escapeHtml(item.type)} · ${escapeHtml(item.stageName)}</p>
      <h2 class="detail-title">${escapeHtml(item.element)}</h2>
      <div class="detail-tags">
        <span class="detail-tag">${escapeHtml(item.status)}</span>
        <span class="detail-tag">${escapeHtml(priorityLabel)} priority</span>
        <span class="detail-tag">${escapeHtml(item.capability)}</span>
        <span class="detail-tag">${escapeHtml(item.reuse)}</span>
      </div>
      <section class="detail-section">
        <h3>What it must do or contain</h3>
        <p>${escapeHtml(item.description) || "No description recorded."}</p>
      </section>
      <section class="detail-section">
        <h3>Evidence / notes</h3>
        <p>${escapeHtml(item.evidence) || "No evidence note recorded."}</p>
      </section>
      <section class="detail-section">
        <h3>Gap / action</h3>
        <p>${escapeHtml(item.gap) || "No additional gap recorded."}</p>
      </section>
      <section class="detail-section detail-grid">
        <div class="detail-field"><span>Owner</span><strong>${escapeHtml(item.owner)}</strong></div>
        <div class="detail-field"><span>RFP source</span><strong>${escapeHtml(item.rfpSource) || "—"}</strong></div>
        <div class="detail-field"><span>Lifecycle timing</span><strong>${escapeHtml(item.timing)}</strong></div>
        <div class="detail-field"><span>Reuse model</span><strong>${escapeHtml(item.reuse)}</strong></div>
        <div class="detail-field"><span>Criticality proxy</span><strong>${escapeHtml(item.criticality)}</strong></div>
        <div class="detail-field"><span>Executive moment</span><strong>${escapeHtml(item.momentLabel)}</strong></div>
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
    els.coverage.textContent = data.items.filter((item) => item.status === "Available now" || item.status.startsWith("In build")).length;
    els.lens.textContent = schemes[state.lens].label;
    els.lensNote.textContent = schemes[state.lens].note;
    renderLegend(filtered);
    renderCross(filtered);
    renderMatrix(filtered);
    renderMobile(filtered);
    els.empty.hidden = filtered.length !== 0;
    document.querySelector(".map-section").classList.toggle("has-no-results", filtered.length === 0);
  }

  function resetFilters() {
    state.query = "";
    state.capability = "";
    state.moment = "";
    state.priority = "";
    els.search.value = "";
    els.capability.value = "";
    els.moment.value = "";
    els.priority.value = "";
    render();
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function downloadCsv() {
    const rows = data.items.filter(matches);
    const columns = [
      ["ID", "id"], ["Stage", "stage"], ["Stage name", "stageName"],
      ["Executive moment", "momentLabel"], ["Capability family", "capability"],
      ["Type", "type"], ["Element", "element"], ["What it must do or contain", "description"],
      ["Maturity", "status"], ["Evidence / notes", "evidence"], ["Gap / action", "gap"],
      ["Owner", "owner"], ["Priority", "priority"], ["Timing", "timing"],
      ["Reuse", "reuse"], ["Criticality proxy", "criticality"],
    ];
    const csv = [columns.map(([label]) => csvCell(label)).join(",")]
      .concat(rows.map((item) => columns.map(([, key]) => csvCell(item[key])).join(",")))
      .join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Intelligent_Flow_offering_map_visible.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
  els.moment.addEventListener("change", (event) => { state.moment = event.target.value; render(); });
  els.priority.addEventListener("change", (event) => { state.priority = event.target.value; render(); });
  document.getElementById("reset-filters").addEventListener("click", resetFilters);
  document.getElementById("download-csv").addEventListener("click", downloadCsv);
  document.getElementById("close-dialog").addEventListener("click", closeDetail);
  els.dialog.addEventListener("click", (event) => { if (event.target === els.dialog) closeDetail(); });
  els.dialog.addEventListener("close", () => {
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
  });

  render();

  const initialId = decodeURIComponent(window.location.hash.slice(1));
  if (initialId) {
    const item = data.items.find((candidate) => candidate.id === initialId);
    if (item) openDetail(item);
  }
})();
