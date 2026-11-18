// Task App — save, display, complete and delete tasks with localStorage

const STORAGE_KEY = "tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");

// Load saved tasks (or start with an empty list)
let tasks = loadTasks();

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet — add one above ✨";
    list.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "done-checkbox";
    checkbox.checked = !!task.done;
    checkbox.title = "Mark as done";
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as done`);
    checkbox.addEventListener("change", () => toggleDone(task.id, checkbox.checked, li));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.setAttribute("aria-label", `Delete "${task.text}"`);
    del.textContent = "✕";
    del.title = "Delete task";
    del.addEventListener("click", () => deleteTask(task.id, li));

    li.append(checkbox, text, del);
    list.appendChild(li);
  });
}

function addTask(text) {
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
}

function toggleDone(id, done, li) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = done;
  saveTasks();
  li.classList.toggle("done", done); // update in place so the strikethrough animates
}

function deleteTask(id, li) {
  const hadFocus = li.contains(document.activeElement);
  li.classList.add("removing");
  li.addEventListener("animationend", () => {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
    if (hadFocus) input.focus(); // keyboard users don't lose their place when the row disappears
  }, { once: true });
}

form.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

renderTasks();
