const STORAGE_KEY = "tasquesKanban";

let tasques = [];

// Carrega tasques del localStorage
function carregarTasques() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Desa tasques al localStorage
function guardarTasques(tasques) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// Inicialització
function init() {
  console.log("init executat");
  tasques = carregarTasques();
  console.log("Tasques carregades:", tasques);
}

document.addEventListener("DOMContentLoaded", init);

