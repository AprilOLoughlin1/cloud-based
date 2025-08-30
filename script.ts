// === Theme toggle with localStorage persistence ===
   function switchTheme(): void {
       const body: HTMLElement = document.body;
       const toggleButton: HTMLButtonElement | null = document.querySelector('.toggle-button');
       const themeName: HTMLElement | null = document.getElementById('theme-name');

       if (toggleButton && themeName) {
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
   }

   // Apply saved theme on page load
   (function initTheme(): void {
       const saved: string | null = (() => {
           try { return localStorage.getItem('theme'); } catch (_) { return null; }
       })();
       const body: HTMLElement = document.body;
       const toggleButton: HTMLButtonElement | null = document.querySelector('.toggle-button');
       const themeName: HTMLElement | null = document.getElementById('theme-name');

       if (saved === 'dark' && toggleButton && themeName) {
           body.classList.add('dark-mode');
           toggleButton.classList.add('active');
           themeName.textContent = 'Dark';
       } else if (themeName) {
           themeName.textContent = 'Light';
       }
   })();

   // === Hamburger menu toggle for navigation ===
   function toggleHamburgerMenu(): void {
       const hamburger: HTMLElement | null = document.querySelector('.hamburger');
       const menu: HTMLElement | null = document.querySelector('.hamburger-menu');
       const bars: NodeListOf<HTMLElement> | null = document.querySelectorAll('.bar');

       if (hamburger && menu) {
           hamburger.classList.toggle('open');
           menu.classList.toggle('open');

           bars.forEach((bar: HTMLElement, index: number) => {
               bar.classList.toggle('open');
           });
       }
   }

   // === Dynamic tab management (add, remove, rename, navigate) ===
   interface Tab {
       id: string;
       tabEl: HTMLButtonElement;
       panelEl: HTMLElement;
       containerEl: HTMLElement;
   }

   const tabListEl: HTMLElement | null = document.getElementById('tab-list');
   const tabPanelsEl: HTMLElement | null = document.getElementById('tab-panels');
   const addTabBtn: HTMLButtonElement | null = document.getElementById('add-tab');
   const panelTmpl: HTMLTemplateElement | null = document.getElementById('panel-template') as HTMLTemplateElement;

   let nextNum: number = 1; // always the next number to allocate
   const tabs: Tab[] = []; // Array of tab objects
   const MAX_TABS: number = 15; // limit

   function numFromId(id: string): number {
       const n: number = parseInt(id.split('-').pop()!, 10);
       return Number.isFinite(n) ? n : 0;
   }

   function createTab(title: string = `Tab ${nextNum}`, notes: string = ''): string | null {
       if (!tabListEl || !tabPanelsEl || !panelTmpl || !addTabBtn) return null;

       // enforce tab limit
       if (tabs.length >= MAX_TABS) {
           alert(`You can only have up to ${MAX_TABS} tabs.`);
           return null;
       }

       const id: string = `tab-${nextNum}`;
       const panelId: string = `panel-${id}`;
       nextNum++;

       // Sidebar tab item
       const li: HTMLElement = document.createElement('li');
       li.className = 'tab';
       li.setAttribute('role', 'presentation');

       const btn: HTMLButtonElement = document.createElement('button');
       btn.className = 'tab-btn';
       btn.setAttribute('role', 'tab');
       btn.id = id;
       btn.setAttribute('aria-controls', panelId);
       btn.setAttribute('aria-selected', 'false');
       btn.textContent = title;

       const actions: HTMLElement = document.createElement('div');
       actions.className = 'tab-actions';

       const renameBtn: HTMLButtonElement = document.createElement('button');
       renameBtn.className = 'icon-btn';
       renameBtn.title = 'Rename';
       renameBtn.textContent = '✎';

       const closeBtn: HTMLButtonElement = document.createElement('button');
       closeBtn.className = 'icon-btn';
       closeBtn.title = 'Close';
       closeBtn.textContent = '×';

       actions.append(renameBtn, closeBtn);
       li.append(btn, actions);
       tabListEl.appendChild(li);

       // Panel
       const panel: HTMLElement = document.createElement('div');
       panel.className = 'panel';
       panel.id = panelId;
       panel.setAttribute('role', 'tabpanel');
       panel.setAttribute('aria-labelledby', id);
       panel.setAttribute('aria-hidden', 'true');

       const node: DocumentFragment = panelTmpl.content.cloneNode(true) as DocumentFragment;
       panel.appendChild(node);
       tabPanelsEl.appendChild(panel);

       // Set initial title and notes
       const titleInput: HTMLInputElement | null = panel.querySelector('.panel-title-input');
       const notesTextarea: HTMLTextAreaElement | null = panel.querySelector('.panel-notes');
       if (titleInput && notesTextarea) {
           titleInput.value = title;
           notesTextarea.value = notes;
       }

       // Track
       const item: Tab = { id, tabEl: btn, panelEl: panel, containerEl: li };
       tabs.push(item);

       // Events
       btn.addEventListener('click', () => selectTab(id));
       btn.addEventListener('keydown', (e: KeyboardEvent) => {
           const idx: number = tabs.findIndex(t => t.id === id);
           if (e.key === 'ArrowDown') {
               e.preventDefault();
               const nxt: Tab | undefined = tabs[Math.min(idx + 1, tabs.length - 1)];
               if (nxt) { nxt.tabEl.focus(); selectTab(nxt.id); }
           } else if (e.key === 'ArrowUp') {
               e.preventDefault();
               const prv: Tab | undefined = tabs[Math.max(idx - 1, 0)];
               if (prv) { prv.tabEl.focus(); selectTab(prv.id); }
           }
       });

       renameBtn.addEventListener('click', () => {
           const current: string | null = btn.textContent;
           const newTitle: string | null = prompt('New tab name:', current || '');
           if (newTitle && newTitle.trim() && newTitle.trim().length > 0 && titleInput) {
               btn.textContent = newTitle.trim();
               titleInput.value = newTitle.trim();
               saveTabs();
           } else if (newTitle !== null) {
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
           notesTextarea.addEventListener('input', () => {
               saveTabs();
           });
       }

       // Select new tab
       selectTab(id);
       saveTabs();
       return id;
   }

   function selectTab(id: string): void {
       tabs.forEach((t: Tab) => {
           const active: boolean = t.id === id;
           t.tabEl.setAttribute('aria-selected', active ? 'true' : 'false');
           t.panelEl.setAttribute('aria-hidden', active ? 'false' : 'true');
       });
   }

   function removeTab(id: string): void {
       const idx: number = tabs.findIndex(t => t.id === id);
       if (idx === -1) return;

       const removedNum: number = numFromId(id);

       const [t]: Tab[] = tabs.splice(idx, 1);
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
       const next: Tab | undefined = tabs[Math.min(idx, tabs.length - 1)];
       if (next) {
           selectTab(next.id);
           next.tabEl.focus();
       }
       saveTabs();
   }

   function saveTabs(): void {
       const tabData: { id: string; title: string; notes: string }[] = tabs.map((t: Tab) => ({
           id: t.id,
           title: t.tabEl.textContent || '',
           notes: (t.panelEl.querySelector('.panel-notes') as HTMLTextAreaElement)?.value || ''
       }));
       try {
           localStorage.setItem('tabs', JSON.stringify(tabData));
       } catch (_) {}
   }

   function loadTabs(): void {
       try {
           const savedTabs: { id: string; title: string; notes: string }[] = JSON.parse(localStorage.getItem('tabs') || '[]');
           if (savedTabs.length > 0) {
               savedTabs.forEach((tab: { id: string; title: string; notes: string }) => createTab(tab.title, tab.notes));
               nextNum = Math.max(...savedTabs.map(t => numFromId(t.id))) + 1;
           } else {
               createTab('Welcome');
           }
       } catch (_) {
           createTab('Welcome');
       }
   }

   if (addTabBtn) {
       addTabBtn.addEventListener('click', () => createTab());
   }

   // Load tabs on page load
   loadTabs();