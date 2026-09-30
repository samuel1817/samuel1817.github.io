const STORAGE_KEY = 'personal-dashboard-state-v1';

const defaultLinks = [
    { id: createId(), title: 'GitHub', url: '[https://github.com](https://github.com)', icon: 'fab fa-github' },
    { id: createId(), title: 'Gmail', url: '[https://gmail.com](https://gmail.com)', icon: 'fab fa-google' },
    { id: createId(), title: 'YouTube', url: '[https://youtube.com](https://youtube.com)', icon: 'fab fa-youtube' },
    { id: createId(), title: 'Twitter', url: '[https://twitter.com](https://twitter.com)', icon: 'fab fa-twitter' }
];

const defaultState = {
    theme: 'dark',
    background: 'gradient-1',
    accent: '#3498db',
    links: defaultLinks,
    notes: [],
    tasks: []
};

let dashboardState = loadState();

document.addEventListener('DOMContentLoaded', init);

function createId() {
    return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return structuredClone(defaultState);

        const parsed = JSON.parse(saved);
        return {
            theme: parsed.theme || defaultState.theme,
            background: parsed.background || defaultState.background,
            accent: parsed.accent || defaultState.accent,
            links: Array.isArray(parsed.links) && parsed.links.length ? parsed.links : defaultState.links,
            notes: Array.isArray(parsed.notes) ? parsed.notes : [],
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : []
        };
    } catch (error) {
        console.warn('Failed to load saved dashboard state:', error);
        return structuredClone(defaultState);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardState));
}

function init() {
    applyTheme();
    applyBackground();
    applyAccent();

    setupSectionNavigation();
    setupSidebarToggle();

    setupSearch();
    setupClock();
    setupTimer();

    setupQuickLinks();
    setupNotes();
    setupTasks();
    setupSettings();

    renderAll();
}

function setupSectionNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const sectionName = button.dataset.section;
            setActiveSection(sectionName);

            const sidebar = document.getElementById('sidebar');
            if (sidebar && window\.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    function setActiveSection(sectionName) {
        const titleMap = {
            dashboard: 'Dashboard',
            'quick-links': 'Quick Links',
            notes: 'Notes',
            tasks: 'Tasks',
            settings: 'Settings'
        };

        navButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.section === sectionName);
        });

        sections.forEach((section) => {
            section.classList.toggle('active', section.id === \`${sectionName}-section\`);
        });

        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = titleMap[sectionName] || 'Dashboard';
        }
    }

    const defaultSection = 'dashboard';
    setActiveSection(defaultSection);
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });
    }

    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });
    }

    window\.addEventListener('resize', () => {
        if (window\.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('open');
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    function performSearch() {
        const query = searchInput?.value.trim();
        if (!query) return;

        let url = '';

        if (/^https?:\\\\/\\\\//i.test(query)) {
            url = query;
        } else if (/^[\\\w\.-]+\\\\.[a-z]{2,}(\\\\/.\*)?$/i.test(query)) {
            url = query.startsWith('www.') ? \`https\://${query}\` : \`https\://${query}\`;
        } else {
            url = \`[https://www.google.com/search?q=${encodeURIComponent(query)](https://www.google.com/search?q=${encodeURIComponent\(query\))}\`;
        }

        window\.open(url, '\_blank', 'noopener,noreferrer');
    }

    searchBtn?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

function setupClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    function updateClock() {
        const now = new Date();
        const time = now\.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const dateText = now\.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (clockEl) clockEl.textContent = time;
        if (dateEl) dateEl.textContent = dateText;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function setupTimer() {
    let timerInterval = null;
    let remainingSeconds = 0;

    const timerDisplay = document.getElementById('timerDisplay');
    const timerMinutes = document.getElementById('timerMinutes');
    const timerSeconds = document.getElementById('timerSeconds');
    const timerStart = document.getElementById('timerStart');
    const timerPause = document.getElementById('timerPause');
    const timerReset = document.getElementById('timerReset');

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return \`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}\`;
    }

    function updateDisplay() {
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(remainingSeconds);
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer() {
        if (timerInterval) return;

        const minutes = Number(timerMinutes?.value || 0);
        const seconds = Number(timerSeconds?.value || 0);

        if (remainingSeconds <= 0) {
            remainingSeconds = minutes \* 60 + seconds;
        }

        if (remainingSeconds <= 0) {
            return;
        }

        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds -= 1;
                updateDisplay();
            } else {
                stopTimer();
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    new Notification('Timer complete!');
                }
                if (timerDisplay) {
                    timerDisplay.textContent = '00:00';
                }
            }
        }, 1000);

        updateDisplay();
    }

    function pauseTimer() {
        stopTimer();
    }

    function resetTimer() {
        stopTimer();
        remainingSeconds = 0;
        if (timerMinutes) timerMinutes.value = '';
        if (timerSeconds) timerSeconds.value = '';
        updateDisplay();
    }

    timerStart?.addEventListener('click', startTimer);
    timerPause?.addEventListener('click', pauseTimer);
    timerReset?.addEventListener('click', resetTimer);

    const defaultMinutes = 25;
    if (timerMinutes) timerMinutes.value = defaultMinutes;
    remainingSeconds = defaultMinutes \* 60;
    updateDisplay();
}

function setupQuickLinks() {
    const addLinkBtn = document.getElementById('addLinkBtn');
    const addLinkForm = document.getElementById('addLinkForm');
    const cancelLinkBtn = document.getElementById('cancelLinkBtn');
    const linksList = document.getElementById('linksList');
    const linksPreview = document.getElementById('linksPreview');

    addLinkBtn?.addEventListener('click', () => {
        addLinkForm?.classList.remove('hidden');
    });

    cancelLinkBtn?.addEventListener('click', () => {
        addLinkForm?.classList.add('hidden');
        addLinkForm?.reset();
    });

    addLinkForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        const linkTitle = document.getElementById('linkTitle')?.value.trim();
        const linkUrl = document.getElementById('linkUrl')?.value.trim();
        const linkIcon = document.getElementById('linkIcon')?.value.trim();

        if (!linkTitle || !linkUrl) return;

        const normalizedUrl = /^https?:\\\\/\\\\//i.test(linkUrl) ? linkUrl : \`https\://${linkUrl}\`;

        dashboardState.links.push({
            id: createId(),
            title: linkTitle,
            url: normalizedUrl,
            icon: linkIcon || 'fas fa-link'
        });

        saveState();
        renderLinks();
        addLinkForm.reset();
        addLinkForm.classList.add('hidden');
    });

    linksList?.addEventListener('click', (event) => {
        const target = event.target.closest('.item-delete');
        if (!target) return;

        const id = target.dataset.id;
        dashboardState.links = dashboardState.links.filter(link => link.id !== id);
        saveState();
        renderLinks();
    });

    renderLinks();
}

function renderLinks() {
    const linksList = document.getElementById('linksList');
    const linksPreview = document.getElementById('linksPreview');

    if (linksList) {
        linksList.innerHTML = dashboardState.links.length
            ? dashboardState.links.map((link) => \`
                \<div class=\\"item-card\\">
                    \<button class=\\"item-delete\\" data-id=\\"${link.id}\\" aria-label=\\"Delete ${link.title}\\">&times;\</button>
                    \<i class=\\"${link.icon || 'fas fa-link'}\\">\</i>
                    \<a href=\\"${link.url}\\" target=\\"\_blank\\" rel=\\"noopener noreferrer\\">${link.title}\</a>
                \</div>
            \`).join('')
            : '\<p class=\\"empty-message\\">No links saved yet.\</p>';
    }

    if (linksPreview) {
        const previewLinks = dashboardState.links.slice(0, 4);

        linksPreview\.innerHTML = previewLinks.length
            ? previewLinks.map((link) => \`
                \<a href=\\"${link.url}\\" target=\\"\_blank\\" rel=\\"noopener noreferrer\\">
                    \<i class=\\"${link.icon || 'fas fa-link'}\\">\</i>
                    \<span>${link.title}\</span>
                \</a>
            \`).join('')
            : '\<p class=\\"empty-message\\">No links yet\</p>';
    }
}

function setupNotes() {
    const addNoteBtn = document.getElementById('addNoteBtn');
    const addNoteForm = document.getElementById('addNoteForm');
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    const notesList = document.getElementById('notesList');
    const notesPreview = document.getElementById('notesPreview');

    addNoteBtn?.addEventListener('click', () => {
        addNoteForm?.classList.remove('hidden');
    });

    cancelNoteBtn?.addEventListener('click', () => {
        addNoteForm?.classList.add('hidden');
        addNoteForm?.reset();
    });

    addNoteForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.getElementById('noteTitle')?.value.trim();
        const content = document.getElementById('noteContent')?.value.trim();

        if (!title || !content) return;

        dashboardState.notes.unshift({
            id: createId(),
            title,
            content,
            createdAt: new Date().toISOString()
        });

        saveState();
        renderNotes();
        addNoteForm.reset();
        addNoteForm.classList.add('hidden');
    });

    notesList?.addEventListener('click', (event) => {
        const target = event.target.closest('.note-delete');
        if (!target) return;

        const id = target.dataset.id;
        dashboardState.notes = dashboardState.notes.filter(note => note.id !== id);
        saveState();
        renderNotes();
    });

    renderNotes();
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    const notesPreview = document.getElementById('notesPreview');

    if (notesList) {
        notesList.innerHTML = dashboardState.notes.length
            ? dashboardState.notes.map((note) => \`
                \<div class=\\"note-item\\">
                    \<button class=\\"note-delete\\" data-id=\\"${note.id}\\" aria-label=\\"Delete ${note.title}\\">&times;\</button>
                    \<div class=\\"note-title\\">${note.title}\</div>
                    \<div class=\\"note-content\\">${note.content}\</div>
                    \<div class=\\"note-date\\">${new Date(note.createdAt).toLocaleDateString()}\</div>
                \</div>
            \`).join('')
            : '\<p class=\\"empty-message\\">No notes yet.\</p>';
    }

    if (notesPreview) {
        const previewNotes = dashboardState.notes.slice(0, 3);

        notesPreview\.innerHTML = previewNotes.length
            ? previewNotes.map((note) => \`
                \<div class=\\"preview-item\\">${note.title}\</div>
            \`).join('')
            : '\<p class=\\"empty-message\\">No notes yet\</p>';
    }
}

function setupTasks() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTaskForm = document.getElementById('addTaskForm');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const tasksList = document.getElementById('tasksList');
    const tasksPreview = document.getElementById('tasksPreview');

    addTaskBtn?.addEventListener('click', () => {
        addTaskForm?.classList.remove('hidden');
    });

    cancelTaskBtn?.addEventListener('click', () => {
        addTaskForm?.classList.add('hidden');
        addTaskForm?.reset();
    });

    addTaskForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.getElementById('taskTitle')?.value.trim();
        const description = document.getElementById('taskDescription')?.value.trim();
        const priority = document.getElementById('taskPriority')?.value || 'medium';

        if (!title) return;

        dashboardState.tasks.unshift({
            id: createId(),
            title,
            description,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        });

        saveState();
        renderTasks();
        addTaskForm.reset();
        addTaskForm.classList.add('hidden');
    });

    tasksList?.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.task-delete');
        const checkbox = event.target.closest('.task-checkbox');

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            dashboardState.tasks = dashboardState.tasks.filter(task => task.id !== id);
            saveState();
            renderTasks();
            return;
        }

        if (checkbox) {
            const id = checkbox.dataset.id;
            dashboardState.tasks = dashboardState.tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: checkbox.checked };
                }
                return task;
            });

            saveState();
            renderTasks();
        }
    });

    renderTasks();
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const tasksPreview = document.getElementById('tasksPreview');

    if (tasksList) {
        tasksList.innerHTML = dashboardState.tasks.length
            ? dashboardState.tasks.map((task) => \`
                \<div class=\\"task-item ${task.completed ? 'completed' : ''}\\">
                    \<input
                        class=\\"task-checkbox\\"
                        type=\\"checkbox\\"
                        ${task.completed ? 'checked' : ''}
                        data-id=\\"${task.id}\\"
                        aria-label=\\"Toggle task ${task.title}\\"
                    \>
                    \<div class=\\"task-content\\">
                        \<div class=\\"task-title\\">${task.title}\</div>
                        \<div class=\\"task-description\\">${task.description || 'No description'}\</div>
                        \<span class=\\"task-priority ${task.priority || 'medium'}\\">
                            ${capitalize(task.priority || 'medium')}
                        \</span>
                    \</div>
                    \<button class=\\"task-delete\\" data-id=\\"${task.id}\\" aria-label=\\"Delete task ${task.title}\\">&times;\</button>
                \</div>
            \`).join('')
            : '\<p class=\\"empty-message\\">No tasks yet.\</p>';
    }

    if (tasksPreview) {
        const previewTasks = dashboardState.tasks.slice(0, 3);

        tasksPreview\.innerHTML = previewTasks.length
            ? previewTasks.map((task) => \`
                \<div class=\\"preview-item ${task.priority || 'medium'}-priority\\">
                    ${task.title}
                \</div>
            \`).join('')
            : '\<p class=\\"empty-message\\">No tasks yet\</p>';
    }
}

function setupSettings() {
    const themeToggle = document.getElementById('themeToggle');
    const backgroundSelect = document.getElementById('backgroundSelect');
    const colorSelect = document.getElementById('colorSelect');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const resetBtn = document.getElementById('resetBtn');

    themeToggle?.addEventListener('click', () => {
        dashboardState.theme = dashboardState.theme === 'dark' ? 'light' : 'dark';
        saveState();
        applyTheme();
    });

    backgroundSelect?.addEventListener('change', (event) => {
        dashboardState.background = event.target.value;
        saveState();
        applyBackground();
    });

    colorSelect?.addEventListener('input', (event) => {
        dashboardState.accent = event.target.value;
        saveState();
        applyAccent();
    });

    exportBtn?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(dashboardState, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dashboard-data.json';
        link.click();
        URL.revokeObjectURL(url);
    });

    importBtn?.addEventListener('click', () => {
        importFile?.click();
    });

    importFile?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(String(e.target?.result || '{}'));
                dashboardState = {
                    theme: parsed.theme || defaultState.theme,
                    background: parsed.background || defaultState.background,
                    accent: parsed.accent || defaultState.accent,
                    links: Array.isArray(parsed.links) && parsed.links.length ? parsed.links : defaultState.links,
                    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
                    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : []
                };
                saveState();
                renderAll();
                applyTheme();
                applyBackground();
                applyAccent();
            } catch (error) {
                console.error('Invalid import file', error);
            }
        };
        reader.readAsText(file);
    });

    resetBtn?.addEventListener('click', () => {
        const confirmReset = window\.confirm('Reset all saved dashboard data?');
        if (!confirmReset) return;

        dashboardState = structuredClone(defaultState);
        saveState();
        renderAll();
        applyTheme();
        applyBackground();
        applyAccent();
    });

    applyThemeButtonState();
    if (backgroundSelect) backgroundSelect.value = dashboardState.background;
    if (colorSelect) colorSelect.value = dashboardState.accent;
}

function renderAll() {
    renderLinks();
    renderNotes();
    renderTasks();
    applyThemeButtonState();
}

function applyTheme() {
    const body = document.body;
    const isDark = dashboardState.theme === 'dark';

    body.classList.toggle('dark-mode', isDark);
    body.classList.toggle('light-mode', !isDark);
    body.classList.remove('dark', 'light');
    body.classList.add(isDark ? 'dark' : 'light');

    applyThemeButtonState();
}

function applyThemeButtonState() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.innerHTML = dashboardState.theme === 'dark'
        ? '\<i class=\\"fas fa-sun\\">\</i>'
        : '\<i class=\\"fas fa-moon\\">\</i>';
}

function applyBackground() {
    const body = document.body;
    body.classList.remove('gradient-1', 'gradient-2', 'gradient-3', 'dark', 'light');
    body.classList.add(dashboardState.background || 'gradient-1');
}

function applyAccent() {
    document.documentElement.style.setProperty('--primary-color', dashboardState.accent || '#3498db');
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
