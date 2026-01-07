const STORAGE_KEY = "tasquesKanban";

let tasques = [];

const form = document.getElementById("task-form");
const inputTitol = document.getElementById("titol");
const inputDescripcio = document.getElementById("descripcio");
const selectPrioritat = document.getElementById("prioritat");
const inputData = document.getElementById("dataVenciment");

const colPerFer = document.getElementById("perFer");
const colEnCurs = document.getElementById("enCurs");
const colFet = document.getElementById("fet");

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

function canviarEstat(id, nouEstat) {
  const tasca = tasques.find((t) => t.id === id);
  if (!tasca) return;

  tasca.estat = nouEstat;
  guardarTasques(tasques);
  renderTauler(tasques);
}

function eliminarTasca(id) {
  const confirmar = confirm("Segur que vols eliminar aquesta tasca?");
  if (!confirmar) return;

  tasques = tasques.filter((t) => t.id !== id);
  guardarTasques(tasques);
  renderTauler(tasques);
}



// Inicialització
function init() {
  tasques = carregarTasques();
  renderTauler(tasques);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const titol = inputTitol.value.trim();
    if (!titol) {
      alert("El títol és obligatori");
      return;
    }

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
    guardarTasques(tasques);
    renderTauler(tasques);
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", init);
