// === Theme toggle with localStorage persistence ===
function switchTheme() {
    var body = document.body;
    var toggleButton = document.querySelector('.toggle-button');
    var themeName = document.getElementById('theme-name');
    if (toggleButton && themeName) {
        body.classList.toggle('dark-mode');
        toggleButton.classList.toggle('active');
        if (body.classList.contains('dark-mode')) {
            themeName.textContent = 'Dark';
            try {
                localStorage.setItem('theme', 'dark');
            }
            catch (_) { }
        }
        else {
            themeName.textContent = 'Light';
            try {
                localStorage.setItem('theme', 'light');
            }
            catch (_) { }
        }
    }
}
// Apply saved theme on page load
(function initTheme() {
    var saved = (function () {
        try {
            return localStorage.getItem('theme');
        }
        catch (_) {
            return null;
        }
    })();
    var body = document.body;
    var toggleButton = document.querySelector('.toggle-button');
    var themeName = document.getElementById('theme-name');
    if (saved === 'dark' && toggleButton && themeName) {
        body.classList.add('dark-mode');
        toggleButton.classList.add('active');
        themeName.textContent = 'Dark';
    }
    else if (themeName) {
        themeName.textContent = 'Light';
    }
})();
// === Hamburger menu toggle for navigation ===
function toggleHamburgerMenu() {
    var hamburger = document.querySelector('.hamburger');
    var menu = document.querySelector('.hamburger-menu');
    var bars = document.querySelectorAll('.bar');
    if (hamburger && menu) {
        hamburger.classList.toggle('open');
        menu.classList.toggle('open');
        bars.forEach(function (bar, index) {
            bar.classList.toggle('open');
        });
    }
}
var tabListEl = document.getElementById('tab-list');
var tabPanelsEl = document.getElementById('tab-panels');
var addTabBtn = document.getElementById('add-tab');
var panelTmpl = document.getElementById('panel-template');
var nextNum = 1; // always the next number to allocate
var tabs = []; // Array of tab objects
var MAX_TABS = 15; // limit
function numFromId(id) {
    var n = parseInt(id.split('-').pop(), 10);
    return Number.isFinite(n) ? n : 0;
}
function createTab(title, notes) {
    if (title === void 0) { title = "Tab ".concat(nextNum); }
    if (notes === void 0) { notes = ''; }
    if (!tabListEl || !tabPanelsEl || !panelTmpl || !addTabBtn)
        return null;
    // enforce tab limit
    if (tabs.length >= MAX_TABS) {
        alert("You can only have up to ".concat(MAX_TABS, " tabs."));
        return null;
    }
    var id = "tab-".concat(nextNum);
    var panelId = "panel-".concat(id);
    nextNum++;
    // Sidebar tab item
    var li = document.createElement('li');
    li.className = 'tab';
    li.setAttribute('role', 'presentation');
    var btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.setAttribute('role', 'tab');
    btn.id = id;
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = title;
    var actions = document.createElement('div');
    actions.className = 'tab-actions';
    var renameBtn = document.createElement('button');
    renameBtn.className = 'icon-btn';
    renameBtn.title = 'Rename';
    renameBtn.textContent = '✎';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'icon-btn';
    closeBtn.title = 'Close';
    closeBtn.textContent = '×';
    actions.append(renameBtn, closeBtn);
    li.append(btn, actions);
    tabListEl.appendChild(li);
    // Panel
    var panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    panel.setAttribute('aria-hidden', 'true');
    var node = panelTmpl.content.cloneNode(true);
    panel.appendChild(node);
    tabPanelsEl.appendChild(panel);
    // Set initial title and notes
    var titleInput = panel.querySelector('.panel-title-input');
    var notesTextarea = panel.querySelector('.panel-notes');
    if (titleInput && notesTextarea) {
        titleInput.value = title;
        notesTextarea.value = notes;
    }
    // Track
    var item = { id: id, tabEl: btn, panelEl: panel, containerEl: li };
    tabs.push(item);
    // Events
    btn.addEventListener('click', function () { return selectTab(id); });
    btn.addEventListener('keydown', function (e) {
        var idx = tabs.findIndex(function (t) { return t.id === id; });
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            var nxt = tabs[Math.min(idx + 1, tabs.length - 1)];
            if (nxt) {
                nxt.tabEl.focus();
                selectTab(nxt.id);
            }
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var prv = tabs[Math.max(idx - 1, 0)];
            if (prv) {
                prv.tabEl.focus();
                selectTab(prv.id);
            }
        }
    });
    renameBtn.addEventListener('click', function () {
        var current = btn.textContent;
        var newTitle = prompt('New tab name:', current || '');
        if (newTitle && newTitle.trim() && newTitle.trim().length > 0 && titleInput) {
            btn.textContent = newTitle.trim();
            titleInput.value = newTitle.trim();
            saveTabs();
        }
        else if (newTitle !== null) {
            alert('Tab name cannot be empty.');
        }
    });
    closeBtn.addEventListener('click', function () {
        removeTab(id);
        saveTabs();
    });
    if (titleInput) {
        titleInput.addEventListener('input', function () {
            btn.textContent = titleInput.value || "Tab ".concat(numFromId(id));
            saveTabs();
        });
    }
    if (notesTextarea) {
        notesTextarea.addEventListener('input', function () {
            saveTabs();
        });
    }
    // Select new tab
    selectTab(id);
    saveTabs();
    return id;
}
function selectTab(id) {
    tabs.forEach(function (t) {
        var active = t.id === id;
        t.tabEl.setAttribute('aria-selected', active ? 'true' : 'false');
        t.panelEl.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
}
function removeTab(id) {
    var idx = tabs.findIndex(function (t) { return t.id === id; });
    if (idx === -1)
        return;
    var removedNum = numFromId(id);
    var t = tabs.splice(idx, 1)[0];
    t.containerEl.remove();
    t.panelEl.remove();
    if (tabs.length === 0) {
        // reset counter fully if no tabs left
        nextNum = 1;
        saveTabs();
        return;
    }
    // If most recent number was removed, roll counter back
    if (removedNum === nextNum - 1) {
        nextNum = Math.max(1, nextNum - 1);
    }
    // Focus/select a neighbor
    var next = tabs[Math.min(idx, tabs.length - 1)];
    if (next) {
        selectTab(next.id);
        next.tabEl.focus();
    }
    saveTabs();
}
function saveTabs() {
    var tabData = tabs.map(function (t) {
        var _a;
        return ({
            id: t.id,
            title: t.tabEl.textContent || '',
            notes: ((_a = t.panelEl.querySelector('.panel-notes')) === null || _a === void 0 ? void 0 : _a.value) || ''
        });
    });
    try {
        localStorage.setItem('tabs', JSON.stringify(tabData));
    }
    catch (_) { }
}
function loadTabs() {
    try {
        var savedTabs = JSON.parse(localStorage.getItem('tabs') || '[]');
        if (savedTabs.length > 0) {
            savedTabs.forEach(function (tab) { return createTab(tab.title, tab.notes); });
            nextNum = Math.max.apply(Math, savedTabs.map(function (t) { return numFromId(t.id); })) + 1;
        }
        else {
            createTab('Welcome');
        }
    }
    catch (_) {
        createTab('Welcome');
    }
}
if (addTabBtn) {
    addTabBtn.addEventListener('click', function () { return createTab(); });
}
// Load tabs on page load
loadTabs();
