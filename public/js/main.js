// FRONT-END (CLIENT) JAVASCRIPT HERE
async function checkLogin() {
  try {
    const res = await fetch('/me');
    if (res.status === 401) {
      showLogin();
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error(err);
    showLogin();
    return null;
  }
}

function showLogin() {
  const authSection = document.getElementById('auth-section');
  authSection.innerHTML = `
    <a href="/auth/github" id="login-btn">Login with GitHub</a>
    <p>If this is your first time, a new account will be created automatically.</p>
  `;
  document.getElementById('app').style.display = 'none';
}

function showApp(username) {
  document.getElementById('auth-section').style.display = 'none';
  const app = document.getElementById('app');
  app.style.display = 'block';
  fetchTodos();
}

// Allow function to run in background
const submit = async function (event) {
  event.preventDefault();

  const title = document.querySelector("#taskTitle"),
    taskDescription = document.querySelector("#taskDescription"),
    taskDueDate = document.querySelector("#taskDueDate"),
    json = {
      taskTitle: title.value,
      taskDescription: taskDescription.value,
      taskDueDate: taskDueDate.value
    },
    body = JSON.stringify(json);

  const response = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  if (response.status === 401) return showLogin();

  const todos = await response.json();
  renderTodos(todos);

  title.value = "";
  taskDescription.value = "";
  taskDueDate.value = "";
};

function renderTodos(todos) {
  const list = document.querySelector("#todo-table");
  list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");

    if (todo.completed) li.classList.add("completed");

    li.innerHTML = `
      <strong>${todo.taskTitle}</strong> - ${todo.taskDescription} 
      <span style="color: var(--color-5);">Due: ${todo.taskDueDate}</span>
      <span style="color: var(--color-2);"> (${todo.daysLeft} days left)</span>
      <button class="edit-btn" data-id="${todo._id.toString()}" title="Edit">
        <i class="fa fa-pencil" style="font-size:20px;color:#0074D9"></i>
      </button>
      <button class="delete-btn" data-id="${todo._id.toString()}" title="Delete">
        <i class="fa fa-trash-o" style="font-size:24px;color:red"></i>
      </button>
    `;

    // Toggle completed when clicking the list item (excluding buttons)
    li.onclick = function (e) {
      if (
        !e.target.classList.contains("delete-btn") &&
        !e.target.classList.contains("fa-trash-o") &&
        !e.target.classList.contains("edit-btn") &&
        !e.target.classList.contains("fa-pencil")
      ) {
        toggleCompleted(todo._id, !todo.completed); // use MongoDB _id
      }
    };

    list.appendChild(li);
  });

  // Add delete button handlers
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.onclick = async e => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this task?")) return;
      const id = button.getAttribute("data-id");
      const response = await fetch(`/delete?id=${id}`, { method: "DELETE" });
      if (response.status === 401) return showLogin();
      const todos = await response.json();
      renderTodos(todos);
    };
  });

  // Add edit button handlers
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.onclick = function (e) {
      e.stopPropagation();
      const id = button.getAttribute("data-id");
      const todo = todos.find(t => t._id === id); // find the todo by _id
      showEditPopup(todo, id);
    };
  });
}


// Create and show a popup for editing a todo
function showEditPopup(todo, id) {
  // Remove old popup if any
  const oldPopup = document.getElementById("edit-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.id = "edit-popup";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)"; // center horizontally and vertically
  popup.style.background = "#fff";
  popup.style.padding = "2rem";
  popup.style.borderRadius = "12px";
  popup.style.boxShadow = "0 4px 24px rgba(40,130,237,0.18)";
  popup.style.zIndex = 1000; // make sure appears above other elements

  popup.innerHTML = `
    <h3>Edit Todo</h3>
    <form id="edit-form">
      <label>Task Title:<br><input type="text" id="edit-taskTitle" value="${todo.taskTitle}" required></label><br><br>
      <label>Description:<br><input type="text" id="edit-taskDescription" value="${todo.taskDescription}" required></label><br><br>
      <label>Due Date:<br><input type="date" id="edit-taskDueDate" value="${todo.taskDueDate}" required></label><br><br>
      <button type="submit">Save</button>
      <button type="button" id="cancel-edit">Cancel</button>
    </form>
  `;
  document.body.appendChild(popup);

  document.getElementById("cancel-edit").onclick = function () {
    popup.remove();
  };

  document.getElementById("edit-form").onsubmit = async e => {
    e.preventDefault();
    const updated = { id, taskTitle: document.getElementById("edit-taskTitle").value, taskDescription: document.getElementById("edit-taskDescription").value, taskDueDate: document.getElementById("edit-taskDueDate").value };
    const response = await fetch("/edit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    if (response.status === 401) return showLogin();
    const todos = await response.json();
    renderTodos(todos);
    popup.remove();
  };
}

async function toggleCompleted(id, completed) {
  const response = await fetch("/toggle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completed }) });
  if (response.status === 401) return showLogin();
  const todos = await response.json();
  renderTodos(todos);
}

async function fetchTodos() {
  const response = await fetch("/todos");
  if (response.status === 401) return showLogin();
  const todos = await response.json();
  renderTodos(todos);
}

// Interactive Guide
const guideSteps = [
  {
    selector: ".todo-form",
    message: "This is the form. Fill in the fields and click Submit to add a new todo."
  },
  {
    selector: "#todo-table",
    message: "Here is your todo list. Each item can be edited, deleted, or marked as completed (click anywhere on the item)."
  },
  {
    selector: ".edit-btn",
    message: "Click the pencil icon to edit a todo item."
  },
  {
    selector: ".delete-btn",
    message: "Click the trash icon to delete a todo item."
  }
];

function startGuide(step = 0) {
  // Remove any existing guide overlay
  const old = document.getElementById("guide-overlay");
  if (old) old.remove();
  const oldTip = document.getElementById("guide-tooltip");
  if (oldTip) oldTip.remove();

  if (step >= guideSteps.length) return;

  const { selector, message } = guideSteps[step];
  const target = document.querySelector(selector);
  if (!target) {
    startGuide(step + 1);
    return;
  }

  // Highlight the element
  const rect = target.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.id = "guide-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = rect.top - 10 + "px";
  overlay.style.left = rect.left - 10 + "px";
  overlay.style.width = rect.width + 20 + "px";
  overlay.style.height = rect.height + 20 + "px";
  overlay.style.border = "3px solid #0074D9";
  overlay.style.borderRadius = "12px";
  overlay.style.zIndex = 2000;
  document.body.appendChild(overlay);

  // Tips
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.style.top = rect.bottom + 15 + "px";
  tooltip.style.left = rect.left + "px";
  tooltip.style.background = "#fff";
  tooltip.style.padding = "1rem";
  tooltip.style.border = "2px solid #0074D9";
  tooltip.style.borderRadius = "8px";
  tooltip.style.zIndex = 2001; // ensure the tip is above highlighted element
  tooltip.innerHTML = `
    <div style="margin-bottom:0.5rem;">${message}</div>
    <button id="next-guide-step">Next</button>
    <button id="end-guide-step" style="margin-left:0.5rem;">End Guide</button>
  `;
  tooltip.id = "guide-tooltip";
  document.body.appendChild(tooltip);

  document.getElementById("next-guide-step").onclick = () => {
    overlay.remove();
    tooltip.remove();
    startGuide(step + 1);
  };
  document.getElementById("end-guide-step").onclick = () => {
    overlay.remove();
    tooltip.remove();
  };
}

const loginBtn = document.getElementById("login-btn");
if (loginBtn) loginBtn.onclick = () => window.location.href = "/auth/github";

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) logoutBtn.onclick = () => window.location.href = "/logout";


window.onload = async function () {
  const user = await checkLogin();
  if (!user) return;

  showApp(user.username);

  const form = document.querySelector(".todo-form");
  if (form) form.onsubmit = submit;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.onclick = () => window.location.href = "/logout";

  const guideBtn = document.getElementById("start-guide");
  if (guideBtn) guideBtn.onclick = () => startGuide(0);
};