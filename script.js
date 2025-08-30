// === Theme toggle with localStorage persistence ===
   function switchTheme() {
       const body = document.body;
       const toggleButton = document.querySelector('.toggle-button');
       const themeName = document.getElementById('theme-name');

       body.classList.toggle('dark-mode');
       toggleButton.classList.toggle('active');

       if (body.classList.contains('dark-mode')) {
           themeName.textContent = 'Dark';
           try { localStorage.setItem('theme', 'dark'); } catch (_) {}
       } else {
           themeName.textContent = 'Light';
           try { localStorage.setItem('theme', 'light'); } catch (_) {}
       }
   }

   (function initTheme() {
       const saved = (() => {
           try { return localStorage.getItem('theme'); } catch (_) { return null; }
       })();
       const body = document.body;
       const toggleButton = document.querySelector('.toggle-button');
       const themeName = document.getElementById('theme-name');

       if (saved === 'dark') {
           body.classList.add('dark-mode');
           toggleButton.classList.add('active');
           themeName.textContent = 'Dark';
       } else {
           themeName.textContent = 'Light';
       }
   })();

   // Hamburger menu toggle for navigation //
   function toggleHamburgerMenu() {
       const hamburger = document.querySelector('.hamburger');
       const menu = document.querySelector('.hamburger-menu');
       const bars = document.querySelectorAll('.bar');

       hamburger.classList.toggle('open');
       menu.classList.toggle('open');

       bars.forEach((bar, index) => {
           bar.classList.toggle('open');
       });
   }

   const tabListEl = document.getElementById('tab-list');
   const tabPanelsEl = document.getElementById('tab-panels');
   const addTabBtn = document.getElementById('add-tab');
   const panelTmpl = document.getElementById('panel-template');

   let nextNum = 1; 
   const tabs = []; 
   const MAX_TABS = 15; 

   function numFromId(id) {
       const n = parseInt(id.split('-').pop(), 10);
       return Number.isFinite(n) ? n : 0;
   }

   function createTab(title = `Tab ${nextNum}`) {
       if (tabs.length >= MAX_TABS) {
           alert(`You can only have up to ${MAX_TABS} tabs.`);
           return null;
       }

       const id = `tab-${nextNum}`;
       const panelId = `panel-${id}`;
       nextNum++;

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

       const panel = document.createElement('div');
       panel.className = 'panel';
       panel.id = panelId;
       panel.setAttribute('role', 'tabpanel');
       panel.setAttribute('aria-labelledby', id);
       panel.setAttribute('aria-hidden', 'true');

       const node = panelTmpl.content.cloneNode(true);
       panel.appendChild(node);
       tabPanelsEl.appendChild(panel);

       const item = { id, tabEl: btn, panelEl: panel, containerEl: li };
       tabs.push(item);

       btn.addEventListener('click', () => selectTab(id));
       btn.addEventListener('keydown', (e) => {
           const idx = tabs.findIndex(t => t.id === id);
           if (e.key === 'ArrowDown') {
               e.preventDefault();
               const nxt = tabs[Math.min(idx + 1, tabs.length - 1)];
               if (nxt) { nxt.tabEl.focus(); selectTab(nxt.id); }
           } else if (e.key === 'ArrowUp') {
               e.preventDefault();
               const prv = tabs[Math.max(idx - 1, 0)];
               if (prv) { prv.tabEl.focus(); selectTab(prv.id); }
           }
       });

       renameBtn.addEventListener('click', () => {
           const current = btn.textContent;
           const newTitle = prompt('New tab name:', current);
           if (newTitle && newTitle.trim() && newTitle.trim().length > 0) {
               btn.textContent = newTitle.trim();
           } else if (newTitle !== null) {
               alert('Tab name cannot be empty.');
           }
       });

       closeBtn.addEventListener('click', () => removeTab(id));

       // Select new tab
       selectTab(id);
       return id;
   }

   function selectTab(id) {
       tabs.forEach(t => {
           const active = t.id === id;
           t.tabEl.setAttribute('aria-selected', active ? 'true' : 'false');
           t.panelEl.setAttribute('aria-hidden', active ? 'false' : 'true');
       });
   }

   function removeTab(id) {
       const idx = tabs.findIndex(t => t.id === id);
       if (idx === -1) return;

       const removedNum = numFromId(id);

       const [t] = tabs.splice(idx, 1);
       t.containerEl.remove();
       t.panelEl.remove();

       if (tabs.length === 0) {
           // reset counter fully if no tabs left
           nextNum = 1;
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
   }

   addTabBtn.addEventListener('click', () => createTab());

   
   createTab('Welcome');