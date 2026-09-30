const STORAGE_KEY = "personal-dashboard-state-v1";

const DEFAULT_STATE = {
  theme: "dark",
  background: "gradient-1",
  accent: "#8b5cf6",
  links: [
    {
      id: "github",
      title: "GitHub",
      url: "https://github.com/",
      icon: "💻"
    },
    {
      id: "gmail",
      title: "Gmail",
      url: "https://mail.google.com/",
      icon: "✉️"
    },
    {
      id: "youtube",
      title: "YouTube",
      url: "https://www.youtube.com/",
      icon: "▶️"
    },
    {
      id: "twitter",
      title: "Twitter",
      url: "https://twitter.com/",
      icon: "𝕏"
    }
  ],
  notes: [],
  tasks: [],
  timer: {
    minutes: 0,
    seconds: 0
  }
};

let state = loadState();
let timerInterval = null;
let timerRemaining = 0;
let timerRunning = false;


/* =========================================================
   HELPERS
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Nepodarilo sa uložiť dáta:", error);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      links: Array.isArray(parsed.links)
        ? parsed.links
        : structuredClone(DEFAULT_STATE.links),
      notes: Array.isArray(parsed.notes)
        ? parsed.notes
        : [],
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks
        : []
    };
  } catch (error) {
    console.error("Nepodarilo sa načítať uložené dáta:", error);
    return structuredClone(DEFAULT_STATE);
  }
}


/* =========================================================
   CLOCK + DATE
========================================================= */

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timeString = `${hours}:${minutes}:${seconds}`;

  const clock =
    document.querySelector("#clock") ||
    document.querySelector(".clock");

  if (clock) {
    clock.textContent = timeString;
  }

  let dateElement =
    document.querySelector("#date") ||
    document.querySelector(".date");

  /*
   * Ak HTML nemá prvok pre dátum,
   * vytvoríme ho automaticky pod hodinami.
   */
  if (!dateElement && clock) {
    dateElement = document.createElement("div");
    dateElement.className = "date";
    dateElement.id = "date";

    clock.insertAdjacentElement("afterend", dateElement);
  }

  if (dateElement) {
    const formattedDate = new Intl.DateTimeFormat("sk-SK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(now);

    dateElement.textContent =
      formattedDate.charAt(0).toUpperCase() +
      formattedDate.slice(1);
  }
}

function startClock() {
  updateClock();

  setInterval(updateClock, 1000);
}


/* =========================================================
   SEARCH
========================================================= */

function performSearch() {
  const input =
    document.querySelector("#searchInput") ||
    document.querySelector(".search-input") ||
    document.querySelector('input[type="search"]');

  if (!input) return;

  const query = input.value.trim();

  if (!query) return;

  let destination;

  if (
    query.startsWith("http://") ||
    query.startsWith("https://") ||
    query.startsWith("www.")
  ) {
    destination = query.startsWith("www.")
      ? `https://${query}`
      : query;
  } else if (
    query.includes(".") &&
    !query.includes(" ")
  ) {
    destination = `https://${query}`;
  } else {
    destination =
      `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  window.location.href = destination;
}

function initSearch() {
  const input =
    document.querySelector("#searchInput") ||
    document.querySelector(".search-input") ||
    document.querySelector('input[type="search"]');

  if (!input) return;

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch();
    }
  });

  const button =
    document.querySelector("#searchButton") ||
    document.querySelector(".search-button");

  if (button) {
    button.addEventListener("click", performSearch);
  }
}


/* =========================================================
   THEME
========================================================= */

function applyTheme() {
  document.body.classList.remove("dark", "light");

  if (state.theme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.add("dark");
  }

  const themeToggle =
    document.querySelector("#themeToggle") ||
    document.querySelector(".theme-toggle");

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      state.theme === "dark"
        ? "Prepnúť na svetlý režim"
        : "Prepnúť na tmavý režim"
    );
  }
}

function toggleTheme() {
  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  applyTheme();
  saveState();
}

function initTheme() {
  applyTheme();

  const buttons = [
    document.querySelector("#themeToggle"),
    document.querySelector(".theme-toggle"),
    document.querySelector("[data-action='theme']")
  ].filter(Boolean);

  buttons.forEach(button => {
    button.addEventListener("click", toggleTheme);
  });
}


/* =========================================================
   BACKGROUND
========================================================= */

function applyBackground() {
  document.body.classList.remove(
    "gradient-1",
    "gradient-2",
    "gradient-3"
  );

  if (
    state.background === "gradient-1" ||
    state.background === "gradient-2" ||
    state.background === "gradient-3"
  ) {
    document.body.classList.add(state.background);
  }
}

function initBackground() {
  applyBackground();

  const select =
    document.querySelector("#backgroundSelect") ||
    document.querySelector("#background") ||
    document.querySelector(".background-select");

  if (!select) return;

  select.value = state.background;

  select.addEventListener("change", function () {
    state.background = this.value;
    applyBackground();
    saveState();
  });
}


/* =========================================================
   ACCENT COLOR
========================================================= */

function applyAccent() {
  document.documentElement.style.setProperty(
    "--accent",
    state.accent
  );
}

function initAccent() {
  applyAccent();

  const input =
    document.querySelector("#accentColor") ||
    document.querySelector('input[type="color"]');

  if (!input) return;

  input.value = state.accent;

  input.addEventListener("input", function () {
    state.accent = this.value;
    applyAccent();
    saveState();
  });
}


/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {
  const sidebar =
    document.querySelector("#sidebar") ||
    document.querySelector(".sidebar");

  const toggle =
    document.querySelector("#sidebarToggle") ||
    document.querySelector(".sidebar-toggle");

  const overlay =
    document.querySelector("#sidebarOverlay") ||
    document.querySelector(".sidebar-overlay");

  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      sidebar.classList.toggle("collapsed");

      if (overlay) {
        overlay.classList.toggle("active");
      }
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

  $all("[data-section]").forEach(button => {
    button.addEventListener("click", function () {
      const sectionId = this.dataset.section;
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}


/* =========================================================
   QUICK LINKS
========================================================= */

function renderLinks() {
  const container =
    document.querySelector("#quickLinks") ||
    document.querySelector(".quick-links");

  if (!container) return;

  container.innerHTML = "";

  state.links.forEach(link => {
    const element = document.createElement("div");

    element.className = "quick-link";

    element.innerHTML = `
      <a
        href="${escapeHTML(link.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="quick-link-main"
      >
        <span class="quick-link-icon">
          ${escapeHTML(link.icon || "🔗")}
        </span>

        <span class="quick-link-title">
          ${escapeHTML(link.title)}
        </span>
      </a>

      <button
        class="delete-link"
        data-id="${escapeHTML(link.id)}"
        title="Odstrániť"
        type="button"
      >
        ×
      </button>
    `;

    container.appendChild(element);
  });

  $all(".delete-link").forEach(button => {
    button.addEventListener("click", function () {
      const id = this.dataset.id;

      state.links = state.links.filter(
        link => link.id !== id
      );

      saveState();
      renderLinks();
    });
  });
}

function addLink() {
  const titleInput =
    document.querySelector("#linkTitle");

  const urlInput =
    document.querySelector("#linkUrl");

  const iconInput =
    document.querySelector("#linkIcon");

  if (!titleInput || !urlInput) return;

  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  const icon = iconInput
    ? iconInput.value.trim()
    : "🔗";

  if (!title || !url) {
    alert("Vyplň názov aj URL adresu.");
    return;
  }

  let finalUrl = url;

  if (
    !finalUrl.startsWith("http://") &&
    !finalUrl.startsWith("https://")
  ) {
    finalUrl = `https://${finalUrl}`;
  }

  state.links.push({
    id: Date.now().toString(),
    title,
    url: finalUrl,
    icon: icon || "🔗"
  });

  saveState();
  renderLinks();

  titleInput.value = "";
  urlInput.value = "";

  if (iconInput) {
    iconInput.value = "";
  }
}

function initLinks() {
  renderLinks();

  const addButton =
    document.querySelector("#addLink") ||
    document.querySelector(".add-link");

  if (addButton) {
    addButton.addEventListener("click", addLink);
  }
}


/* =========================================================
   TIMER
========================================================= */

function updateTimerDisplay() {
  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;

  const display =
    document.querySelector("#timerDisplay") ||
    document.querySelector(".timer-display") ||
    document.querySelector(".timer");

  if (!display) return;

  display.textContent =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;
}

function getTimerInputs() {
  return {
    minutes:
      document.querySelector("#timerMinutes") ||
      document.querySelector(".timer-minutes"),

    seconds:
      document.querySelector("#timerSeconds") ||
      document.querySelector(".timer-seconds")
  };
}

function startTimer() {
  if (timerRunning) return;

  if (timerRemaining <= 0) {
    const inputs = getTimerInputs();

    const minutes = inputs.minutes
      ? parseInt(inputs.minutes.value, 10) || 0
      : 0;

    const seconds = inputs.seconds
      ? parseInt(inputs.seconds.value, 10) || 0
      : 0;

    timerRemaining =
      Math.max(0, minutes * 60 + seconds);
  }

  if (timerRemaining <= 0) return;

  timerRunning = true;

  timerInterval = setInterval(() => {
    timerRemaining--;

    updateTimerDisplay();

    if (timerRemaining <= 0) {
      stopTimer();

      try {
        new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
        ).play();
      } catch (error) {
        console.log("Timer skončil.");
      }

      alert("Časovač skončil!");
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;

  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}

function resetTimer() {
  stopTimer();

  timerRemaining = 0;

  const inputs = getTimerInputs();

  if (inputs.minutes) {
    inputs.minutes.value = "";
  }

  if (inputs.seconds) {
    inputs.seconds.value = "";
  }

  updateTimerDisplay();
}

function initTimer() {
  updateTimerDisplay();

  const start =
    document.querySelector("#timerStart") ||
    document.querySelector(".timer-start");

  const pause =
    document.querySelector("#timerPause") ||
    document.querySelector(".timer-pause");

  const reset =
    document.querySelector("#timerReset") ||
    document.querySelector(".timer-reset");

  if (start) {
    start.addEventListener("click", startTimer);
  }

  if (pause) {
    pause.addEventListener("click", pauseTimer);
  }

  if (reset) {
    reset.addEventListener("click", resetTimer);
  }
}


/* =========================================================
   NOTES
========================================================= */

function renderNotes() {
  const container =
    document.querySelector("#notesList") ||
    document.querySelector(".notes-list");

  if (!container) return;

  if (state.notes.length === 0) {
    container.innerHTML =
      `<div class="empty-state">Žiadne poznámky.</div>`;

    return;
  }

  container.innerHTML = "";

  state.notes.forEach(note => {
    const element = document.createElement("div");

    element.className = "note";

    element.innerHTML = `
      <div class="note-content">
        ${escapeHTML(note.text)}
      </div>

      <button
        class="delete-note"
        data-id="${escapeHTML(note.id)}"
        type="button"
      >
        ×
      </button>
    `;

    container.appendChild(element);
  });

  $all(".delete-note").forEach(button => {
    button.addEventListener("click", function () {
      state.notes = state.notes.filter(
        note => note.id !== this.dataset.id
      );

      saveState();
      renderNotes();
    });
  });
}

function addNote() {
  const input =
    document.querySelector("#noteInput") ||
    document.querySelector(".note-input") ||
    document.querySelector("#newNote");

  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  state.notes.unshift({
    id: Date.now().toString(),
    text,
    createdAt: new Date().toISOString()
  });

  saveState();
  renderNotes();

  input.value = "";
}

function initNotes() {
  renderNotes();

  const button =
    document.querySelector("#addNote") ||
    document.querySelector(".add-note");

  if (button) {
    button.addEventListener("click", addNote);
  }
}


/* =========================================================
   TASKS
========================================================= */

function renderTasks() {
  const container =
    document.querySelector("#tasksList") ||
    document.querySelector(".tasks-list");

  if (!container) return;

  if (state.tasks.length === 0) {
    container.innerHTML =
      `<div class="empty-state">Žiadne úlohy.</div>`;

    return;
  }

  container.innerHTML = "";

  state.tasks.forEach(task => {
    const element = document.createElement("div");

    element.className =
      `task ${task.completed ? "completed" : ""}`;

    element.innerHTML = `
      <label class="task-main">
        <input
          type="checkbox"
          class="task-checkbox"
          data-id="${escapeHTML(task.id)}"
          ${task.completed ? "checked" : ""}
        >

        <span>
          ${escapeHTML(task.text)}
        </span>
      </label>

      <button
        class="delete-task"
        data-id="${escapeHTML(task.id)}"
        type="button"
      >
        ×
      </button>
    `;

    container.appendChild(element);
  });

  $all(".task-checkbox").forEach(checkbox => {
    checkbox.addEventListener("change", function () {
      const task = state.tasks.find(
        item => item.id === this.dataset.id
      );

      if (task) {
        task.completed = this.checked;
      }

      saveState();
      renderTasks();
    });
  });

  $all(".delete-task").forEach(button => {
    button.addEventListener("click", function () {
      state.tasks = state.tasks.filter(
        task => task.id !== this.dataset.id
      );

      saveState();
      renderTasks();
    });
  });
}

function addTask() {
  const input =
    document.querySelector("#taskInput") ||
    document.querySelector(".task-input") ||
    document.querySelector("#newTask");

  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  state.tasks.push({
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveState();
  renderTasks();

  input.value = "";
}

function initTasks() {
  renderTasks();

  const button =
    document.querySelector("#addTask") ||
    document.querySelector(".add-task");

  if (button) {
    button.addEventListener("click", addTask);
  }
}


/* =========================================================
   EXPORT / IMPORT
========================================================= */

function exportData() {
  const data = JSON.stringify(state, null, 2);

  const blob = new Blob(
    [data],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "personal-dashboard-backup.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const imported = JSON.parse(reader.result);

      state = {
        ...structuredClone(DEFAULT_STATE),
        ...imported
      };

      saveState();

      applyTheme();
      applyBackground();
      applyAccent();
      renderLinks();
      renderNotes();
      renderTasks();

      alert("Dáta boli úspešne importované.");
    } catch (error) {
      alert("Súbor obsahuje neplatné dáta.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}


/* =========================================================
   RESET
========================================================= */

function resetAllData() {
  const confirmed = confirm(
    "Naozaj chceš vymazať všetky uložené dáta?"
  );

  if (!confirmed) return;

  state = structuredClone(DEFAULT_STATE);

  saveState();

  applyTheme();
  applyBackground();
  applyAccent();
  renderLinks();
  renderNotes();
  renderTasks();
  resetTimer();

  location.reload();
}


/* =========================================================
   SETTINGS
========================================================= */

function initSettings() {
  const exportButton =
    document.querySelector("#exportData") ||
    document.querySelector(".export-data");

  if (exportButton) {
    exportButton.addEventListener(
      "click",
      exportData
    );
  }

  const importInput =
    document.querySelector("#importData") ||
    document.querySelector(".import-data");

  if (importInput) {
    importInput.addEventListener("change", function () {
      importData(this.files[0]);
    });
  }

  const resetButton =
    document.querySelector("#resetData") ||
    document.querySelector(".reset-data");

  if (resetButton) {
    resetButton.addEventListener(
      "click",
      resetAllData
    );
  }
}


/* =========================================================
   MODALS / PANELS
========================================================= */

function initPanels() {
  $all("[data-open]").forEach(button => {
    button.addEventListener("click", function () {
      const targetId = this.dataset.open;
      const target = document.getElementById(targetId);

      if (target) {
        target.classList.add("active");
        target.classList.add("open");
      }
    });
  });

  $all("[data-close]").forEach(button => {
    button.addEventListener("click", function () {
      const targetId = this.dataset.close;
      const target = document.getElementById(targetId);

      if (target) {
        target.classList.remove("active");
        target.classList.remove("open");
      }
    });
  });
}


/* =========================================================
   MOBILE
========================================================= */

function initMobileMenu() {
  const menuButton =
    document.querySelector("#mobileMenu") ||
    document.querySelector(".mobile-menu");

  const sidebar =
    document.querySelector(".sidebar");

  if (!menuButton || !sidebar) return;

  menuButton.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });
}


/* =========================================================
   INIT
========================================================= */

function init() {
  console.log("Personal Dashboard: inicializácia...");

  startClock();
  initSearch();
  initTheme();
  initBackground();
  initAccent();
  initSidebar();
  initLinks();
  initTimer();
  initNotes();
  initTasks();
  initSettings();
  initPanels();
  initMobileMenu();

  console.log("Personal Dashboard: pripravený.");
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    init
  );
} else {
  init();
}
