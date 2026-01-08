const STORAGE_KEY = "tasquesKanban";

let tasques = [];

let tascaEditantId = null;

const form = document.getElementById("task-form");
const inputTitol = document.getElementById("titol");
const inputDescripcio = document.getElementById("descripcio");
const selectPrioritat = document.getElementById("prioritat");
const inputData = document.getElementById("dataVenciment");

const colPerFer = document.getElementById("perFer");
const colEnCurs = document.getElementById("enCurs");
const colFet = document.getElementById("fet");

const filterEstat = document.getElementById("filter-estat");
const filterPrioritat = document.getElementById("filter-prioritat");
const searchText = document.getElementById("search-text");

const statTotal = document.getElementById("stat-total");
const statPerFer = document.getElementById("stat-perfer");
const statEnCurs = document.getElementById("stat-encurs");
const statFet = document.getElementById("stat-fet");
const statPercent = document.getElementById("stat-percent");


const filtres = {
  estat: "tots",
  prioritat: "totes",
  text: "",
};

// Carrega tasques del localStorage
function carregarTasques() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Desa tasques al localStorage
function guardarTasques(tasques) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

function renderTauler(tasques) {
  colPerFer.innerHTML = "";
  colEnCurs.innerHTML = "";
  colFet.innerHTML = "";

  tasques.forEach((tasca) => {
    const card = document.createElement("div");
    card.classList.add("task-card", tasca.prioritat);

    const selectEstat = document.createElement("select");
    selectEstat.innerHTML = `
      <option value="perFer">Per fer</option>
      <option value="enCurs">En curs</option>
      <option value="fet">Fet</option>
    `;
    selectEstat.value = tasca.estat;

    selectEstat.addEventListener("change", () => {
      canviarEstat(tasca.id, selectEstat.value);
    });

    card.innerHTML = `
      <h4>${tasca.titol}</h4>
      <p>${tasca.descripcio || ""}</p>
      <small>Prioritat: ${tasca.prioritat}</small>
    `;

    card.appendChild(selectEstat);

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-editar");

    btnEditar.addEventListener("click", () => {
    carregarTascaAlFormulari(tasca.id);
});

    card.appendChild(btnEditar);

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("btn-eliminar");

    btnEliminar.addEventListener("click", () => {
    eliminarTasca(tasca.id);
});

  card.appendChild(btnEliminar);

    if (tasca.estat === "perFer") colPerFer.appendChild(card);
    else if (tasca.estat === "enCurs") colEnCurs.appendChild(card);
    else if (tasca.estat === "fet") colFet.appendChild(card);
  });
}

  function carregarTascaAlFormulari(id) {
  const tasca = tasques.find((t) => t.id === id);
  if (!tasca) return;

  inputTitol.value = tasca.titol;
  inputDescripcio.value = tasca.descripcio;
  selectPrioritat.value = tasca.prioritat;
  inputData.value = tasca.dataVenciment;

  tascaEditantId = id;

  form.querySelector("button[type='submit']").textContent =
    "Guardar canvis";
}

function canviarEstat(id, nouEstat) {
  const tasca = tasques.find((t) => t.id === id);
  if (!tasca) return;

  tasca.estat = nouEstat;
  guardarTasques(tasques);
  aplicarFiltres();
}

function eliminarTasca(id) {
  const confirmar = confirm("Segur que vols eliminar aquesta tasca?");
  if (!confirmar) return;

  tasques = tasques.filter((t) => t.id !== id);
  guardarTasques(tasques);
  aplicarFiltres();
}



// Inicialització
function init() {
  tasques = carregarTasques();
  aplicarFiltres();

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const titol = inputTitol.value.trim();
    if (!titol) {
      alert("El títol és obligatori");
      return;
    }

    if (tascaEditantId) {
  // MODE EDITAR
  const tasca = tasques.find((t) => t.id === tascaEditantId);
  if (!tasca) return;

  tasca.titol = titol;
  tasca.descripcio = inputDescripcio.value.trim();
  tasca.prioritat = selectPrioritat.value;
  tasca.dataVenciment = inputData.value;
} else {
  // MODE CREAR
  const novaTasca = {
    id: Date.now().toString(),
    titol: titol,
    descripcio: inputDescripcio.value.trim(),
    prioritat: selectPrioritat.value,
    dataVenciment: inputData.value,
    estat: "perFer",
    creatEl: new Date().toISOString(),
  };

  tasques.push(novaTasca);
}

guardarTasques(tasques);
aplicarFiltres();
form.reset();

tascaEditantId = null;
form.querySelector("button[type='submit']").textContent = "Afegir tasca";


  });

filterEstat.addEventListener("change", () => {
  filtres.estat = filterEstat.value;
  aplicarFiltres();
});

filterPrioritat.addEventListener("change", () => {
  filtres.prioritat = filterPrioritat.value;
  aplicarFiltres();
});

searchText.addEventListener("input", () => {
  filtres.text = searchText.value.toLowerCase();
  aplicarFiltres();
});

}

function getTasquesFiltrades(tasques, filtres) {
  return tasques.filter((tasca) => {
    const coincideixEstat =
      filtres.estat === "tots" || tasca.estat === filtres.estat;

    const coincideixPrioritat =
      filtres.prioritat === "totes" ||
      tasca.prioritat === filtres.prioritat;

    const text = filtres.text;
    const coincideixText =
      !text ||
      tasca.titol.toLowerCase().includes(text) ||
      (tasca.descripcio || "").toLowerCase().includes(text);

    return coincideixEstat && coincideixPrioritat && coincideixText;
  });
}

function aplicarFiltres() {
  const tasquesFiltrades = getTasquesFiltrades(tasques, filtres);
  renderTauler(tasquesFiltrades);
  actualitzarEstadistiques(tasques);
}

function actualitzarEstadistiques(tasques) {
  const total = tasques.length;

  const perFer = tasques.filter((t) => t.estat === "perFer").length;
  const enCurs = tasques.filter((t) => t.estat === "enCurs").length;
  const fet = tasques.filter((t) => t.estat === "fet").length;

  const percentatge =
    total === 0 ? 0 : Math.round((fet / total) * 100);

  statTotal.textContent = total;
  statPerFer.textContent = perFer;
  statEnCurs.textContent = enCurs;
  statFet.textContent = fet;
  statPercent.textContent = `${percentatge}%`;
}


document.addEventListener("DOMContentLoaded", init);
