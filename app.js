// Task App — save, display, complete and delete tasks with localStorage

const STORAGE_KEY = "tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const clearBtn = document.getElementById("clear-completed");

// Load saved tasks (or start with an empty list)
let tasks = loadTasks();

// Unique ID per task. Date.now() alone collides when two tasks are added in the same millisecond.
function newId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadTasks() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
  // Repair duplicate IDs left over from the old Date.now() scheme
  const seen = new Set();
  let repaired = false;
  for (const task of saved) {
    if (seen.has(task.id)) {
      task.id = newId();
      repaired = true;
    }
    seen.add(task.id);
  }
  if (repaired) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// The "Clear completed" button is only shown while at least one task is done
function updateClearButton() {
  clearBtn.hidden = !tasks.some((t) => t.done);
}

function renderTasks() {
  list.innerHTML = "";
  updateClearButton();

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
  tasks.push({ id: newId(), text, done: false });
  saveTasks();
  renderTasks();
}

function toggleDone(id, done, li) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = done;
  saveTasks();
  li.classList.toggle("done", done); // update in place so the strikethrough animates
  updateClearButton();
}

// Remove every done task at once; all done rows slide out together first
function clearCompleted() {
  const doneIds = new Set(tasks.filter((t) => t.done).map((t) => t.id));
  if (doneIds.size === 0) return;

  if (document.activeElement === clearBtn) input.focus(); // the button is about to hide

  const rows = [...list.querySelectorAll(".task.done:not(.removing)")];
  removeTasks(doneIds, rows);
}

clearBtn.addEventListener("click", clearCompleted);

// Remove tasks from the data right away, then let their rows slide out.
// Because the data is already updated, a re-render during the animation can't bring
// a row back, and the leaving rows are disabled so they can't be ticked/unticked.
function removeTasks(ids, rows) {
  tasks = tasks.filter((t) => !ids.has(t.id));
  saveTasks();
  updateClearButton();

  if (rows.some((li) => li.contains(document.activeElement))) input.focus(); // keyboard users keep their place

  rows.forEach((li) => {
    li.classList.add("removing");
    li.querySelectorAll("input, button").forEach((el) => (el.disabled = true));

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      li.remove();
      if (tasks.length === 0 && !list.querySelector(".task")) renderTasks(); // show the empty placeholder
    };
    li.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 500); // fallback in case the animation doesn't run (e.g. background tab)
  });
}

function deleteTask(id, li) {
  removeTasks(new Set([id]), [li]);
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
