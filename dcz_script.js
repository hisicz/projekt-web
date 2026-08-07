// Najde pole, do kterého uživatel píše nový úkol.
const input = document.querySelector('#taskInput');
// Najde seznam, do kterého se budou vypisovat úkoly.
const list = document.querySelector('#taskList');
// Najde zelený proužek s postupem.
const progress = document.querySelector('#progressBar');
// Najde text s procenty hotových úkolů.
const progressText = document.querySelector('#progressText');

// Načte úkoly z paměti prohlížeče, nebo vytvoří prázdný seznam.
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// Uloží aktuální seznam úkolů do paměti prohlížeče.
function saveTasks() {
  // Převede seznam úkolů na text a uloží ho pod názvem „tasks“.
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Zobrazí úkoly a aktualizuje procenta.
function render() {
  // Vymaže starý seznam, aby se položky neduplikovaly.
  list.innerHTML = '';

  // Projde každý úkol a jeho pořadí v seznamu.
  tasks.forEach((task, index) => {
    // Vytvoří jednu položku seznamu <li>.
    const item = document.createElement('li');
    // Přidá checkbox, text úkolu a tlačítko pro smazání.
    item.innerHTML = `
      <label class="task">
        <input type="checkbox" ${task.done ? 'checked' : ''}>
        <span class="${task.done ? 'completed' : ''}"></span>
      </label>
      <button class="delete" type="button">Smazat</button>`;

    // Vloží text úkolu do prázdného prvku <span>.
    item.querySelector('span').textContent = task.text;
    // Reaguje na zaškrtnutí nebo odškrtnutí úkolu.
    item.querySelector('input').addEventListener('change', (event) => {
      // Zapíše, jestli je úkol hotový: true nebo false.
      tasks[index].done = event.target.checked;
      // Uloží změněný seznam.
      saveTasks();
      // Znovu zobrazí seznam i procenta.
      render();
    });
    // Reaguje na kliknutí na tlačítko „Smazat“.
    item.querySelector('.delete').addEventListener('click', () => {
      // Odstraní jeden úkol na aktuálním pořadí.
      tasks.splice(index, 1);
      // Uloží seznam bez smazaného úkolu.
      saveTasks();
      // Znovu zobrazí aktuální seznam.
      render();
    });
    // Vloží hotovou položku do seznamu na stránce.
    list.append(item);
  });

  // Spočítá, kolik úkolů má hodnotu done nastavenou na true.
  const completed = tasks.filter((task) => task.done).length;
  // Vypočítá procento hotových úkolů; u prázdného seznamu je nula.
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  // Nastaví šířku zeleného proužku, například na 50 %.
  progress.style.width = `${percent}%`;
  // Zobrazí procento jako text.
  progressText.textContent = `${percent} % hotovo`;
}

// Přidá nový úkol ze vstupního pole.
function addTask() {
  // Přečte text a odstraní mezery na začátku a konci.
  const text = input.value.trim();
  // Pokud uživatel nic nenapsal, funkce skončí.
  if (!text) return;

  // Přidá nový nesplněný úkol do seznamu.
  tasks.push({ text, done: false });
  // Vymaže vstupní pole po přidání.
  input.value = '';
  // Uloží nový seznam úkolů.
  saveTasks();
  // Zobrazí nový úkol na stránce.
  render();
}

// Po kliknutí na tlačítko spustí přidání úkolu.
document.querySelector('#addBtn').addEventListener('click', addTask);
// Sleduje stisk klávesy ve vstupním poli.
input.addEventListener('keydown', (event) => {
  // Klávesa Enter přidá úkol stejně jako tlačítko.
  if (event.key === 'Enter') addTask();
});
// Po kliknutí na tlačítko nechá jen nesplněné úkoly.
document.querySelector('#clearBtn').addEventListener('click', () => {
  // Odstraní úkoly, které jsou hotové.
  tasks = tasks.filter((task) => !task.done);
  // Uloží zkrácený seznam.
  saveTasks();
  // Zobrazí seznam bez hotových úkolů.
  render();
});

// Poprvé zobrazí uložené úkoly po otevření stránky.
render();
