document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");
    const taskList = document.getElementById("taskList");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const clearBtn = document.getElementById("clearBtn");

    if (!taskInput || !addBtn || !taskList) return;

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateProgress() {
        if (tasks.length === 0) {
            progressBar.style.width = "0%";
            progressText.textContent = "0 % hotovo";
            return;
        }

        const completed = tasks.filter(task => task.done).length;
        const percent = Math.round((completed / tasks.length) * 100);

        progressBar.style.width = percent + "%";
        progressText.textContent = percent + " % hotovo";
    }

    function renderTasks() {
        taskList.innerHTML = "";

        tasks.forEach((task, index) => {

            const li = document.createElement("li");

            const taskDiv = document.createElement("div");
            taskDiv.className = "task";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.done;

            const span = document.createElement("span");
            span.textContent = task.text;

            if (task.done) {
                span.classList.add("completed");
            }

            checkbox.addEventListener("change", () => {
                tasks[index].done = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Smazat";
            deleteBtn.className = "delete";

            deleteBtn.addEventListener("click", () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            });

            taskDiv.appendChild(checkbox);
            taskDiv.appendChild(span);

            li.appendChild(taskDiv);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });

        updateProgress();
    }

    addBtn.addEventListener("click", () => {

        const text = taskInput.value.trim();

        if (text === "") return;

        tasks.push({
            text: text,
            done: false
        });

        taskInput.value = "";

        saveTasks();
        renderTasks();
    });

    taskInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addBtn.click();
        }
    });

    clearBtn.addEventListener("click", () => {
        tasks = tasks.filter(task => !task.done);
        saveTasks();
        renderTasks();
    });

    renderTasks();
});