"use strict";
// === Types and Interfaces ===
var Theme;
(function (Theme) {
    Theme["Light"] = "light";
    Theme["Dark"] = "dark";
})(Theme || (Theme = {}));
// === Theme Management ===
function switchTheme(elements) {
    const { body, toggleButton, themeName } = elements;
    if (!toggleButton || !themeName)
        return;
    body.classList.toggle('dark-mode');
    toggleButton.classList.toggle('active');
    const isDarkMode = body.classList.contains('dark-mode');
    const theme = isDarkMode ? Theme.Dark : Theme.Light;
    themeName.textContent = theme;
    try {
        localStorage.setItem('theme', theme);
    }
    catch (error) {
        console.error('Failed to save theme:', error);
    }
}
function initTheme(elements) {
    const { body, toggleButton, themeName } = elements;
    if (!themeName)
        return;
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    }
    catch (error) {
        console.error('Failed to load theme:', error);
    }
    if (savedTheme === Theme.Dark && toggleButton) {
        body.classList.add('dark-mode');
        toggleButton.classList.add('active');
        themeName.textContent = Theme.Dark;
    }
    else {
        themeName.textContent = Theme.Light;
    }
}
// === Hamburger Menu ===
function toggleHamburgerMenu(elements) {
    const { hamburger, menu, bars } = elements;
    if (!hamburger || !menu || !bars)
        return;
    hamburger.classList.toggle('open');
    menu.classList.toggle('open');
    bars.forEach((bar) => bar.classList.toggle('open'));
}
// === Tab Management ===
const tabs = [];
const MAX_TABS = 15;
let nextNum = 1;
function numFromId(id) {
    var _a;
    const n = parseInt((_a = id.split('-').pop()) !== null && _a !== void 0 ? _a : '0', 10);
    return Number.isFinite(n) ? n : 0;
}
function createTab(title = `Tab ${nextNum}`, notes = '', elements) {
    const { tabListEl, tabPanelsEl, panelTmpl, addTabBtn } = elements;
    if (!tabListEl || !tabPanelsEl || !panelTmpl || !addTabBtn)
        return null;
    if (tabs.length >= MAX_TABS) {
        alert(`You can only have up to ${MAX_TABS} tabs.`);
        return null;
    }
    const id = `tab-${nextNum}`;
    const panelId = `panel-${id}`;
    nextNum++;
    // Sidebar tab
    const li = document.createElement('li');
    li.className = 'tab';
    li.setAttribute('role', 'presentation');
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.setAttribute('role', 'tab');
    btn.id = id;
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = title;
    const actions = document.createElement('div');
    actions.className = 'tab-actions';
    const renameBtn = document.createElement('button');
    renameBtn.className = 'icon-btn';
    renameBtn.title = 'Rename';
    renameBtn.textContent = '✎';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'icon-btn';
    closeBtn.title = 'Close';
    closeBtn.textContent = '×';
    actions.append(renameBtn, closeBtn);
    li.append(btn, actions);
    tabListEl.appendChild(li);
    // Panel
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    panel.setAttribute('aria-hidden', 'true');
    const node = panelTmpl.content.cloneNode(true);
    panel.appendChild(node);
    tabPanelsEl.appendChild(panel);
    // Set title/notes
    const titleInput = panel.querySelector('.panel-title-input');
    const notesTextarea = panel.querySelector('.panel-notes');
    if (titleInput && notesTextarea) {
        titleInput.value = title;
        notesTextarea.value = notes;
    }
    // Track tab
    const item = { id, tabEl: btn, panelEl: panel, containerEl: li };
    tabs.push(item);
    // Event handlers
    btn.addEventListener('click', () => selectTab(id));
    btn.addEventListener('keydown', (e) => {
        const idx = tabs.findIndex(t => t.id === id);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nxt = tabs[Math.min(idx + 1, tabs.length - 1)];
            if (nxt) {
                nxt.tabEl.focus();
                selectTab(nxt.id);
            }
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prv = tabs[Math.max(idx - 1, 0)];
            if (prv) {
                prv.tabEl.focus();
                selectTab(prv.id);
            }
        }
    });
    renameBtn.addEventListener('click', () => {
        const current = btn.textContent;
        const newTitle = prompt('New tab name:', current !== null && current !== void 0 ? current : '');
        if (newTitle && newTitle.trim() && titleInput) {
            btn.textContent = newTitle.trim();
            titleInput.value = newTitle.trim();
            saveTabs();
        }
        else if (newTitle !== null) {
            alert('Tab name cannot be empty.');
        }
    });
    closeBtn.addEventListener('click', () => {
        removeTab(id);
        saveTabs();
    });
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            btn.textContent = titleInput.value || `Tab ${numFromId(id)}`;
            saveTabs();
        });
    }
    if (notesTextarea) {
        notesTextarea.addEventListener('input', () => saveTabs());
    }
    selectTab(id);
    saveTabs();
    return id;
}
function selectTab(id) {
    tabs.forEach(t => {
        const active = t.id === id;
        t.tabEl.setAttribute('aria-selected', `${active}`);
        t.panelEl.setAttribute('aria-hidden', `${!active}`);
    });
}
function removeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1)
        return;
    const removedNum = numFromId(id);
    const [t] = tabs.splice(idx, 1);
    t.containerEl.remove();
    t.panelEl.remove();
    if (tabs.length === 0) {
        nextNum = 1;
        saveTabs();
        return;
    }
    if (removedNum === nextNum - 1) {
        nextNum = Math.max(1, nextNum - 1);
    }
    const next = tabs[Math.min(idx, tabs.length - 1)];
    if (next) {
        selectTab(next.id);
        next.tabEl.focus();
    }
    saveTabs();
}
function saveTabs() {
    const tabData = tabs.map(t => {
        var _a, _b, _c;
        return ({
            id: t.id,
            title: (_a = t.tabEl.textContent) !== null && _a !== void 0 ? _a : '',
            notes: (_c = (_b = t.panelEl.querySelector('.panel-notes')) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : ''
        });
    });
    try {
        localStorage.setItem('tabs', JSON.stringify(tabData));
    }
    catch (error) {
        console.error('Failed to save tabs:', error);
    }
}
function loadTabs(elements) {
    var _a;
    try {
        const savedTabs = JSON.parse((_a = localStorage.getItem('tabs')) !== null && _a !== void 0 ? _a : '[]');
        if (savedTabs.length > 0) {
            savedTabs.forEach(tab => createTab(tab.title, tab.notes, elements));
            nextNum = Math.max(...savedTabs.map(t => numFromId(t.id))) + 1;
        }
        else {
            createTab('Welcome', '', elements);
        }
    }
    catch (error) {
        console.error('Failed to load tabs:', error);
        createTab('Welcome', '', elements);
    }
}
// === Initialize ===
const elements = {
    body: document.body,
    toggleButton: document.querySelector('.toggle-button'),
    themeName: document.getElementById('theme-name'),
    hamburger: document.querySelector('.hamburger'),
    menu: document.querySelector('.hamburger-menu'),
    bars: document.querySelectorAll('.bar'),
    tabListEl: document.getElementById('tab-list'),
    tabPanelsEl: document.getElementById('tab-panels'),
    addTabBtn: document.getElementById('add-tab'),
    panelTmpl: document.getElementById('panel-template')
};
function initialize() {
    if (elements.toggleButton) {
        elements.toggleButton.addEventListener('click', () => switchTheme(elements));
    }
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', () => toggleHamburgerMenu(elements));
    }
    if (elements.addTabBtn) {
        elements.addTabBtn.addEventListener('click', () => createTab(undefined, undefined, elements));
    }
    initTheme(elements);
    loadTabs(elements);
}
initialize();
