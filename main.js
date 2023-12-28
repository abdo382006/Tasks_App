// Selectors
const nameInput = document.getElementById("name-input");
const todoInput = document.getElementById("todo-input");
const addTaskBtn = document.getElementById("add-task-btn");
const filterOptions = document.querySelectorAll(".filter li");
const clearAllBtn = document.getElementById("clear-all");
const tasksList = document.querySelector(".tasks-list");

let tasksArr = [];

// Check In There Are Tasks In The LS
if (localStorage.getItem("tasks")) {
  tasksArr = JSON.parse(localStorage.getItem("tasks"));
}

// OOP Classes
class Task {
  constructor(id, text, completed) {
    this.id = id;
    this.text = text;
    this.completed = completed;
  }
}

// Events
nameInput.addEventListener("blur", storeName);

addTaskBtn.addEventListener("click", () => {
  if (todoInput.value !== "") {
    // Add Task To Tasks Arr
    addTaskToArr(todoInput.value);
    // Update Tasks Num
    updateTasksNum();
    // Empty todoInput
    todoInput.value = "";
  }
});

filterOptions.forEach((option) => {
  option.addEventListener("click", function () {
    // Update Active Class
    updateActiveClass(option);
    // Filter Tasks
    filterTasks(option.textContent);
  });
});

clearAllBtn.addEventListener("click", () => {
  // Empty Tasks List
  tasksList.innerHTML = "";
  // Rmpty Tasks Arr
  tasksArr = [];
  // Remove All Tasks From LS
  localStorage.removeItem("tasks");
  // Update Tasks Num
  updateTasksNum();
});

tasksList.addEventListener("click", (e) => {
  if (e.target.classList.contains("check")) {
    if (!e.target.parentElement.classList.contains("completed")) {
      // Play Success Sound
      playSoundEffect();
    }
    // Toggle Task Completed Class
    toggleCompletedClass(e.target.parentElement);
    // Toggle Task Completed Status
    toggleCompletedStatus(e.target.parentElement.getAttribute("data-id"));
    // Update Tasks Num
    updateTasksNum();
  } else if (e.target.classList.contains("options-toggle")) {
    toggleDropDown(e.target.nextElementSibling);
  } else if (e.target.classList.contains("edit-task")) {
    makeTaskEditable(
      e.target.parentElement.parentElement.previousElementSibling
    );
    // Close Drop Down
    toggleDropDown(e.target.parentElement);
  } else if (e.target.classList.contains("remove-task")) {
    // Remove Task From Page
    removeTaskFromPage(e.target.parentElement.parentElement.parentElement);
    // Close Drop Down
    toggleDropDown(e.target.parentElement);
    // Update Tasks Num
    updateTasksNum();
  }
});

// Functions
function addTaskToArr(taskTxt) {
  // Create Task Obj
  let id = tasksArr.length + 1;
  const taskObj = new Task(id, taskTxt, false);
  // Push Task Obj To Tasks Arr
  tasksArr.push(taskObj);
  // Display Tasks To The Page
  displatTasks();
  // Store Tasks In The LS
  storeTasks();
}

function displatTasks() {
  // Empty Tasks List Div
  tasksList.innerHTML = "";
  // Loop On Tasks Arr
  tasksArr.forEach((taskObj) => {
    // Create Task Div
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    if (taskObj.completed) {
      taskDiv.classList.add("completed");
    }
    taskDiv.setAttribute("data-id", taskObj.id);
    // Append Task Div To The Tasks List
    tasksList.append(taskDiv);
    // Create Check Button
    const check = document.createElement("button");
    check.classList.add("check");
    taskDiv.append(check);
    // Create Paragraph
    const paragraph = document.createElement("p");
    paragraph.textContent = taskObj.text;
    taskDiv.append(paragraph);
    // Create Options Div
    const options = document.createElement("div");
    options.classList.add("options");
    taskDiv.append(options);
    // Create Options Icon
    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-ellipsis", "options-toggle");
    options.append(icon);
    // Create Options Drop Down
    const dropDown = document.createElement("ul");
    dropDown.classList.add("drop-down");
    dropDown.innerHTML = `
      <li class="edit-task"><i class="fas fa-pen"></i> Edit</li>
      <li class="remove-task"><i class="fas fa-trash"></i> Remove</li>
    `;
    options.append(dropDown);
  });
}

function updateTasksNum() {
  const tasksNumElement = document.querySelector(".footer span");
  let tasksNum = tasksList.children.length;

  for (let i = 0; i < tasksList.children.length; i++) {
    if (
      tasksList.children[i].classList.contains("completed") ||
      tasksList.children[i].classList.contains("removed")
    ) {
      tasksNum--;
    }
  }

  tasksNumElement.textContent = tasksNum;

  // Store Tasks Num
  storeTasksNum(tasksNumElement.textContent);
}

function updateActiveClass(clickedEle) {
  [...clickedEle.parentElement.children].forEach((ele) => {
    ele.classList.remove("active");
  });
  clickedEle.classList.add("active");
}

function filterTasks(value) {
  switch (value.toLowerCase()) {
    case "all":
      [...tasksList.children].forEach((task) => {
        task.classList.remove("hidden");
      });
      break;
    case "pending":
      [...tasksList.children].forEach((task) => {
        if (task.classList.contains("completed")) {
          task.classList.add("hidden");
        } else {
          task.classList.remove("hidden");
        }
      });
      break;
    case "completed":
      [...tasksList.children].forEach((task) => {
        if (task.classList.contains("completed")) {
          task.classList.remove("hidden");
        } else {
          task.classList.add("hidden");
        }
      });
      break;
  }
}

function playSoundEffect() {
  let audio = new Audio();
  audio.src = "sounds/completed.mp3";
  audio.play();
}

function toggleCompletedClass(task) {
  task.classList.toggle("completed");
}

function toggleCompletedStatus(taskId) {
  tasksArr.forEach((taskObj) => {
    if (taskObj.id == taskId) {
      taskObj.completed == false
        ? (taskObj.completed = true)
        : (taskObj.completed = false);
    }
  });
  // Update LS Tasks
  storeTasks();
}

function toggleDropDown(dropDown) {
  dropDown.classList.toggle("opened");
}

function makeTaskEditable(paragraph) {
  paragraph.setAttribute("contenteditable", "true");
  paragraph.focus();

  // Remove Paragraph Editability
  paragraph.onblur = () => {
    paragraph.setAttribute("contenteditable", "false");
    // Update Task Obj Text
    updateTaskTxt(
      paragraph.parentElement.getAttribute("data-id"),
      paragraph.textContent
    );
  };
}

function updateTaskTxt(taskId, txt) {
  tasksArr.forEach((taskObj) => {
    if (taskObj.id == taskId) {
      taskObj.text = txt;
    }
  });
  // Update LS Tasks
  storeTasks();
}

function removeTaskFromPage(task) {
  task.classList.add("removed");
  setTimeout(() => task.remove(), 500);

  // Remove Task From LS & Tasks Arr
  removeTaskFromArr(task.getAttribute("data-id"));
}

function removeTaskFromArr(taskId) {
  tasksArr.forEach((taskObj) => {
    if (taskObj.id == taskId) {
      tasksArr = tasksArr.filter((task) => task.id != taskId);
    }
  });
  // Update LS Tasks
  storeTasks();
}

// Store Data In The Local Storage
function storeName() {
  window.localStorage.setItem("name", nameInput.value.trim());
}

function storeTasks() {
  window.localStorage.setItem("tasks", JSON.stringify(tasksArr));
}

function storeTasksNum(num) {
  window.localStorage.setItem("tasks-num", num);
}

// Get Data From The Local Storage
function getName() {
  if (localStorage.getItem("name")) {
    nameInput.value = localStorage.getItem("name");
  }
}

function getTasks() {
  if (localStorage.getItem("tasks")) {
    displatTasks();
  }
}

function getTasksNum() {
  if (localStorage.getItem("tasks-num")) {
    const tasksNumElement = document.querySelector(".footer span");
    tasksNumElement.textContent = localStorage.getItem("tasks-num");
  }
}

// Apply Local Storage Data In The Page
getName();
getTasks();
getTasksNum();
