// Category display names + colors, used for legends and previews
const CATEGORY_INFO = {
  "alkali-metal": { label: "Alkali metal", color: "var(--cat-alkali)" },
  "alkaline-earth": { label: "Alkaline earth", color: "var(--cat-alkaline)" },
  "transition-metal": { label: "Transition metal", color: "var(--cat-transition)" },
  "post-transition": { label: "Post-transition metal", color: "var(--cat-post-transition)" },
  "metalloid": { label: "Metalloid", color: "var(--cat-metalloid)" },
  "nonmetal": { label: "Nonmetal", color: "var(--cat-nonmetal)" },
  "halogen": { label: "Halogen", color: "var(--cat-halogen)" },
  "noble-gas": { label: "Noble gas", color: "var(--cat-noble)" },
  "lanthanide": { label: "Lanthanide", color: "var(--cat-lanthanide)" },
  "actinide": { label: "Actinide", color: "var(--cat-actinide)" },
  "unknown": { label: "Unknown properties", color: "var(--cat-unknown)" }
};

let selectedOverlayer = [];
let selectedSubstrate = [];
const singleExplorerSelections = {
  overlayerExplorer: [],
  substrateExplorer: [],
  bulkExplorer: []
};
let lastExplorerPage = "searchPage";
let currentActiveFilterHtml = "";
let databaseSystems = [];
let currentMatches = [];
let currentSystem = null;
let crystalViewer = null;
let currentStructureStyle = "ballstick";
const poscarTextCache = new Map();

const DATABASE_JSON_URL = "interfaces_database.json";
const ELEMENT_SYMBOLS = [];
let eformGraphDataset = null;
let bulkReferenceSystems = [];
let activeEformGraphMaterial = "all";

const baseFiles = {
  incar: `SYSTEM = interface calculation\nENCUT = 400\nPREC = Normal\nISMEAR = 1\nSIGMA = 0.2\nEDIFF = 1E-4\nIBRION = 2\nNSW = 50\nISIF = 2\nLUSE_VDW = .TRUE.\nGGA = OR\nAGGAC = 0.0\nLDIPOL = .TRUE.\nIDIPOL = 3\n`,
  kpoints: `Automatic mesh\n0\nGamma\n6 6 1\n0 0 0\n`
};

function elementBySymbol(symbol) {
  return PERIODIC_ELEMENTS.find(e => e.symbol === symbol);
}

function buildPeriodicTable(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  PERIODIC_ELEMENTS.forEach(element => {
    const button = document.createElement("button");
    button.className = `element cat-${element.category}`;
    button.style.gridRow = element.row;
    button.style.gridColumn = element.col;
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", `${element.name} (${element.symbol}), atomic number ${element.number}`);
    button.dataset.symbol = element.symbol;

    button.innerHTML = `
      <span class="atomic-number">${element.number}</span>
      <span class="element-symbol">${element.symbol}</span>
    `;

    button.addEventListener("click", () => toggleElement(element.symbol, type, button));
    button.addEventListener("mouseenter", () => showElementPreview(type, element.symbol));
    container.appendChild(button);
  });

  buildLegend(type);
}

function getElementUiIds(type) {
  const configs = {
    overlayer: { table: "overlayerTable", legend: "overlayerLegend", preview: "overlayerPreview", badge: "overlayerBadge", empty: "selectedOverlayerEmpty", chips: "selectedOverlayerChips" },
    substrate: { table: "substrateTable", legend: "substrateLegend", preview: "substratePreview", badge: "substrateBadge", empty: "selectedSubstrateEmpty", chips: "selectedSubstrateChips" },
    overlayerExplorer: { table: "overlayerExplorerTable", legend: "overlayerExplorerLegend", preview: "overlayerExplorerPreview", badge: "overlayerExplorerBadge", empty: "selectedOverlayerExplorerEmpty", chips: "selectedOverlayerExplorerChips" },
    substrateExplorer: { table: "substrateExplorerTable", legend: "substrateExplorerLegend", preview: "substrateExplorerPreview", badge: "substrateExplorerBadge", empty: "selectedSubstrateExplorerEmpty", chips: "selectedSubstrateExplorerChips" },
    bulkExplorer: { table: "bulkExplorerTable", legend: "bulkExplorerLegend", preview: "bulkExplorerPreview", badge: "bulkExplorerBadge", empty: "selectedBulkExplorerEmpty", chips: "selectedBulkExplorerChips" }
  };
  return configs[type] || configs.overlayer;
}

function getSelection(type) {
  if (type === "overlayer") return selectedOverlayer;
  if (type === "substrate") return selectedSubstrate;
  return singleExplorerSelections[type] || [];
}

function setSelection(type, values) {
  if (type === "overlayer") selectedOverlayer = values;
  else if (type === "substrate") selectedSubstrate = values;
  else if (singleExplorerSelections[type]) singleExplorerSelections[type] = values;
}

function buildLegend(type) {
  const legend = document.getElementById(getElementUiIds(type).legend);
  if (!legend) return;
  legend.innerHTML = "";

  const order = [
    "alkali-metal", "alkaline-earth", "transition-metal", "post-transition",
    "metalloid", "nonmetal", "halogen", "noble-gas", "lanthanide", "actinide", "unknown"
  ];

  order.forEach(cat => {
    const info = CATEGORY_INFO[cat];
    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-dot" style="background:${info.color}"></span>${info.label}`;
    legend.appendChild(item);
  });
}

function showElementPreview(type, symbol) {
  const preview = document.getElementById(getElementUiIds(type).preview);
  if (!preview) return;
  const element = elementBySymbol(symbol);
  const info = CATEGORY_INFO[element.category];

  preview.classList.remove("is-empty");
  preview.innerHTML = `
    <span class="preview-symbol" style="background:${info.color}">${element.symbol}</span>
    <span class="preview-details">
      <strong>${element.name} &middot; ${element.number}</strong>
      <span>${info.label} &middot; atomic mass ${element.mass}</span>
    </span>
  `;
}

function toggleElement(symbol, type, button) {
  const list = getSelection(type);
  const isSelected = list.includes(symbol);
  const updated = isSelected ? list.filter(e => e !== symbol) : [...list, symbol];
  setSelection(type, updated);
  button.classList.toggle("selected", !isSelected);
  refreshSelectionUI(type);
}

function removeElement(symbol, type) {
  setSelection(type, getSelection(type).filter(e => e !== symbol));
  const tableId = getElementUiIds(type).table;
  const button = document.querySelector(`#${tableId} [data-symbol="${symbol}"]`);
  if (button) button.classList.remove("selected");
  refreshSelectionUI(type);
}

function refreshSelectionUI(type) {
  const list = getSelection(type);
  const ids = getElementUiIds(type);
  const badge = document.getElementById(ids.badge);
  const emptyLabel = document.getElementById(ids.empty);
  const chipsContainer = document.getElementById(ids.chips);

  if (badge) {
    badge.textContent = `${list.length} selected`;
    badge.classList.toggle("empty", list.length === 0);
  }
  if (!emptyLabel || !chipsContainer) return;

  chipsContainer.innerHTML = "";
  if (list.length === 0) {
    emptyLabel.style.display = "inline";
  } else {
    emptyLabel.style.display = "none";
    list.forEach(symbol => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML = `${symbol} <button type="button" aria-label="Remove ${symbol}">&times;</button>`;
      chip.querySelector("button").addEventListener("click", () => removeElement(symbol, type));
      chipsContainer.appendChild(chip);
    });
  }
}

function clearExplorerSelections(type) {
  setSelection(type, []);
  const tableId = getElementUiIds(type).table;
  document.querySelectorAll(`#${tableId} .element.selected`).forEach(el => el.classList.remove("selected"));
  refreshSelectionUI(type);
}

function clearAllSelections() {
  clearExplorerSelections("overlayer");
  clearExplorerSelections("substrate");
}

async function loadDatabaseFromJson() {
  try {
    const response = await fetch(DATABASE_JSON_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${DATABASE_JSON_URL}`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload.rows || [];

    databaseSystems = rows.map(rowToSystem).filter(Boolean);
    eformGraphDataset = payload.eform_graph || payload.eformGraph || null;
    bulkReferenceSystems = buildBulkReferenceSystems(eformGraphDataset?.bulk_references || {});

    const status = document.getElementById("eformGraphStatus");
    if (status) status.textContent = eformGraphDataset ? "" : "No Eform graph data found in the database JSON.";
  } catch (error) {
    console.error(error);
    databaseSystems = [];
    eformGraphDataset = null;
    bulkReferenceSystems = [];
    const tip = document.querySelector(".snapshot-tip");
    if (tip) {
      tip.innerHTML = `<strong>JSON not loaded</strong> — serve this folder through GitHub Pages or a local web server so the browser can read <span class="mono">${DATABASE_JSON_URL}</span>.`;
    }
    const status = document.getElementById("eformGraphStatus");
    if (status) status.textContent = `Graph data not loaded. Make sure ${DATABASE_JSON_URL} is in the same folder as index.html.`;
  }

  updateStats();
  currentMatches = databaseSystems;
  setupResultFilterOptions(currentMatches);
  renderEformGraph();
}

function buildBulkReferenceSystems(bulkReferences) {
  return Object.entries(bulkReferences || {}).map(([formula, reference], index) => {
    const totalEnergy = Number(reference.bulk_total_energy_eV);
    const energyPerNi = Number(reference.bulk_energy_per_Ni_eV);
    const niCount = Number(reference.ni_count);
    const method = eformGraphDataset?.metadata?.method || "vdW-DF";
    const spin = eformGraphDataset?.metadata?.spin || "FM";
    const uValue = Number.isFinite(Number(eformGraphDataset?.metadata?.u_value_eV))
      ? `U = ${Number(eformGraphDataset.metadata.u_value_eV)}`
      : "U = N/A";

    return {
      id: `bulk-reference-${formula}-${index + 1}`,
      name: `${formula} bulk reference`,
      overlayerElements: extractElements(formula),
      substrateElements: [],
      method,
      spin,
      uValue,
      uNumber: Number(eformGraphDataset?.metadata?.u_value_eV) || null,
      finalEnergy: Number.isFinite(totalEnergy) ? `${totalEnergy.toFixed(6)} eV` : "N/A",
      finalEnergyValue: totalEnergy,
      sourceSheet: "Bulk references",
      type: "Bulk reference",
      materialA: formula,
      materialB: "",
      facet: "Bulk",
      supercell: "Bulk reference cell",
      strain: "N/A",
      adsorbate: "",
      site: "Bulk",
      energyType: "Bulk energy reference",
      relativeEnergy: Number.isFinite(energyPerNi) ? `${energyPerNi.toFixed(6)} eV/Ni` : "",
      formula,
      trend: "Bulk reference used for Eform calculations.",
      conclusion: `Total energy from Eform graph references${Number.isFinite(niCount) ? `; ${niCount} Ni in the bulk reference system` : ""}.`,
      reference: "eform_graph.bulk_references",
      notes: Number.isFinite(energyPerNi) ? `Bulk energy per Ni = ${energyPerNi.toFixed(6)} eV/Ni` : "",
      poscarFile: "",
      raw: { formula, ...reference },
      files: {
        json: JSON.stringify({ formula, ...reference }, null, 2),
        incar: baseFiles.incar.replace("interface calculation", `${formula} bulk reference`),
        poscar: "",
        kpoints: baseFiles.kpoints
      }
    };
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift()?.map(h => h.trim()) || [];
  return rows
    .filter(values => values.some(value => value.trim() !== ""))
    .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function rowToSystem(row, index) {
  const methodInfo = parseMethod(row.method || "");
  const materialA = cleanCell(row.materialA) || parseOverlayerFromSystem(row.system);
  const materialB = cleanCell(row.materialB) || parseSubstrateFromSystem(row.system);
  const overlayerElements = extractElements(materialA || row.system || "");
  const substrateElements = extractElements(materialB || "");

  return {
    id: row.id || `csv-row-${index + 1}`,
    name: cleanCell(row.system) || `System ${index + 1}`,
    overlayerElements,
    substrateElements,
    method: methodInfo.method || cleanCell(row.method) || "Unknown",
    spin: methodInfo.spin || "N/A",
    uValue: methodInfo.uValue || "U = N/A",
    uNumber: methodInfo.uNumber,
    finalEnergy: cleanCell(row.finalEnergy) || formatEnergy(row.finalEnergyValue),
    finalEnergyValue: Number(row.finalEnergyValue),
    sourceSheet: cleanCell(row.sourceSheet),
    type: cleanCell(row.type),
    materialA,
    materialB,
    facet: cleanCell(row.facet),
    supercell: cleanCell(row.supercell),
    strain: cleanCell(row.strain),
    adsorbate: cleanCell(row.adsorbate),
    site: cleanCell(row.site),
    energyType: cleanCell(row.energyType),
    relativeEnergy: cleanCell(row.relativeEnergy),
    formula: cleanCell(row.formula),
    trend: cleanCell(row.trend),
    conclusion: cleanCell(row.conclusion),
    reference: cleanCell(row.reference),
    notes: cleanCell(row.notes),
    poscarFile: cleanCell(row.poscarFile),
    raw: row,
    files: buildFilesFromRow(row, methodInfo)
  };
}

function parseMethod(methodText) {
  const text = cleanCell(methodText);
  const parts = text.split(",").map(part => part.trim()).filter(Boolean);
  const spinMatch = text.match(/\b(AFM|FM|NM|nonmagnetic)\b/i);
  const uMatch = text.match(/\bU\s*=?\s*([0-9]+(?:\.[0-9]+)?)/i);
  const method = parts.find(part => !/\b(AFM|FM|NM|nonmagnetic)\b/i.test(part) && !/\bU\s*=?/i.test(part)) || parts[0] || text;
  return {
    method,
    spin: spinMatch ? spinMatch[1].toUpperCase().replace("NONMAGNETIC", "NM") : "",
    uValue: uMatch ? `U = ${uMatch[1]}` : "",
    uNumber: uMatch ? Number(uMatch[1]) : null
  };
}

function cleanCell(value) {
  const text = String(value ?? "").trim();
  return text === "TBD" || text === "nan" ? "" : text;
}

function formatEnergy(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(6)} eV` : "N/A";
}

function parseOverlayerFromSystem(systemName) {
  return cleanCell(systemName).split("_on_")[0] || "";
}

function parseSubstrateFromSystem(systemName) {
  const afterOn = cleanCell(systemName).split("_on_")[1] || "";
  return afterOn.split("111")[0].replace(/[^A-Za-z]/g, "");
}

function extractElements(text) {
  const source = cleanCell(text);
  const found = [];
  ELEMENT_SYMBOLS.forEach(symbol => {
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z])${escaped}(?=[A-Z0-9_()\\-/]|$)`, "g");
    if (pattern.test(source) && !found.includes(symbol)) found.push(symbol);
  });
  return found;
}

function buildFilesFromRow(row, methodInfo) {
  const systemName = cleanCell(row.system) || "interface_system";
  const jsonContent = JSON.stringify(row, null, 2);
  const incar = baseFiles.incar
    .replace("interface calculation", systemName)
    .replace("IBRION = 2", `IBRION = 2\n# Database method: ${cleanCell(row.method) || "N/A"}\n# Parsed spin: ${methodInfo.spin || "N/A"}\n# Parsed U value: ${methodInfo.uValue || "N/A"}`);
  const poscar = buildCsvReferencePoscar(row);
  const kpoints = baseFiles.kpoints;

  return { json: jsonContent, incar, poscar, kpoints };
}

function buildCsvReferencePoscar(row) {
  const systemName = cleanCell(row.system) || "interface_system";
  const materialA = cleanCell(row.materialA) || parseOverlayerFromSystem(systemName) || "Overlayer";
  const materialB = cleanCell(row.materialB) || parseSubstrateFromSystem(systemName) || "Substrate";
  const substrateSpecies = extractElements(materialB).length ? extractElements(materialB) : extractElements(parseSubstrateFromSystem(systemName));
  const overlayerFormula = parseFormulaCounts(materialA || parseOverlayerFromSystem(systemName));
  const overlayerSpecies = Object.keys(overlayerFormula).length ? Object.keys(overlayerFormula) : extractElements(materialA);
  const species = unique([...substrateSpecies, ...overlayerSpecies]);
  const safeSpecies = species.length ? species : ["Pt", "Ni", "O", "H"];

  const substrateArea = estimateCellArea(systemName.split("_on_")[1] || row.supercell || row.poscarFile || "root13");
  const overlayerArea = estimateCellArea(systemName.split("_on_")[0] || row.supercell || row.poscarFile || "root13");
  const substrateLayers = 3;
  const maxAtoms = 220;
  const atoms = [];

  substrateSpecies.forEach(symbol => {
    for (let layer = 0; layer < substrateLayers; layer += 1) {
      for (let i = 0; i < substrateArea; i += 1) {
        atoms.push({ symbol, ...surfaceGridPoint(i, substrateArea, 0.10 + layer * 0.065, layer * 0.035) });
      }
    }
  });

  const formulaEntries = Object.entries(overlayerFormula).length ? Object.entries(overlayerFormula) : overlayerSpecies.map(symbol => [symbol, 1]);
  formulaEntries.forEach(([symbol, count]) => {
    const zBase = symbol === "H" ? 0.50 : symbol === "O" ? 0.43 : 0.36;
    const scale = symbol === "H" ? 0.72 : symbol === "O" ? 0.88 : 1.0;
    const total = Math.max(1, Math.round(overlayerArea * count * scale));
    for (let i = 0; i < total; i += 1) {
      atoms.push({ symbol, ...surfaceGridPoint(i, total, zBase, symbol.charCodeAt(0) * 0.003) });
    }
  });

  const limitedAtoms = atoms.slice(0, maxAtoms);
  const countsBySpecies = Object.fromEntries(safeSpecies.map(symbol => [symbol, 0]));
  limitedAtoms.forEach(atom => {
    if (!countsBySpecies[atom.symbol]) countsBySpecies[atom.symbol] = 0;
    countsBySpecies[atom.symbol] += 1;
  });
  const finalSpecies = Object.keys(countsBySpecies).filter(symbol => countsBySpecies[symbol] > 0);
  const coords = [];
  finalSpecies.forEach(symbol => {
    limitedAtoms.filter(atom => atom.symbol === symbol).forEach(atom => {
      coords.push(`${atom.x.toFixed(6)} ${atom.y.toFixed(6)} ${atom.z.toFixed(6)}`);
    });
  });

  const lateral = Math.max(8.5, Math.sqrt(Math.max(substrateArea, overlayerArea)) * 3.05);
  const bY = lateral * 0.8660254;

  return `${systemName}\n1.0\n  ${lateral.toFixed(6)} 0.000000 0.000000\n  ${(-0.5 * lateral).toFixed(6)} ${bY.toFixed(6)} 0.000000\n  0.000000 0.000000 26.000000\n${finalSpecies.join(" ")}\n${finalSpecies.map(symbol => countsBySpecies[symbol]).join(" ")}\nDirect\n${coords.join("\n")}\n\n# Generated preview POSCAR from database metadata.\n# This is an approximate interface-like slab for visualization only.\n# Original POSCAR reference from database row: ${cleanCell(row.poscarFile) || "not listed"}\n# For accurate atomic positions, place the real POSCAR at that relative path in the website folder.\n`;
}

function parseFormulaCounts(text) {
  const source = cleanCell(text);
  const counts = {};
  const pattern = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const symbol = match[1];
    if (!ELEMENT_SYMBOLS.includes(symbol)) continue;
    counts[symbol] = (counts[symbol] || 0) + (Number(match[2]) || 1);
  }
  return counts;
}

function estimateCellArea(text) {
  const source = cleanCell(text);
  const rootMatch = source.match(/root\s*(\d+)/i);
  if (rootMatch) return Math.max(1, Math.min(64, Number(rootMatch[1])));
  const timesMatch = source.match(/(\d+)\s*x\s*(\d+)/i);
  if (timesMatch) return Math.max(1, Math.min(64, Number(timesMatch[1]) * Number(timesMatch[2])));
  const compactMatch = source.match(/(?:^|_)(\d+)(?=_|$)/);
  if (compactMatch) return Math.max(1, Math.min(64, Number(compactMatch[1]) ** 2));
  return 13;
}

function surfaceGridPoint(index, total, z, offset = 0) {
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = ((col + 0.5 + (row % 2) * 0.5) / cols + offset) % 1;
  const y = ((row + 0.5) / Math.ceil(total / cols) + offset * 0.6) % 1;
  return { x, y, z };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function searchSystems() {
  lastExplorerPage = "searchPage";
  document.getElementById("resultsTitle").textContent = "Matching interface systems";
  const backButton = document.getElementById("resultsBackButton");
  if (backButton) backButton.innerHTML = "&larr; Back to Interface Explorer";
  currentMatches = databaseSystems.filter(system => {
    const overlayerMatch = selectedOverlayer.length === 0 || selectedOverlayer.every(element => system.overlayerElements.includes(element));
    const substrateMatch = selectedSubstrate.length === 0 || selectedSubstrate.every(element => system.substrateElements.includes(element));
    return overlayerMatch && substrateMatch;
  });

  currentActiveFilterHtml = "";
  renderActiveFiltersBar();
  setupResultFilterOptions(currentMatches);
  applyResultFilters();
  showPage("resultsPage");
}

function renderActiveFiltersBar() {
  const bar = document.getElementById("activeFiltersBar");
  bar.innerHTML = currentActiveFilterHtml || "";

  if (bar.innerHTML) return;

  if (selectedOverlayer.length === 0 && selectedSubstrate.length === 0) {
    bar.innerHTML = `<span>Showing all JSON systems &mdash; no element filters applied.</span>`;
    return;
  }

  if (selectedOverlayer.length > 0) {
    bar.innerHTML += `<span>Overlayer: <strong class="mono">${selectedOverlayer.join(", ")}</strong></span>`;
  }
  if (selectedSubstrate.length > 0) {
    bar.innerHTML += `<span>Substrate: <strong class="mono">${selectedSubstrate.join(", ")}</strong></span>`;
  }
}

function searchSingleExplorer(type) {
  const pageMap = {
    overlayerExplorer: "overlayerExplorerPage",
    substrateExplorer: "substrateExplorerPage",
    bulkExplorer: "bulkExplorerPage"
  };
  const titleMap = {
    overlayerExplorer: "Matching overlayer entries",
    substrateExplorer: "Matching substrate entries",
    bulkExplorer: "Matching bulk entries"
  };
  const labelMap = {
    overlayerExplorer: "Overlayer",
    substrateExplorer: "Substrate",
    bulkExplorer: "Bulk"
  };

  lastExplorerPage = pageMap[type] || "searchPage";
  document.getElementById("resultsTitle").textContent = titleMap[type] || "Matching entries";
  const backButton = document.getElementById("resultsBackButton");
  if (backButton) backButton.innerHTML = `&larr; Back to ${labelMap[type] || "Explorer"} Explorer`;

  const selected = getSelection(type);
  const explorerPool = getDatasetForExplorer(type);

  currentMatches = explorerPool.filter(system => {
    const elements = getSystemElementsForExplorer(system, type);
    return selected.length === 0 || selected.every(element => elements.includes(element));
  });

  currentActiveFilterHtml = selected.length === 0
    ? `<span>Showing ${labelMap[type].toLowerCase()} database entries only &mdash; no element filters applied.</span>`
    : `<span>${labelMap[type]} elements: <strong class="mono">${selected.join(", ")}</strong></span>`;

  renderActiveFiltersBar();
  setupResultFilterOptions(currentMatches);
  applyResultFilters();
  showPage("resultsPage");
}

function getDatasetForExplorer(type) {
  if (type === "bulkExplorer") {
    const csvBulkRows = databaseSystems.filter(system => {
      const rowType = String(system.type || "").toLowerCase();
      const sheet = String(system.sourceSheet || "").toLowerCase();
      const energyType = String(system.energyType || "").toLowerCase();
      const combined = `${rowType} ${sheet} ${energyType}`;
      return /(^|[^a-z])(bulk|reference bulk|bulk reference|crystal bulk)([^a-z]|$)/.test(combined);
    });
    return uniqueById([...csvBulkRows, ...bulkReferenceSystems]);
  }

  return databaseSystems.filter(system => {
    const rowType = String(system.type || "").toLowerCase();
    const sheet = String(system.sourceSheet || "").toLowerCase();
    const energyType = String(system.energyType || "").toLowerCase();
    const combined = `${rowType} ${sheet} ${energyType}`;

    if (type === "overlayerExplorer") {
      return /(^|[^a-z])(overlayer|film|monolayer|oxide sheet|hydroxide sheet)([^a-z]|$)/.test(combined);
    }
    if (type === "substrateExplorer") {
      return /(^|[^a-z])(substrate|clean surface|bare surface|slab only|support only)([^a-z]|$)/.test(combined);
    }
    return [];
  });
}

function uniqueById(systems) {
  const seen = new Set();
  return systems.filter(system => {
    const key = system.id || system.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getSystemElementsForExplorer(system, type) {
  if (type === "overlayerExplorer") return system.overlayerElements;
  if (type === "substrateExplorer") return system.substrateElements;
  const text = [system.type, system.materialA, system.materialB, system.formula, system.name, system.sourceSheet].join(" ");
  return extractElements(text);
}

function setupResultFilterOptions(systems) {
  populateSelect("filterMethod", systems.map(system => system.method), "All methods");
  populateSelect("filterSpin", systems.map(system => system.spin), "All spins");
  populateSelect("filterUValue", systems.map(system => system.uValue), "All U-values");
  ["filterSystemName", "filterEnergy"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

function populateSelect(id, values, label) {
  const select = document.getElementById(id);
  if (!select) return;
  const uniqueValues = unique(values).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  select.innerHTML = `<option value="">${label}</option>`;
  uniqueValues.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function applyResultFilters() {
  const systemName = document.getElementById("filterSystemName")?.value.trim().toLowerCase() || "";
  const method = document.getElementById("filterMethod")?.value || "";
  const spin = document.getElementById("filterSpin")?.value || "";
  const uValue = document.getElementById("filterUValue")?.value || "";
  const energy = document.getElementById("filterEnergy")?.value.trim().toLowerCase() || "";

  const filtered = currentMatches.filter(system => {
    const searchableName = [system.name, system.sourceSheet, system.materialA, system.materialB, system.facet, system.supercell].join(" ").toLowerCase();
    const nameMatch = !systemName || searchableName.includes(systemName);
    const methodMatch = !method || system.method === method;
    const spinMatch = !spin || system.spin === spin;
    const uMatch = !uValue || system.uValue === uValue;
    const energyMatch = !energy || system.finalEnergy.toLowerCase().includes(energy) || String(system.finalEnergyValue).includes(energy);
    return nameMatch && methodMatch && spinMatch && uMatch && energyMatch;
  });

  renderResults(filtered, currentMatches.length);
}

function clearResultColumnFilters() {
  ["filterSystemName", "filterEnergy"].forEach(id => document.getElementById(id).value = "");
  ["filterMethod", "filterSpin", "filterUValue"].forEach(id => document.getElementById(id).value = "");
  applyResultFilters();
}

function renderResults(systems, unfilteredCount = systems.length) {
  const resultsBody = document.getElementById("resultsBody");
  const resultsCount = document.getElementById("resultsCount");
  resultsBody.innerHTML = "";

  resultsCount.innerHTML = `<strong>${systems.length}</strong> of <strong>${unfilteredCount}</strong> ${unfilteredCount === 1 ? "system" : "systems"} shown`;

  if (systems.length === 0) {
    const title = unfilteredCount === 0 ? "No matching result" : "No systems matched your filters";
    const helper = unfilteredCount === 0
      ? "This explorer has no rows in the current JSON/data source yet."
      : "Try changing the column filters, or clear them to return to the full matching set.";
    resultsBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-state-title">${title}</div>
          ${helper}
        </td>
      </tr>
    `;
    return;
  }

  systems.forEach(system => {
    const row = document.createElement("tr");
    row.className = "clickable-result-row";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Open ${system.name}`);
    row.innerHTML = `
      <td><button type="button" class="system-link"></button><div class="row-subtitle"></div></td>
      <td>${escapeHtml(system.method)}</td>
      <td>${escapeHtml(system.spin)}</td>
      <td>${escapeHtml(system.uValue)}</td>
      <td class="mono-cell">${escapeHtml(system.finalEnergy)}</td>
    `;
    row.querySelector(".system-link").textContent = system.name;
    row.querySelector(".row-subtitle").textContent = [system.sourceSheet, system.facet, system.supercell].filter(Boolean).join(" · ");

    const openDetail = () => openSystemDetail(system);
    row.querySelector(".system-link").addEventListener("click", event => {
      event.stopPropagation();
      openDetail();
    });
    row.addEventListener("click", openDetail);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail();
      }
    });

    resultsBody.appendChild(row);
  });
}

function openSystemDetail(system) {
  currentSystem = system;
  activeEformGraphMaterial = inferEformMaterialFromSystem(system) || "all";
  document.getElementById("detailTitle").textContent = system.name;
  document.getElementById("detailEnergy").textContent = system.finalEnergy;
  document.getElementById("detailU").textContent = system.uValue;
  document.getElementById("detailMethod").textContent = system.method;
  document.getElementById("detailSpin").textContent = system.spin;
  document.getElementById("detailOverlayer").textContent = system.overlayerElements.join(", ") || system.materialA || "N/A";
  document.getElementById("detailSubstrate").textContent = system.substrateElements.join(", ") || system.materialB || "N/A";
  resizeCrystalViewer(false);
  showPage("detailPage");
  window.requestAnimationFrame(() => {
    renderPoscarPreview(system);
    renderEformGraph();
  });
}

async function renderPoscarPreview(system) {
  const viewerElement = document.getElementById("poscarMiniViewer");
  viewerElement.innerHTML = "";
  viewerElement.classList.remove("has-3dmol", "is-generated-preview");
  crystalViewer = null;

  const loadedPoscar = await loadRealPoscarIfAvailable(system);
  const poscar = loadedPoscar || system.files?.poscar || buildCsvReferencePoscar(system.raw || {});
  const atoms = parsePoscarAtoms(poscar);
  const sourceLabel = loadedPoscar ? "real POSCAR" : "generated preview from database metadata";

  if (window.$3Dmol && atoms.length > 0) {
    if (!loadedPoscar) viewerElement.classList.add("is-generated-preview");
    render3DmolViewer(viewerElement, atoms, !loadedPoscar);
    return;
  }

  renderFallbackAtomPreview(viewerElement, system, !loadedPoscar);
}

async function loadRealPoscarIfAvailable(system) {
  const poscarPath = system?.poscarFile;
  if (!poscarPath) return "";
  if (poscarTextCache.has(poscarPath)) return poscarTextCache.get(poscarPath);

  try {
    const response = await fetch(poscarPath, { cache: "no-store" });
    if (!response.ok) throw new Error(`Missing POSCAR: ${poscarPath}`);
    const text = await response.text();
    const looksLikePoscar = text.split(/\r?\n/).length > 7;
    const usable = looksLikePoscar ? text : "";
    poscarTextCache.set(poscarPath, usable);
    if (usable) currentSystem.files.poscar = usable;
    return usable;
  } catch (error) {
    poscarTextCache.set(poscarPath, "");
    return "";
  }
}

function parsePoscarAtoms(poscarText) {
  const lines = String(poscarText || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));

  if (lines.length < 8) return [];

  const scale = Number(lines[1]) || 1;
  const lattice = [lines[2], lines[3], lines[4]].map(line =>
    line.split(/\s+/).slice(0, 3).map(value => (Number(value) || 0) * scale)
  );

  let speciesLineIndex = 5;
  let species = lines[speciesLineIndex].split(/\s+/).filter(Boolean);
  let counts = lines[speciesLineIndex + 1].split(/\s+/).map(value => Number(value)).filter(value => Number.isFinite(value));

  // Older POSCAR files sometimes omit the species line. In that case, use a generic element list.
  if (counts.length === 0) {
    counts = species.map(value => Number(value)).filter(value => Number.isFinite(value));
    species = ["X"];
    speciesLineIndex = 4;
  }

  let coordTypeIndex = speciesLineIndex + 2;
  if (/^s/i.test(lines[coordTypeIndex])) coordTypeIndex += 1;
  const coordType = lines[coordTypeIndex] || "Direct";
  const coordStart = coordTypeIndex + 1;
  const total = counts.reduce((sum, value) => sum + value, 0);

  const atomSpecies = [];
  counts.forEach((count, index) => {
    for (let i = 0; i < count; i += 1) atomSpecies.push(species[index] || species[species.length - 1] || "X");
  });

  const atoms = [];
  for (let i = 0; i < total; i += 1) {
    const parts = (lines[coordStart + i] || "").split(/\s+/).slice(0, 3).map(value => Number(value));
    if (parts.length < 3 || parts.some(value => !Number.isFinite(value))) continue;
    const [a, b, c] = parts;
    let x = a;
    let y = b;
    let z = c;

    if (/^d/i.test(coordType)) {
      x = a * lattice[0][0] + b * lattice[1][0] + c * lattice[2][0];
      y = a * lattice[0][1] + b * lattice[1][1] + c * lattice[2][1];
      z = a * lattice[0][2] + b * lattice[1][2] + c * lattice[2][2];
    }

    atoms.push({ elem: atomSpecies[i] || "X", x, y, z });
  }
  return atoms;
}

function atomsToXyz(atoms) {
  const body = atoms.map(atom => `${atom.elem} ${atom.x.toFixed(6)} ${atom.y.toFixed(6)} ${atom.z.toFixed(6)}`).join("\n");
  return `${atoms.length}\nGenerated from POSCAR\n${body}\n`;
}

function render3DmolViewer(viewerElement, atoms, isGeneratedPreview = false) {
  viewerElement.classList.add("has-3dmol");
  crystalViewer = window.$3Dmol.createViewer(viewerElement, { backgroundColor: "white" });
  crystalViewer.addModel(atomsToXyz(atoms), "xyz");
  applyViewerStyle();
  fitViewerToBox();
  if (isGeneratedPreview) addGeneratedPreviewBadge(viewerElement);
}

function applyViewerStyle() {
  if (!crystalViewer) return;
  crystalViewer.setStyle({}, {});

  if (currentStructureStyle === "sphere") {
    crystalViewer.setStyle({}, { sphere: { scale: 0.35 } });
  } else {
    crystalViewer.setStyle({}, { sphere: { scale: 0.25 }, stick: { radius: 0.08 } });
  }

  crystalViewer.render();
}

function setViewerStyle(style) {
  currentStructureStyle = style === "sphere" ? "sphere" : "ballstick";
  applyViewerStyle();
}

function resetViewerCamera() {
  fitViewerToBox();
}

function resizeCrystalViewer(refit = true) {
  if (!crystalViewer) return;
  window.setTimeout(() => {
    crystalViewer.resize();
    if (refit) crystalViewer.zoomTo();
    crystalViewer.render();
  }, 80);
}

function fitViewerToBox() {
  if (!crystalViewer) return;
  crystalViewer.resize();
  crystalViewer.zoomTo();
  crystalViewer.render();
}

function addGeneratedPreviewBadge(viewerElement) {
  // Keep the viewer free of status text.
}

function renderFallbackAtomPreview(viewer, system, isGeneratedPreview = true) {
  const elements = unique([...system.substrateElements, ...system.overlayerElements]);
  const safeElements = elements.length ? elements : ["Pt", "Ni", "O", "H"];
  const atomTotal = Math.min(120, estimateAtomCount(system));

  for (let i = 0; i < atomTotal; i += 1) {
    const element = safeElements[i % safeElements.length];
    const atom = document.createElement("span");
    atom.className = `atom atom-${element.toLowerCase()}`;
    atom.title = element;
    atom.style.left = `${8 + ((i * 17) % 78)}%`;
    atom.style.top = `${8 + ((i * 29) % 84)}%`;
    atom.style.transform = `scale(${element === "H" ? 0.55 : element === "O" ? 0.75 : 1})`;
    atom.textContent = element;
    viewer.appendChild(atom);
  }

}

function estimateAtomCount(system) {
  const text = `${system.supercell} ${system.poscarFile} ${system.name}`;
  const rootMatches = [...text.matchAll(/root(\d+)/gi)].map(match => Number(match[1]));
  const cellMatches = [...text.matchAll(/(?:^|_)(\d+)x?(?=_|$)/gi)].map(match => Number(match[1]));
  const score = [...rootMatches, ...cellMatches].reduce((sum, value) => sum + value, 0);
  return Math.max(24, Math.min(140, score * 3 || 48));
}

function resetStructureViewer() {
  resizeCrystalViewer();
}

function setEformGraphMaterial(material) {
  activeEformGraphMaterial = material || "all";
  renderEformGraph();
}

function inferEformMaterialFromSystem(system) {
  const text = [system?.name, system?.materialA, system?.formula].join(" ");
  if (/NiO2H2/i.test(text) || /Ni\(OH\)2/i.test(text)) return "NiO2H2";
  if (/NiOH/i.test(text)) return "NiOH";
  if (/NiO/i.test(text)) return "NiO";
  return "";
}

function normalizeSurfaceKey(value) {
  return String(value || "")
    .replace(/_on_/g, "_")
    .replace(/Pt111/g, "Pt")
    .replace(/3x3/g, "3")
    .replace(/4x4/g, "4")
    .replace(/2x2/g, "2")
    .replace(/root0*/gi, "root")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function getCurrentGraphPointKey() {
  if (!currentSystem) return "";
  return normalizeSurfaceKey(currentSystem.name);
}

function flattenEformGraphData() {
  if (!eformGraphDataset?.data) return [];
  return eformGraphDataset.data.flatMap(group =>
    (group.systems || []).map(point => ({
      material: group.material,
      surface: point.surface,
      ratio: Number(point.ratio),
      eform: Number(point.eform_eV_per_Ni),
      energy: Number(point.interface_energy_eV),
      key: normalizeSurfaceKey(point.surface)
    }))
  ).filter(point => Number.isFinite(point.ratio) && Number.isFinite(point.eform));
}

function renderEformGraph() {
  const graph = document.getElementById("eformGraph");
  const legend = document.getElementById("eformGraphLegend");
  const status = document.getElementById("eformGraphStatus");
  if (!graph || !legend) return;

  const allPoints = flattenEformGraphData();
  if (!allPoints.length) {
    graph.innerHTML = "";
    legend.innerHTML = "";
    if (status && !status.textContent) status.textContent = "No Eform graph data available yet.";
    return;
  }

  const inferredMaterial = inferEformMaterialFromSystem(currentSystem);
  const material = activeEformGraphMaterial === "all" ? "all" : activeEformGraphMaterial || inferredMaterial || "all";
  const points = material === "all" ? allPoints : allPoints.filter(point => point.material === material);
  updateGraphControlState(material);

  const currentKey = getCurrentGraphPointKey();
  const xMin = Math.min(...points.map(point => point.ratio));
  const xMax = Math.max(...points.map(point => point.ratio));
  const yMin = Math.min(...points.map(point => point.eform));
  const yMax = Math.max(...points.map(point => point.eform));
  const padX = Math.max(0.015, (xMax - xMin) * 0.08);
  const padY = Math.max(0.08, (yMax - yMin) * 0.12);

  const width = 920;
  const height = 460;
  const margin = { top: 28, right: 34, bottom: 64, left: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const scaleX = value => margin.left + ((value - (xMin - padX)) / ((xMax + padX) - (xMin - padX))) * plotW;
  const scaleY = value => margin.top + (1 - ((value - (yMin - padY)) / ((yMax + padY) - (yMin - padY)))) * plotH;
  const ticksX = [0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00].filter(value => value >= xMin - padX && value <= xMax + padX);
  const ticksY = makeTicks(yMin - padY, yMax + padY, 6);
  const materialClass = { NiO2H2: "series-nio2h2", NiOH: "series-nioh", NiO: "series-nio" };
  const materialLabel = { NiO2H2: "NiO₂H₂", NiOH: "NiOH", NiO: "NiO" };
  const grouped = points.reduce((acc, point) => {
    acc[point.material] = acc[point.material] || [];
    acc[point.material].push(point);
    return acc;
  }, {});

  const zeroY = scaleY(0);
  const zeroLine = zeroY >= margin.top && zeroY <= margin.top + plotH
    ? `<line class="graph-zero" x1="${margin.left}" y1="${zeroY}" x2="${width - margin.right}" y2="${zeroY}" />`
    : "";

  const grid = ticksY.map(tick => `
    <g>
      <line class="graph-grid" x1="${margin.left}" y1="${scaleY(tick)}" x2="${width - margin.right}" y2="${scaleY(tick)}" />
      <text class="graph-axis-text" x="${margin.left - 12}" y="${scaleY(tick) + 4}" text-anchor="end">${tick.toFixed(2)}</text>
    </g>`).join("");

  const xAxis = ticksX.map(tick => `
    <g>
      <line class="graph-tick" x1="${scaleX(tick)}" y1="${height - margin.bottom}" x2="${scaleX(tick)}" y2="${height - margin.bottom + 6}" />
      <text class="graph-axis-text" x="${scaleX(tick)}" y="${height - margin.bottom + 24}" text-anchor="middle">${tick.toFixed(2)}</text>
    </g>`).join("");

  const seriesSvg = Object.entries(grouped).map(([groupMaterial, groupPoints]) => {
    const sorted = groupPoints.slice().sort((a, b) => a.ratio - b.ratio);
    const path = sorted.map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(point.ratio).toFixed(2)} ${scaleY(point.eform).toFixed(2)}`).join(" ");
    const pointSvg = sorted.map(point => {
      const isCurrent = currentKey && point.key && (currentKey.includes(point.key) || point.key.includes(currentKey));
      return `
        <g class="graph-point-wrap ${isCurrent ? "is-current" : ""}" tabindex="0">
          <circle class="graph-point ${materialClass[groupMaterial] || ""}" cx="${scaleX(point.ratio)}" cy="${scaleY(point.eform)}" r="${isCurrent ? 7 : 5}" />
          <title>${materialLabel[groupMaterial] || groupMaterial}: ${point.surface}
Ratio: ${point.ratio.toFixed(4)}
Eform: ${point.eform.toFixed(4)} eV/Ni
Energy: ${point.energy.toFixed(4)} eV</title>
        </g>`;
    }).join("");
    return `<path class="graph-line ${materialClass[groupMaterial] || ""}" d="${path}" />${pointSvg}`;
  }).join("");

  graph.innerHTML = `
    <svg class="eform-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}" rx="18" />
      ${grid}
      ${zeroLine}
      <line class="graph-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" />
      <line class="graph-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" />
      ${xAxis}
      ${seriesSvg}
      <text class="graph-axis-label" x="${width / 2}" y="${height - 18}" text-anchor="middle">Ratio</text>
      <text class="graph-axis-label" transform="translate(22 ${height / 2}) rotate(-90)" text-anchor="middle">Eform (eV/Ni)</text>
    </svg>
  `;

  legend.innerHTML = Object.keys(grouped).map(groupMaterial => `
    <span class="graph-legend-item"><span class="graph-legend-swatch ${materialClass[groupMaterial] || ""}"></span>${materialLabel[groupMaterial] || groupMaterial}</span>
  `).join("") + `<span class="graph-legend-note">Highlighted point = current opened system when matched</span>`;
  if (status) status.textContent = "";
}

function makeTicks(min, max, count) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min || 0];
  const step = (max - min) / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}

function updateGraphControlState(material) {
  document.querySelectorAll(".graph-filter").forEach(button => {
    button.classList.toggle("active", button.dataset.material === material);
  });
}

function goToEformGraph() {
  const detailPage = document.getElementById("detailPage");
  const graphSection = document.getElementById("graphSection");
  if (!detailPage || !graphSection || !currentSystem) return;
  if (detailPage.classList.contains("hidden")) showPage("detailPage");
  window.requestAnimationFrame(() => scrollToSection("graphSection"));
}

function downloadCurrentFile(type) {
  if (!currentSystem) return;

  const extensionMap = {
    json: "json",
    incar: "INCAR",
    poscar: "POSCAR",
    kpoints: "KPOINTS"
  };
  const content = currentSystem.files[type];
  const filename = type === "json" ? `${currentSystem.name}.json` : `${currentSystem.name}_${extensionMap[type]}`;
  const blob = new Blob([content], { type: type === "json" ? "application/json" : "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showPage(pageId) {
  const targetPage = document.getElementById(pageId);
  if (!targetPage) return;

  const pages = document.querySelectorAll(".page");
  pages.forEach(page => page.classList.add("hidden"));
  targetPage.classList.remove("hidden");

  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.page === pageId));

  ensurePeriodicTablesAreVisible();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  resizeCrystalViewer(false);
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
}

function updateStats() {
  const substrates = new Set(databaseSystems.flatMap(system => system.substrateElements));
  const sourceSheets = new Set(databaseSystems.map(system => system.sourceSheet).filter(Boolean));
  const overlayerDataset = getDatasetForExplorer("overlayerExplorer");
  const substrateDataset = getDatasetForExplorer("substrateExplorer");
  const bulkDataset = getDatasetForExplorer("bulkExplorer");
  const overlayers = new Set(overlayerDataset.flatMap(system => system.overlayerElements));
  const substrateOnlyElements = new Set(substrateDataset.flatMap(system => system.substrateElements));
  const bulkElements = new Set(bulkDataset.flatMap(system => getSystemElementsForExplorer(system, "bulkExplorer")));

  setText("statSystems", databaseSystems.length);
  setText("statSubstrates", substrates.size);
  setText("statSourceSheets", sourceSheets.size);
  setText("statOverlayerSystems", overlayerDataset.length);
  setText("statOverlayerElements", overlayers.size);
  setText("statSubstrateSystems", substrateDataset.length);
  setText("statSubstrateElements", substrateOnlyElements.size);
  setText("statBulkSystems", bulkDataset.length);
  setText("statBulkElements", bulkElements.size);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function initializeElementSymbolList() {
  ELEMENT_SYMBOLS.splice(0, ELEMENT_SYMBOLS.length, ...PERIODIC_ELEMENTS.map(element => element.symbol).sort((a, b) => b.length - a.length));
}

function ensurePeriodicTablesAreVisible() {
  const tableTypes = [
    ["overlayerTable", "overlayer"],
    ["substrateTable", "substrate"],
    ["overlayerExplorerTable", "overlayerExplorer"],
    ["substrateExplorerTable", "substrateExplorer"],
    ["bulkExplorerTable", "bulkExplorer"]
  ];

  tableTypes.forEach(([tableId, type]) => {
    const table = document.getElementById(tableId);
    if (table && table.children.length === 0) buildPeriodicTable(tableId, type);
  });

  ["overlayer", "substrate", "overlayerExplorer", "substrateExplorer", "bulkExplorer"].forEach(refreshSelectionUI);
}

function initializeApp() {
  initializeElementSymbolList();
  ensurePeriodicTablesAreVisible();
  loadDatabaseFromJson();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
