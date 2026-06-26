const elements = [
  "H", "C", "N", "O", "F", "Na", "Mg", "Al",
  "Si", "P", "S", "Cl", "K", "Ca", "Ti", "V",
  "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga",
  "Ge", "As", "Se", "Br", "Pd", "Ag", "Cd", "In",
  "Sn", "Pt", "Au", "Hg"
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
    button.textContent = element;

    button.addEventListener("click", () => {
      toggleElement(element, type, button);
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