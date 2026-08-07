// Najdeme prvky z HTML.
const input = document.querySelector('#taskInput');
const list = document.querySelector('#taskList');
const progress = document.querySelector('#progressBar');
const progressText = document.querySelector('#progressText');

// Úkoly jsou uložené v prohlížeči, takže po obnovení stránky nezmizí.
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render() {
    list.innerHTML = '';

    tasks.forEach((task, index) => {
        const item = document.createElement('li');
        item.innerHTML = `
      <label class="task">
        <input type="checkbox" ${task.done ? 'checked' : ''}>
        <span class="${task.done ? 'completed' : ''}"></span>
      </label>
      <button class="delete" type="button">Smazat</button>`;

        item.querySelector('span').textContent = task.text;
        item.querySelector('input').addEventListener('change', (event) => {
            tasks[index].done = event.target.checked;
            saveTasks();
            render();

        });
        item.querySelector('.delete').addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            render();


        });
        list.append(item);
    });

    const completed = tasks.filter((task) => task.done).length;
    const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    progress.style.width = `${percent}%`;
    progressText.textContent = `${percent} % hotovo`;
}

function addTask() {
    const text = input.value.trim();
    if (!text) return;

    tasks.push({ text, done: false });
    input.value = '';
    saveTasks();
    render();
}

document.querySelector('#addBtn').addEventListener('click', addTask);
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addTask();
});
document.querySelector('#clearBtn').addEventListener('click', () => {
    tasks = tasks.filter((task) => !task.done);
    saveTasks();
    render();
});

render();