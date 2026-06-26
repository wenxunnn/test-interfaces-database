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

const fakeSystems = [
  {
    name: "CoOOH_root28_on_Pt111_root39",
    overlayerElements: ["Co", "O", "H"],
    substrateElements: ["Pt"],
    method: "vdW-DF",
    spin: "AFM",
    uValue: "U = 3",
    finalEnergy: "-1006.005873 eV"
  },
  {
    name: "NiO_root13_on_Pt111_4x4",
    overlayerElements: ["Ni", "O"],
    substrateElements: ["Pt"],
    method: "vdW-DF",
    spin: "FM",
    uValue: "U = 5",
    finalEnergy: "-277.897810 eV"
  },
  {
    name: "NiOH_root3_on_Pt111_2x2",
    overlayerElements: ["Ni", "O", "H"],
    substrateElements: ["Pt"],
    method: "vdW-DF",
    spin: "FM",
    uValue: "U = 5",
    finalEnergy: "-82.073680 eV"
  },
  {
    name: "MnO_root13_on_Pt111_4x4",
    overlayerElements: ["Mn", "O"],
    substrateElements: ["Pt"],
    method: "vdW-DF",
    spin: "AFM",
    uValue: "U = 3.7",
    finalEnergy: "-214.408340 eV"
  },
  {
    name: "FeOOH_root28_on_Pd111_root39",
    overlayerElements: ["Fe", "O", "H"],
    substrateElements: ["Pd"],
    method: "PBE+U",
    spin: "AFM",
    uValue: "U = 4",
    finalEnergy: "-884.221010 eV"
  }
];

function elementBySymbol(symbol) {
  return PERIODIC_ELEMENTS.find(e => e.symbol === symbol);
}

function buildPeriodicTable(containerId, type) {
  const container = document.getElementById(containerId);
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

    button.addEventListener("click", () => {
      toggleElement(element.symbol, type, button);
    });

    button.addEventListener("mouseenter", () => {
      showElementPreview(type, element.symbol);
    });

    container.appendChild(button);
  });

  buildLegend(containerId, type);
}

function buildLegend(containerId, type) {
  const legendId = type === "overlayer" ? "overlayerLegend" : "substrateLegend";
  const legend = document.getElementById(legendId);
  legend.innerHTML = "";

  // only show categories actually present in the table, in a sensible order
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
  const previewId = type === "overlayer" ? "overlayerPreview" : "substratePreview";
  const preview = document.getElementById(previewId);
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
  const list = type === "overlayer" ? selectedOverlayer : selectedSubstrate;
  const isSelected = list.includes(symbol);

  if (isSelected) {
    const updated = list.filter(e => e !== symbol);
    if (type === "overlayer") {
      selectedOverlayer = updated;
    } else {
      selectedSubstrate = updated;
    }
    button.classList.remove("selected");
  } else {
    if (type === "overlayer") {
      selectedOverlayer.push(symbol);
    } else {
      selectedSubstrate.push(symbol);
    }
    button.classList.add("selected");
  }

  refreshSelectionUI(type);
}

function removeElement(symbol, type) {
  if (type === "overlayer") {
    selectedOverlayer = selectedOverlayer.filter(e => e !== symbol);
  } else {
    selectedSubstrate = selectedSubstrate.filter(e => e !== symbol);
  }

  const tableId = type === "overlayer" ? "overlayerTable" : "substrateTable";
  const button = document.querySelector(`#${tableId} [data-symbol="${symbol}"]`);
  if (button) button.classList.remove("selected");

  refreshSelectionUI(type);
}

function refreshSelectionUI(type) {
  const list = type === "overlayer" ? selectedOverlayer : selectedSubstrate;
  const badgeId = type === "overlayer" ? "overlayerBadge" : "substrateBadge";
  const emptyId = type === "overlayer" ? "selectedOverlayerEmpty" : "selectedSubstrateEmpty";
  const chipsId = type === "overlayer" ? "selectedOverlayerChips" : "selectedSubstrateChips";

  const badge = document.getElementById(badgeId);
  badge.textContent = `${list.length} selected`;
  badge.classList.toggle("empty", list.length === 0);

  const emptyLabel = document.getElementById(emptyId);
  const chipsContainer = document.getElementById(chipsId);
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

function clearAllSelections() {
  selectedOverlayer = [];
  selectedSubstrate = [];

  document.querySelectorAll(".element.selected").forEach(el => el.classList.remove("selected"));
  refreshSelectionUI("overlayer");
  refreshSelectionUI("substrate");
}

function searchSystems() {
  const matches = fakeSystems.filter(system => {
    const overlayerMatch =
      selectedOverlayer.length === 0 ||
      selectedOverlayer.every(element =>
        system.overlayerElements.includes(element)
      );

    const substrateMatch =
      selectedSubstrate.length === 0 ||
      selectedSubstrate.every(element =>
        system.substrateElements.includes(element)
      );

    return overlayerMatch && substrateMatch;
  });

  renderActiveFiltersBar();
  renderResults(matches);
  showPage("resultsPage");
}

function renderActiveFiltersBar() {
  const bar = document.getElementById("activeFiltersBar");
  bar.innerHTML = "";

  if (selectedOverlayer.length === 0 && selectedSubstrate.length === 0) {
    bar.innerHTML = `<span>Showing all systems &mdash; no filters applied.</span>`;
    return;
  }

  if (selectedOverlayer.length > 0) {
    bar.innerHTML += `<span>Overlayer: <strong class="mono">${selectedOverlayer.join(", ")}</strong></span>`;
  }
  if (selectedSubstrate.length > 0) {
    bar.innerHTML += `<span>Substrate: <strong class="mono">${selectedSubstrate.join(", ")}</strong></span>`;
  }
}

function renderResults(systems) {
  const resultsBody = document.getElementById("resultsBody");
  const resultsCount = document.getElementById("resultsCount");
  resultsBody.innerHTML = "";

  resultsCount.innerHTML = `<strong>${systems.length}</strong> ${systems.length === 1 ? "system" : "systems"} found`;

  if (systems.length === 0) {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <div class="empty-state-title">No systems matched your search</div>
          Try removing an element or two, or clear your filters and search again.
        </td>
      </tr>
    `;
    return;
  }

  systems.forEach(system => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <span class="system-link">${system.name}</span>
      </td>
      <td>${system.method}</td>
      <td>${system.spin}, ${system.uValue}</td>
      <td class="mono-cell">${system.finalEnergy}</td>
    `;

    row.querySelector(".system-link").addEventListener("click", () => {
      openSystemDetail(system);
    });

    resultsBody.appendChild(row);
  });
}

function openSystemDetail(system) {
  document.getElementById("detailTitle").textContent = system.name;
  document.getElementById("detailEnergy").textContent = system.finalEnergy;
  document.getElementById("detailU").textContent = system.uValue;
  document.getElementById("detailMethod").textContent = system.method;
  document.getElementById("detailSpin").textContent = system.spin;
  document.getElementById("detailOverlayer").textContent =
    system.overlayerElements.join(", ");
  document.getElementById("detailSubstrate").textContent =
    system.substrateElements.join(", ");

  showPage("detailPage");
}

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.add("hidden");
  });

  document.getElementById(pageId).classList.remove("hidden");

  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => tab.classList.remove("active"));

  if (pageId === "aboutPage") {
    tabs[0].classList.add("active");
  } else {
    tabs[1].classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({
    behavior: "smooth"
  });
}

buildPeriodicTable("overlayerTable", "overlayer");
buildPeriodicTable("substrateTable", "substrate");
refreshSelectionUI("overlayer");
refreshSelectionUI("substrate");
