const elements = [
  { symbol: "H", number: 1, row: 1, col: 1 },
  { symbol: "He", number: 2, row: 1, col: 18 },

  { symbol: "Li", number: 3, row: 2, col: 1 },
  { symbol: "Be", number: 4, row: 2, col: 2 },
  { symbol: "B", number: 5, row: 2, col: 13 },
  { symbol: "C", number: 6, row: 2, col: 14 },
  { symbol: "N", number: 7, row: 2, col: 15 },
  { symbol: "O", number: 8, row: 2, col: 16 },
  { symbol: "F", number: 9, row: 2, col: 17 },
  { symbol: "Ne", number: 10, row: 2, col: 18 },

  { symbol: "Na", number: 11, row: 3, col: 1 },
  { symbol: "Mg", number: 12, row: 3, col: 2 },
  { symbol: "Al", number: 13, row: 3, col: 13 },
  { symbol: "Si", number: 14, row: 3, col: 14 },
  { symbol: "P", number: 15, row: 3, col: 15 },
  { symbol: "S", number: 16, row: 3, col: 16 },
  { symbol: "Cl", number: 17, row: 3, col: 17 },
  { symbol: "Ar", number: 18, row: 3, col: 18 },

  { symbol: "K", number: 19, row: 4, col: 1 },
  { symbol: "Ca", number: 20, row: 4, col: 2 },
  { symbol: "Sc", number: 21, row: 4, col: 3 },
  { symbol: "Ti", number: 22, row: 4, col: 4 },
  { symbol: "V", number: 23, row: 4, col: 5 },
  { symbol: "Cr", number: 24, row: 4, col: 6 },
  { symbol: "Mn", number: 25, row: 4, col: 7 },
  { symbol: "Fe", number: 26, row: 4, col: 8 },
  { symbol: "Co", number: 27, row: 4, col: 9 },
  { symbol: "Ni", number: 28, row: 4, col: 10 },
  { symbol: "Cu", number: 29, row: 4, col: 11 },
  { symbol: "Zn", number: 30, row: 4, col: 12 },
  { symbol: "Ga", number: 31, row: 4, col: 13 },
  { symbol: "Ge", number: 32, row: 4, col: 14 },
  { symbol: "As", number: 33, row: 4, col: 15 },
  { symbol: "Se", number: 34, row: 4, col: 16 },
  { symbol: "Br", number: 35, row: 4, col: 17 },
  { symbol: "Kr", number: 36, row: 4, col: 18 },

  { symbol: "Rb", number: 37, row: 5, col: 1 },
  { symbol: "Sr", number: 38, row: 5, col: 2 },
  { symbol: "Y", number: 39, row: 5, col: 3 },
  { symbol: "Zr", number: 40, row: 5, col: 4 },
  { symbol: "Nb", number: 41, row: 5, col: 5 },
  { symbol: "Mo", number: 42, row: 5, col: 6 },
  { symbol: "Tc", number: 43, row: 5, col: 7 },
  { symbol: "Ru", number: 44, row: 5, col: 8 },
  { symbol: "Rh", number: 45, row: 5, col: 9 },
  { symbol: "Pd", number: 46, row: 5, col: 10 },
  { symbol: "Ag", number: 47, row: 5, col: 11 },
  { symbol: "Cd", number: 48, row: 5, col: 12 },
  { symbol: "In", number: 49, row: 5, col: 13 },
  { symbol: "Sn", number: 50, row: 5, col: 14 },
  { symbol: "Sb", number: 51, row: 5, col: 15 },
  { symbol: "Te", number: 52, row: 5, col: 16 },
  { symbol: "I", number: 53, row: 5, col: 17 },
  { symbol: "Xe", number: 54, row: 5, col: 18 },

  { symbol: "Cs", number: 55, row: 6, col: 1 },
  { symbol: "Ba", number: 56, row: 6, col: 2 },
  { symbol: "La", number: 57, row: 6, col: 3 },
  { symbol: "Hf", number: 72, row: 6, col: 4 },
  { symbol: "Ta", number: 73, row: 6, col: 5 },
  { symbol: "W", number: 74, row: 6, col: 6 },
  { symbol: "Re", number: 75, row: 6, col: 7 },
  { symbol: "Os", number: 76, row: 6, col: 8 },
  { symbol: "Ir", number: 77, row: 6, col: 9 },
  { symbol: "Pt", number: 78, row: 6, col: 10 },
  { symbol: "Au", number: 79, row: 6, col: 11 },
  { symbol: "Hg", number: 80, row: 6, col: 12 },
  { symbol: "Tl", number: 81, row: 6, col: 13 },
  { symbol: "Pb", number: 82, row: 6, col: 14 },
  { symbol: "Bi", number: 83, row: 6, col: 15 },
  { symbol: "Po", number: 84, row: 6, col: 16 },
  { symbol: "At", number: 85, row: 6, col: 17 },
  { symbol: "Rn", number: 86, row: 6, col: 18 },

  { symbol: "Fr", number: 87, row: 7, col: 1 },
  { symbol: "Ra", number: 88, row: 7, col: 2 },
  { symbol: "Ac", number: 89, row: 7, col: 3 },
  { symbol: "Rf", number: 104, row: 7, col: 4 },
  { symbol: "Db", number: 105, row: 7, col: 5 },
  { symbol: "Sg", number: 106, row: 7, col: 6 },
  { symbol: "Bh", number: 107, row: 7, col: 7 },
  { symbol: "Hs", number: 108, row: 7, col: 8 },
  { symbol: "Mt", number: 109, row: 7, col: 9 },
  { symbol: "Ds", number: 110, row: 7, col: 10 },
  { symbol: "Rg", number: 111, row: 7, col: 11 },
  { symbol: "Cn", number: 112, row: 7, col: 12 },
  { symbol: "Nh", number: 113, row: 7, col: 13 },
  { symbol: "Fl", number: 114, row: 7, col: 14 },
  { symbol: "Mc", number: 115, row: 7, col: 15 },
  { symbol: "Lv", number: 116, row: 7, col: 16 },
  { symbol: "Ts", number: 117, row: 7, col: 17 },
  { symbol: "Og", number: 118, row: 7, col: 18 },

  // Lanthanides
  { symbol: "Ce", number: 58, row: 9, col: 4 },
  { symbol: "Pr", number: 59, row: 9, col: 5 },
  { symbol: "Nd", number: 60, row: 9, col: 6 },
  { symbol: "Pm", number: 61, row: 9, col: 7 },
  { symbol: "Sm", number: 62, row: 9, col: 8 },
  { symbol: "Eu", number: 63, row: 9, col: 9 },
  { symbol: "Gd", number: 64, row: 9, col: 10 },
  { symbol: "Tb", number: 65, row: 9, col: 11 },
  { symbol: "Dy", number: 66, row: 9, col: 12 },
  { symbol: "Ho", number: 67, row: 9, col: 13 },
  { symbol: "Er", number: 68, row: 9, col: 14 },
  { symbol: "Tm", number: 69, row: 9, col: 15 },
  { symbol: "Yb", number: 70, row: 9, col: 16 },
  { symbol: "Lu", number: 71, row: 9, col: 17 },

  // Actinides
  { symbol: "Th", number: 90, row: 10, col: 4 },
  { symbol: "Pa", number: 91, row: 10, col: 5 },
  { symbol: "U", number: 92, row: 10, col: 6 },
  { symbol: "Np", number: 93, row: 10, col: 7 },
  { symbol: "Pu", number: 94, row: 10, col: 8 },
  { symbol: "Am", number: 95, row: 10, col: 9 },
  { symbol: "Cm", number: 96, row: 10, col: 10 },
  { symbol: "Bk", number: 97, row: 10, col: 11 },
  { symbol: "Cf", number: 98, row: 10, col: 12 },
  { symbol: "Es", number: 99, row: 10, col: 13 },
  { symbol: "Fm", number: 100, row: 10, col: 14 },
  { symbol: "Md", number: 101, row: 10, col: 15 },
  { symbol: "No", number: 102, row: 10, col: 16 },
  { symbol: "Lr", number: 103, row: 10, col: 17 }
];

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

function buildPeriodicTable(containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  elements.forEach(element => {
    const button = document.createElement("button");
    button.className = "element";
    button.style.gridRow = element.row;
    button.style.gridColumn = element.col;

    button.innerHTML = `
      <span class="atomic-number">${element.number}</span>
      <span class="element-symbol">${element.symbol}</span>
    `;

    button.addEventListener("click", () => {
      toggleElement(element.symbol, type, button);
    });

    container.appendChild(button);
  });
}

function toggleElement(element, type, button) {
  if (type === "overlayer") {
    if (selectedOverlayer.includes(element)) {
      selectedOverlayer = selectedOverlayer.filter(e => e !== element);
      button.classList.remove("selected");
    } else {
      selectedOverlayer.push(element);
      button.classList.add("selected");
    }

    updateSelectedText("selectedOverlayer", selectedOverlayer);
  }

  if (type === "substrate") {
    if (selectedSubstrate.includes(element)) {
      selectedSubstrate = selectedSubstrate.filter(e => e !== element);
      button.classList.remove("selected");
    } else {
      selectedSubstrate.push(element);
      button.classList.add("selected");
    }

    updateSelectedText("selectedSubstrate", selectedSubstrate);
  }
}

function updateSelectedText(id, selectedList) {
  const target = document.getElementById(id);

  if (selectedList.length === 0) {
    target.textContent = "None";
  } else {
    target.textContent = selectedList.join(", ");
  }
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

  renderResults(matches);
  showPage("resultsPage");
}

function renderResults(systems) {
  const resultsBody = document.getElementById("resultsBody");
  resultsBody.innerHTML = "";

  if (systems.length === 0) {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="4">No systems matched your search.</td>
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
      <td>${system.finalEnergy}</td>
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
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({
    behavior: "smooth"
  });
}

buildPeriodicTable("overlayerTable", "overlayer");
buildPeriodicTable("substrateTable", "substrate");
