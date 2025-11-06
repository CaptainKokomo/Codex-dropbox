function renderDesktopShellError(message = 'Desktop APIs unavailable') {
  const fallback = document.createElement('section');
  fallback.className = 'fatal-error';
  fallback.innerHTML = `
    <h1>Desktop shell not detected</h1>
    <p>This UI needs the Electron desktop app to run. Use the launchers in the project folder or <strong>npm start</strong>.</p>
    <p>If you opened <code>renderer/index.html</code> directly in a browser, close it and launch the desktop build instead.</p>
    <p class="fatal-error__details">${message}</p>
  `;
  document.body.innerHTML = '';
  document.body.appendChild(fallback);
}

async function ensureDesktopBridge({ attempts = 40, interval = 50 } = {}) {
  if (window?.brain) return window.brain;
  return new Promise((resolve, reject) => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window?.brain) {
        clearInterval(timer);
        resolve(window.brain);
      } else if (tries >= attempts) {
        clearInterval(timer);
        reject(new Error('Desktop APIs unavailable'));
      }
    }, interval);
  });
}

const state = {
  tree: [],
  selected: null,
  note: null,
  frontmatter: {},
  tags: [],
  backlinks: [],
  structured: {},
  slashMenu: null,
  aiDraft: null,
  versions: [],
};

const elements = {
  tree: document.getElementById('spaceTree'),
  breadcrumbs: document.getElementById('breadcrumbs'),
  editor: document.getElementById('editor'),
  tagsDisplay: document.getElementById('tagsDisplay'),
  backlinks: document.getElementById('backlinksDisplay'),
  toggleTags: document.getElementById('toggleTags'),
  tagList: document.getElementById('tagList'),
  quickCaptureBtn: document.getElementById('quickCaptureBtn'),
  quickCaptureDialog: document.getElementById('quickCaptureDialog'),
  quickCaptureForm: document.getElementById('quickCaptureForm'),
  quickCaptureTitle: document.getElementById('quickCaptureTitle'),
  quickCaptureContent: document.getElementById('quickCaptureContent'),
  quickCaptureCancel: document.getElementById('quickCaptureCancel'),
  searchDialog: document.getElementById('searchDialog'),
  searchInput: document.getElementById('searchInput'),
  searchForm: document.getElementById('searchForm'),
  searchMode: document.getElementById('searchMode'),
  searchResults: document.getElementById('searchResults'),
  versionsDialog: document.getElementById('versionsDialog'),
  versionsList: document.getElementById('versionsList'),
  versionPreview: document.getElementById('versionPreview'),
  toastContainer: document.getElementById('toastContainer'),
  aiChatHistory: document.getElementById('aiChatHistory'),
  aiChatForm: document.getElementById('aiChatForm'),
  aiChatInput: document.getElementById('aiChatInput'),
  aiTabChat: document.getElementById('aiTabChat'),
  aiTabTools: document.getElementById('aiTabTools'),
  aiChatPanel: document.getElementById('aiChat'),
  aiToolsPanel: document.getElementById('aiTools'),
  aiTools: document.querySelector('.ai-tools'),
  aiDiff: document.getElementById('aiDiff'),
  applyAi: document.getElementById('applyAi'),
  discardAi: document.getElementById('discardAi'),
  applyAiNew: document.getElementById('applyAiNew'),
  aiContext: document.getElementById('aiContext'),
  aiStatusBar: document.getElementById('aiStatusBar'),
  aiStatusText: document.getElementById('aiStatusText'),
  aiStatusDot: document.getElementById('aiStatusDot'),
  testAi: document.getElementById('testAi'),
  openAiSettings: document.getElementById('openAiSettings'),
  openSearch: document.getElementById('openSearch'),
  openVersions: document.getElementById('openVersions'),
  newSpace: document.getElementById('newSpace'),
  toggleSidebar: document.getElementById('toggleSidebar'),
  contextMenu: document.getElementById('contextMenu'),
  entityDialog: document.getElementById('entityDialog'),
  entityDialogTitle: document.getElementById('entityDialogTitle'),
  entityDialogLabel: document.getElementById('entityDialogLabel'),
  entityDialogInput: document.getElementById('entityDialogInput'),
  entityDialogSubmit: document.getElementById('entityDialogSubmit'),
  confirmDialog: document.getElementById('confirmDialog'),
  confirmDialogTitle: document.getElementById('confirmDialogTitle'),
  confirmDialogMessage: document.getElementById('confirmDialogMessage'),
  confirmDialogConfirm: document.getElementById('confirmDialogConfirm'),
  selectDialog: document.getElementById('selectDialog'),
  selectDialogTitle: document.getElementById('selectDialogTitle'),
  selectDialogLabel: document.getElementById('selectDialogLabel'),
  selectDialogInput: document.getElementById('selectDialogInput'),
  selectDialogSubmit: document.getElementById('selectDialogSubmit'),
  aiConfigDialog: document.getElementById('aiConfigDialog'),
  aiConfigForm: document.getElementById('aiConfigForm'),
  aiConfigBaseUrl: document.getElementById('aiConfigBaseUrl'),
  aiConfigEndpoint: document.getElementById('aiConfigEndpoint'),
  aiConfigModel: document.getElementById('aiConfigModel'),
  aiConfigTemperature: document.getElementById('aiConfigTemperature'),
  aiConfigApiKey: document.getElementById('aiConfigApiKey'),
  aiConfigCancel: document.getElementById('aiConfigCancel'),
};

async function init() {
  setupGlobalErrorHandling();
  await refreshTree();
  bindEvents();
  elements.editor.addEventListener('keydown', handleEditorKeydown);
  elements.editor.addEventListener('input', debounce(handleEditorInput, 250));
  window.addEventListener('keydown', handleGlobalShortcuts);
  window.brain.onStorageUpdate(() => refreshTree(false));
  window.brain.onConfigUpdate(() => loadAiStatus({ silent: true }));
  renderEmptyState();
  loadTags();
  loadAiStatus({ silent: true });
}

function bindEvents() {
  elements.toggleTags.addEventListener('click', () => {
    const hidden = elements.tagList.hasAttribute('hidden');
    if (hidden) {
      loadTags();
      elements.tagList.removeAttribute('hidden');
    } else {
      elements.tagList.setAttribute('hidden', '');
    }
  });

  elements.quickCaptureBtn.addEventListener('click', openQuickCapture);
  elements.quickCaptureForm.addEventListener('submit', handleQuickCaptureSubmit);
  elements.quickCaptureCancel.addEventListener('click', () => elements.quickCaptureDialog.close());
  elements.quickCaptureDialog.addEventListener('cancel', () => elements.quickCaptureDialog.close());

  elements.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  elements.searchInput.addEventListener('input', debounce(handleSearch, 250));

  elements.openSearch.addEventListener('click', () => {
    openSearch();
  });

  elements.openVersions.addEventListener('click', loadVersions);

  elements.versionsDialog.addEventListener('close', handleVersionDialogClose);

  elements.aiTabChat.addEventListener('click', () => switchAiTab('chat'));
  elements.aiTabTools.addEventListener('click', () => switchAiTab('tools'));
  elements.aiChatForm.addEventListener('submit', handleAiChatSubmit);
  elements.aiTools.addEventListener('click', handleAiToolClick);
  elements.applyAi.addEventListener('click', () => applyAiResult('apply'));
  elements.discardAi.addEventListener('click', () => applyAiResult('discard'));
  elements.applyAiNew.addEventListener('click', () => applyAiResult('new'));
  elements.newSpace.addEventListener('click', () => promptCreate('space'));
  elements.toggleSidebar.addEventListener('click', toggleSidebar);
  elements.testAi.addEventListener('click', () => loadAiStatus());
  elements.openAiSettings.addEventListener('click', openAiConfig);
  elements.aiConfigForm.addEventListener('submit', handleAiConfigSubmit);
  elements.aiConfigCancel.addEventListener('click', () => elements.aiConfigDialog.close());
  elements.aiConfigDialog.addEventListener('cancel', () => elements.aiConfigDialog.close());
  document.addEventListener('click', handleGlobalClick);
}

async function refreshTree(openFirst = true) {
  const tree = await window.brain.listTree();
  state.tree = tree;
  renderTree();
  if (openFirst && !state.selected) {
    const firstSpace = tree[0];
    if (firstSpace?.sections?.length && firstSpace.sections[0].notes.length) {
      selectNote(firstSpace.name, firstSpace.sections[0].name, firstSpace.sections[0].notes[0]);
    }
  } else if (state.selected) {
    highlightSelected();
  }
}

function renderTree() {
  elements.tree.innerHTML = '';
  const ul = document.createElement('ul');
  state.tree.forEach((space) => {
    const spaceLi = document.createElement('li');
    const spaceBtn = createTreeButton(space.name, 'space', { space: space.name });
    spaceLi.appendChild(spaceBtn);

    const sectionUl = document.createElement('ul');
    space.sections.forEach((section) => {
      const sectionLi = document.createElement('li');
      const sectionBtn = createTreeButton(section.name, 'section', { space: space.name, section: section.name });
      sectionLi.appendChild(sectionBtn);

      const notesUl = document.createElement('ul');
      section.notes.forEach((note) => {
        const noteLi = document.createElement('li');
        const noteBtn = createTreeButton(note, 'note', { space: space.name, section: section.name, note });
        noteLi.appendChild(noteBtn);
        notesUl.appendChild(noteLi);
      });

      const newNoteBtn = document.createElement('button');
      newNoteBtn.textContent = '+ New Note';
      newNoteBtn.className = 'tree-item';
      newNoteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        promptCreate('note', { space: space.name, section: section.name });
      });
      const newNoteLi = document.createElement('li');
      newNoteLi.appendChild(newNoteBtn);
      notesUl.appendChild(newNoteLi);

      sectionLi.appendChild(notesUl);
      sectionUl.appendChild(sectionLi);
    });

    const newSectionBtn = document.createElement('button');
    newSectionBtn.textContent = '+ New Section';
    newSectionBtn.className = 'tree-item';
    newSectionBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      promptCreate('section', { space: space.name });
    });
    const newSectionLi = document.createElement('li');
    newSectionLi.appendChild(newSectionBtn);
    sectionUl.appendChild(newSectionLi);

    spaceLi.appendChild(sectionUl);
    ul.appendChild(spaceLi);
  });
  elements.tree.appendChild(ul);
}

function createTreeButton(label, type, payload) {
  const button = document.createElement('button');
  button.className = 'tree-item';
  button.textContent = label;
  button.dataset.type = type;
  Object.entries(payload).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (type === 'note') {
      selectNote(payload.space, payload.section, payload.note);
    }
  });
  button.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    openContextMenu(event, type, payload);
  });
  return button;
}

async function selectNote(space, section, note) {
  state.selected = { space, section, note };
  const data = await window.brain.readNote({ space, section, note });
  state.note = data.body;
  state.frontmatter = data.frontmatter || {};
  state.tags = data.tags || [];
  state.backlinks = data.backlinks || [];
  renderBreadcrumbs();
  renderEditor();
  renderTagsBacklinks();
  highlightSelected();
}

function renderBreadcrumbs() {
  if (!state.selected) {
    elements.breadcrumbs.textContent = '';
    return;
  }
  const { space, section, note } = state.selected;
  elements.breadcrumbs.innerHTML = `
    <span>${space}</span>
    <span>/</span>
    <span>${section}</span>
    <span>/</span>
    <strong>${note}</strong>
  `;
}

function renderEditor() {
  const editor = elements.editor;
  editor.innerHTML = '';
  if (!state.note) {
    renderEmptyState();
    return;
  }
  const blocks = parseBlocks(state.note);
  blocks.forEach((block) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'block';
    blockEl.dataset.type = block.type;
    let editable;
    if (block.type === 'code') {
      editable = document.createElement('textarea');
      editable.value = block.content.replace(/^```[\s\S]*?\n|```$/g, '').trim();
      editable.rows = Math.max(4, editable.value.split('\n').length);
    } else if (block.type === 'checkbox') {
      editable = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = block.checked;
      const span = document.createElement('span');
      span.textContent = block.text;
      editable.appendChild(checkbox);
      editable.appendChild(span);
      editable.className = 'checkbox-block';
      checkbox.addEventListener('change', () => {
        block.checked = checkbox.checked;
        block.text = span.textContent;
        persistBlocks();
      });
      span.contentEditable = 'true';
      span.addEventListener('blur', () => {
        block.text = span.textContent;
        persistBlocks();
      });
    } else {
      editable = document.createElement('div');
      editable.contentEditable = 'true';
      editable.innerText = block.content;
    }
    editable.dataset.blockId = block.id;
    blockEl.appendChild(editable);
    if (block.type !== 'checkbox') {
      editable.addEventListener('blur', () => {
        block.content = editable.innerText;
        persistBlocks();
      });
    }
    editor.appendChild(blockEl);
  });
}

function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let buffer = [];
  let type = 'paragraph';
  let inCode = false;
  let codeLang = '';
  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        buffer.push(line);
        type = 'code';
      } else {
        buffer.push(line);
        blocks.push({ id: `${index}-${Math.random()}`, type: 'code', content: buffer.join('\n'), lang: codeLang });
        buffer = [];
        type = 'paragraph';
        inCode = false;
      }
      return;
    }
    if (inCode) {
      buffer.push(line);
      return;
    }
    if (/^\s*$/.test(line)) {
      if (buffer.length) {
        blocks.push(buildBlock(buffer, type, index));
        buffer = [];
        type = 'paragraph';
      }
      return;
    }
    if (line.startsWith('#')) {
      if (buffer.length) {
        blocks.push(buildBlock(buffer, type, index));
        buffer = [];
      }
      type = 'heading';
      buffer.push(line);
      return;
    }
    if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      if (buffer.length) {
        blocks.push(buildBlock(buffer, type, index));
        buffer = [];
      }
      const checked = line.startsWith('- [x]');
      blocks.push({ id: `${index}-${Math.random()}`, type: 'checkbox', checked, text: line.replace(/- \[[ x]\] /, '') });
      type = 'paragraph';
      return;
    }
    if (line.startsWith('- ')) {
      type = 'list';
      buffer.push(line);
      return;
    }
    if (line.startsWith('>')) {
      type = 'quote';
      buffer.push(line);
      return;
    }
    buffer.push(line);
  });
  if (buffer.length) {
    blocks.push(buildBlock(buffer, type, lines.length));
  }
  return blocks;
}

function buildBlock(buffer, type, index) {
  const content = buffer.join('\n');
  if (type === 'heading') {
    return { id: `${index}-${Math.random()}`, type: 'heading', content };
  }
  if (type === 'list') {
    return { id: `${index}-${Math.random()}`, type: 'list', content };
  }
  if (type === 'quote') {
    return { id: `${index}-${Math.random()}`, type: 'quote', content };
  }
  return { id: `${index}-${Math.random()}`, type: 'paragraph', content };
}

function persistBlocks() {
  const blocks = Array.from(elements.editor.querySelectorAll('.block'));
  const lines = [];
  blocks.forEach((block) => {
    const type = block.dataset.type;
    const editable = block.firstElementChild;
    if (type === 'code') {
      lines.push('```');
      lines.push(editable.value);
      lines.push('```');
      lines.push('');
    } else if (type === 'checkbox') {
      const checkbox = editable.querySelector('input[type="checkbox"]');
      const span = editable.querySelector('span');
      lines.push(`- [${checkbox.checked ? 'x' : ' '}] ${span.textContent}`);
    } else {
      lines.push(editable.innerText);
      lines.push('');
    }
  });
  const body = lines.join('\n').trim();
  state.note = body;
  saveNote();
}

const saveNote = debounce(async () => {
  if (!state.selected || state.note === undefined || state.note === null) return;
  await window.brain.writeNote({
    space: state.selected.space,
    section: state.selected.section,
    note: state.selected.note,
    body: state.note,
    frontmatter: state.frontmatter,
  });
  showToast('Saved');
}, 400);

function renderTagsBacklinks() {
  elements.tagsDisplay.innerHTML = state.tags.length
    ? `Tags: ${state.tags.map((tag) => `<button data-tag="${tag}">#${tag}</button>`).join(' ')}`
    : 'No tags';
  elements.backlinks.innerHTML = state.backlinks.length
    ? `Linked from: ${state.backlinks
        .map((link) => `<button data-space="${link.space}" data-section="${link.section}" data-note="${link.note}">${link.note}</button>`)
        .join(', ')}`
    : 'No backlinks';
  elements.tagsDisplay.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => filterByTag(button.dataset.tag));
  });
  elements.backlinks.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      selectNote(button.dataset.space, button.dataset.section, button.dataset.note);
    });
  });
}

async function loadTags() {
  const tags = await window.brain.listTags();
  elements.tagList.innerHTML = '';
  tags.forEach((item) => {
    const button = document.createElement('button');
    button.textContent = `#${item.tag} (${item.notes.length})`;
    button.addEventListener('click', () => filterByTag(item.tag));
    elements.tagList.appendChild(button);
  });
}

function filterByTag(tag) {
  const filtered = [];
  state.tree.forEach((space) => {
    space.sections.forEach((section) => {
      section.notes.forEach((note) => {
        window.brain.readNote({ space: space.name, section: section.name, note }).then((data) => {
          if (data.tags.includes(tag)) {
            filtered.push({ space: space.name, section: section.name, note });
            renderSearchResults(
              filtered.map((item) => ({
                space: item.space,
                section: item.section,
                note: item.note,
                snippet: `#${tag}`,
                score: 2,
              }))
            );
            elements.searchDialog.showModal();
          }
        });
      });
    });
  });
}

function renderEmptyState() {
  elements.editor.innerHTML = `
    <div class="empty">
      <h2>Select a note to start writing</h2>
      <p>Use the sidebar or <strong>Ctrl+N</strong> to capture something new instantly.</p>
    </div>
  `;
}

function handleEditorKeydown(event) {
  if (event.key === '/' && !state.slashMenu) {
    event.preventDefault();
    openSlashMenu(event);
  }
}

function openSlashMenu(event) {
  const commands = [
    { label: 'Heading', insert: '\n# Heading\n' },
    { label: 'To-do', insert: '\n- [ ] Task\n' },
    { label: 'Bullet List', insert: '\n- Item\n' },
    { label: 'Quote', insert: '\n> Quote\n' },
    { label: 'Code Block', insert: '\n```\ncode\n```\n' },
    { label: 'Divider', insert: '\n---\n' },
  ];
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${event.clientX || 120}px`;
  menu.style.top = `${event.clientY || 120}px`;
  commands.forEach((cmd) => {
    const btn = document.createElement('button');
    btn.textContent = cmd.label;
    btn.addEventListener('click', () => {
      insertIntoNote(cmd.insert);
      closeSlashMenu();
    });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  state.slashMenu = menu;
}

function closeSlashMenu() {
  if (state.slashMenu) {
    state.slashMenu.remove();
    state.slashMenu = null;
  }
}

function insertIntoNote(snippet) {
  if (!state.note) state.note = '';
  const selection = window.getSelection();
  const focusNode = selection?.focusNode;
  if (focusNode && focusNode.nodeType === Node.TEXT_NODE) {
    const text = focusNode.textContent;
    const offset = selection.focusOffset;
    focusNode.textContent = `${text.slice(0, offset)}${snippet}${text.slice(offset)}`;
    persistBlocks();
  } else {
    state.note += `\n${snippet}`;
    renderEditor();
    persistBlocks();
  }
}

function handleEditorInput() {
  closeSlashMenu();
}

function handleGlobalShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    openQuickCapture();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
}

function openQuickCapture() {
  elements.quickCaptureTitle.value = '';
  elements.quickCaptureContent.value = '';
  elements.quickCaptureDialog.showModal();
  elements.quickCaptureTitle.focus();
}

async function handleQuickCaptureSubmit(event) {
  event.preventDefault();
  const title = elements.quickCaptureTitle.value.trim();
  const content = elements.quickCaptureContent.value.trim();
  if (!content) {
    showToast('Capture needs content');
    return;
  }
  try {
    const location = await window.brain.quickCapture({ title, content });
    showToast('Captured to Inbox');
    elements.quickCaptureDialog.close();
    refreshTree(false);
    selectNote(location.space, location.section, location.note);
  } catch (error) {
    console.error(error);
    showToast('Quick capture failed');
  }
}

function openSearch() {
  elements.searchDialog.showModal();
  elements.searchInput.focus();
}

async function handleSearch() {
  const query = elements.searchInput.value.trim();
  const mode = elements.searchMode.value;
  const results = await window.brain.search({ query, mode });
  renderSearchResults(results);
}

function renderSearchResults(results) {
  elements.searchResults.innerHTML = '';
  results.forEach((result) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.innerHTML = `<strong>${result.note}</strong><span>${result.space} / ${result.section}</span><p>${result.snippet}</p>`;
    button.addEventListener('click', () => {
      elements.searchDialog.close();
      selectNote(result.space, result.section, result.note);
    });
    li.appendChild(button);
    elements.searchResults.appendChild(li);
  });
}

function openContextMenu(event, type, payload) {
  const menu = elements.contextMenu;
  menu.innerHTML = '';
  const items = [];
  if (type === 'space') {
    items.push({ label: 'New Section', action: () => promptCreate('section', { space: payload.space }) });
    items.push({ label: 'Rename Space', action: () => promptRename('space', payload) });
  }
  if (type === 'section') {
    items.push({ label: 'New Note', action: () => promptCreate('note', payload) });
    items.push({ label: 'Rename Section', action: () => promptRename('section', payload) });
    items.push({ label: 'Toggle Structured List', action: () => toggleStructured(payload) });
  }
  if (type === 'note') {
    items.push({ label: 'Rename Note', action: () => promptRename('note', payload) });
    items.push({ label: 'Delete Note', action: () => deleteNote(payload) });
  }
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.textContent = item.label;
    btn.addEventListener('click', () => {
      item.action();
      hideContextMenu();
    });
    menu.appendChild(btn);
  });
  menu.style.left = `${event.pageX}px`;
  menu.style.top = `${event.pageY}px`;
  menu.hidden = false;
}

function hideContextMenu() {
  elements.contextMenu.hidden = true;
}

function handleGlobalClick(event) {
  if (state.slashMenu && !state.slashMenu.contains(event.target)) {
    closeSlashMenu();
  }
  if (!elements.contextMenu.contains(event.target)) {
    hideContextMenu();
  }
}

async function promptCreate(type, payload = {}) {
  const label = type === 'space' ? 'Space' : type === 'section' ? 'Section' : 'Note';
  const name = await requestTextDialog({
    title: `Create ${label}`,
    label: `${label} name`,
    submitText: 'Create',
  });
  if (!name) return;
  await window.brain.create({ type, ...payload, name });
  showToast(`${type} created`);
  refreshTree(false);
}

async function promptRename(type, payload) {
  const current =
    type === 'space' ? payload.space : type === 'section' ? payload.section : payload.note;
  const label = type === 'space' ? 'Space' : type === 'section' ? 'Section' : 'Note';
  const name = await requestTextDialog({
    title: `Rename ${label}`,
    label: `${label} name`,
    defaultValue: current,
    submitText: 'Rename',
  });
  if (!name || name === current) return;
  await window.brain.rename({
    type,
    oldName: current,
    newName: name,
    space: payload.space,
    section: payload.section,
  });
  if (type === 'note' && state.selected && state.selected.note === current) {
    state.selected.note = name;
  }
  showToast(`${type} renamed`);
  refreshTree(false);
}

async function deleteNote(payload) {
  const ok = await requestConfirmDialog({
    title: 'Delete note',
    message: `Delete "${payload.note}"? You can undo via versions.`,
    confirmText: 'Delete',
  });
  if (!ok) return;
  await window.brain.deleteNote(payload);
  if (
    state.selected &&
    state.selected.space === payload.space &&
    state.selected.section === payload.section &&
    state.selected.note === payload.note
  ) {
    state.selected = null;
    state.note = null;
  }
  showToast('Note deleted');
  refreshTree();
}

async function toggleStructured(payload) {
  const metadata = await window.brain.structured({ action: 'get', ...payload });
  const enabled = !metadata.enabled;
  if (!enabled) {
    await window.brain.structured({ action: 'save', ...payload, metadata: { enabled: false, fields: [] } });
    showToast('Structured list disabled');
    return;
  }
  const fields = await requestTextDialog({
    title: 'Structured fields',
    label: 'Comma separated fields',
    defaultValue: metadata.fields?.join(', ') || 'Status, Type, Priority',
    submitText: 'Save fields',
  });
  if (!fields) return;
  const list = fields
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  await window.brain.structured({ action: 'save', ...payload, metadata: { enabled: true, fields: list } });
  showToast('Structured list enabled');
  renderStructured(payload);
}

async function renderStructured(payload) {
  const data = await window.brain.structured({ action: 'rows', ...payload });
  if (!data.metadata.enabled) {
    showToast('Structured list is disabled for this section');
    return;
  }
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Note</th>
        ${data.metadata.fields.map((field) => `<th>${field}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.rows
        .map(
          (row) => `
            <tr>
              <td>${row.note}</td>
              ${data.metadata.fields
                .map((field) => `<td>${row[field] || ''}</td>`)
                .join('')}
            </tr>`
        )
        .join('')}
    </tbody>
  `;
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.appendChild(table);
  const menu = document.createElement('menu');
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => dialog.close());
  menu.appendChild(closeBtn);
  dialog.appendChild(menu);
  document.body.appendChild(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  dialog.showModal();
}

function highlightSelected() {
  document.querySelectorAll('.tree-item').forEach((btn) => btn.classList.remove('active'));
  if (!state.selected) return;
  const selector = `.tree-item[data-space="${state.selected.space}"][data-section="${state.selected.section}"][data-note="${state.selected.note}"]`;
  const active = document.querySelector(selector);
  if (active) active.classList.add('active');
}

function switchAiTab(tab) {
  const isChat = tab === 'chat';
  elements.aiTabChat.setAttribute('aria-selected', isChat);
  elements.aiTabTools.setAttribute('aria-selected', !isChat);
  elements.aiChatPanel.hidden = !isChat;
  elements.aiToolsPanel.hidden = isChat;
}

async function loadAiStatus({ silent = false } = {}) {
  if (!elements.aiStatusBar) return;
  updateAiStatus({ state: 'checking', message: 'Checking connection…' });
  elements.testAi.disabled = true;
  try {
    const status = await window.brain.aiStatus();
    updateAiStatus(status);
    if (!silent) {
      showToast(status.connected ? 'AI connected' : status.message || 'Local model offline');
    }
  } catch (error) {
    console.error(error);
    updateAiStatus({ connected: false, message: error?.message || 'Status check failed' });
    if (!silent) {
      showToast(error?.message || 'Unable to reach local model');
    }
  } finally {
    elements.testAi.disabled = false;
  }
}

function updateAiStatus(status = {}) {
  if (!elements.aiStatusBar) return;
  const { connected, message, latency, state } = status;
  const dotState = state || (connected ? 'online' : message ? 'offline' : 'checking');
  elements.aiStatusDot.dataset.status = dotState;
  const text = connected
    ? latency
      ? `Connected (${latency}ms)`
      : message || 'Connected'
    : message || 'Waiting for configuration…';
  elements.aiStatusText.textContent = text;
  elements.aiStatusBar.dataset.connected = connected ? 'true' : 'false';
}

async function openAiConfig() {
  try {
    const config = await window.brain.getConfig();
    const llm = config?.llm || {};
    elements.aiConfigBaseUrl.value = llm.baseUrl || '';
    elements.aiConfigEndpoint.value = llm.endpoint || '/v1/chat/completions';
    elements.aiConfigModel.value = llm.model || '';
    elements.aiConfigTemperature.value =
      typeof llm.temperature === 'number' ? llm.temperature.toString() : '';
    elements.aiConfigApiKey.value = llm.apiKey || '';
    elements.aiConfigDialog.showModal();
    requestAnimationFrame(() => {
      elements.aiConfigBaseUrl.focus();
      elements.aiConfigBaseUrl.select();
    });
  } catch (error) {
    console.error(error);
    showToast('Unable to load AI settings');
  }
}

async function handleAiConfigSubmit(event) {
  event.preventDefault();
  const baseUrl = elements.aiConfigBaseUrl.value.trim();
  const endpoint = elements.aiConfigEndpoint.value.trim() || '/v1/chat/completions';
  const model = elements.aiConfigModel.value.trim();
  if (!baseUrl || !model) {
    showToast('Base URL and model are required');
    return;
  }
  const temperatureRaw = elements.aiConfigTemperature.value.trim();
  const temperature = temperatureRaw ? parseFloat(temperatureRaw) : undefined;
  const payload = {
    llm: {
      baseUrl,
      endpoint,
      model,
    },
  };
  if (!Number.isNaN(temperature) && temperature !== undefined) {
    payload.llm.temperature = temperature;
  }
  const apiKey = elements.aiConfigApiKey.value.trim();
  if (apiKey) {
    payload.llm.apiKey = apiKey;
  } else {
    payload.llm.apiKey = '';
  }
  try {
    await window.brain.saveConfig(payload);
    elements.aiConfigDialog.close();
    showToast('AI settings saved');
    loadAiStatus({ silent: true });
  } catch (error) {
    console.error(error);
    showToast('Failed to save AI settings');
  }
}

async function handleAiChatSubmit(event) {
  event.preventDefault();
  const input = elements.aiChatInput.value.trim();
  if (!input) return;
  appendAiMessage('user', input);
  elements.aiChatInput.value = '';
  try {
    setAiChatBusy(true);
    const response = await window.brain.aiChat({
      message: input,
      context: elements.aiContext.value,
      selection: state.selected,
    });
    appendAiMessage('assistant', response.reply);
  } catch (error) {
    console.error(error);
    appendAiMessage('assistant', `Error: ${error.message || 'AI chat failed'}`);
    showToast(error.message || 'AI chat failed');
  } finally {
    setAiChatBusy(false);
  }
}

function appendAiMessage(role, text) {
  const message = document.createElement('div');
  message.className = 'message';
  message.dataset.role = role;
  const label = role === 'user' ? 'You' : 'Assistant';
  const safeText = escapeHtml(text).replace(/\n/g, '<br />');
  message.innerHTML = `<strong>${label}</strong>: ${safeText}`;
  elements.aiChatHistory.appendChild(message);
  elements.aiChatHistory.scrollTop = elements.aiChatHistory.scrollHeight;
}

async function handleAiToolClick(event) {
  if (!event.target.matches('button[data-action]')) return;
  if (!state.selected) {
    showToast('Select a note first');
    return;
  }
  const action = event.target.dataset.action;
  const context = elements.aiContext.value;
  const payload = {};
  if (action === 'merge') {
    const space = state.tree.find((item) => item.name === state.selected.space);
    const section = space?.sections.find((item) => item.name === state.selected.section);
    const options = (section?.notes || [])
      .filter((note) => note !== state.selected.note)
      .map((note) => ({ value: note, label: note }));
    if (!options.length) {
      showToast('No other notes in this section to merge');
      return;
    }
    const targetNote = await requestSelectDialog({
      title: 'Merge with…',
      label: 'Select note',
      options,
    });
    if (!targetNote) return;
    payload.targetNote = targetNote;
  }
  state.aiDraft = null;
  elements.applyAi.disabled = true;
  elements.discardAi.disabled = true;
  elements.applyAiNew.disabled = true;
  elements.aiDiff.innerHTML = '';
  try {
    setAiToolsBusy(true);
    await window.brain.aiSnapshot(state.selected);
    const result = await window.brain.aiApply({
      ...state.selected,
      action,
      context,
      payload,
    });
    state.aiDraft = result;
    renderAiDiff(result.diff);
    elements.applyAi.disabled = false;
    elements.discardAi.disabled = false;
    elements.applyAiNew.disabled = false;
  } catch (error) {
    console.error(error);
    state.aiDraft = null;
    elements.aiDiff.innerHTML = `<div class="ai-status error">${escapeHtml(error.message || 'AI action failed')}</div>`;
    elements.applyAi.disabled = true;
    elements.discardAi.disabled = true;
    elements.applyAiNew.disabled = true;
    showToast(error.message || 'AI action failed');
  } finally {
    setAiToolsBusy(false);
  }
}

function renderAiDiff(diff) {
  elements.aiDiff.innerHTML = diff
    .map((part) => {
      if (part.added) return `<div class="added">+ ${escapeHtml(part.value)}</div>`;
      if (part.removed) return `<div class="removed">- ${escapeHtml(part.value)}</div>`;
      return `<div>${escapeHtml(part.value)}</div>`;
    })
    .join('');
}

async function applyAiResult(mode) {
  if (!state.aiDraft) return;
  if (mode === 'discard') {
    state.aiDraft = null;
    elements.aiDiff.innerHTML = '';
    elements.applyAi.disabled = true;
    elements.discardAi.disabled = true;
    elements.applyAiNew.disabled = true;
    showToast('AI result discarded');
    return;
  }
  if (mode === 'new') {
    const name = await requestTextDialog({
      title: 'Save as new note',
      label: 'Note name',
      submitText: 'Create',
    });
    if (!name) return;
    await window.brain.create({ type: 'note', space: state.selected.space, section: state.selected.section, name });
    await window.brain.writeNote({
      space: state.selected.space,
      section: state.selected.section,
      note: name,
      body: state.aiDraft.output,
      frontmatter: state.frontmatter,
    });
    showToast('AI changes saved to new note');
    refreshTree(false);
    selectNote(state.selected.space, state.selected.section, name);
  } else {
    state.note = state.aiDraft.output;
    await window.brain.writeNote({
      ...state.selected,
      body: state.note,
      frontmatter: state.frontmatter,
    });
    renderEditor();
    showToast('AI changes applied');
  }
  state.aiDraft = null;
  elements.aiDiff.innerHTML = '';
  elements.applyAi.disabled = true;
  elements.discardAi.disabled = true;
  elements.applyAiNew.disabled = true;
}

async function loadVersions() {
  if (!state.selected) {
    showToast('Select a note first');
    return;
  }
  const versions = await window.brain.listSnapshots(state.selected);
  state.versions = versions;
  elements.versionsList.innerHTML = '';
  versions.forEach((version) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = `${version.timestamp}`;
    btn.addEventListener('click', async () => {
      const data = await window.brain.readSnapshot({ file: version.file });
      elements.versionPreview.textContent = data.raw;
      elements.versionsDialog.dataset.snapshotFile = version.file;
    });
    li.appendChild(btn);
    elements.versionsList.appendChild(li);
  });
  elements.versionsDialog.showModal();
}

function handleVersionDialogClose(event) {
  if (elements.versionsDialog.returnValue === 'restore') {
    const file = elements.versionsDialog.dataset.snapshotFile;
    if (!file) {
      showToast('Select a version to restore');
      return;
    }
    window.brain.readSnapshot({ file }).then((data) => {
      state.note = data.body;
      renderEditor();
      saveNote();
      showToast('Version restored');
    });
  }
  elements.versionsDialog.dataset.snapshotFile = '';
  elements.versionPreview.textContent = '';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function requestTextDialog({ title, label, defaultValue = '', submitText = 'Save', placeholder = '' }) {
  return new Promise((resolve) => {
    elements.entityDialogTitle.textContent = title;
    elements.entityDialogLabel.textContent = label;
    elements.entityDialogInput.value = defaultValue;
    elements.entityDialogInput.placeholder = placeholder;
    elements.entityDialogSubmit.textContent = submitText;
    const onClose = () => {
      elements.entityDialog.removeEventListener('close', onClose);
      if (elements.entityDialog.returnValue === 'submit') {
        resolve(elements.entityDialogInput.value.trim());
      } else {
        resolve(null);
      }
    };
    elements.entityDialog.addEventListener('close', onClose, { once: true });
    elements.entityDialog.showModal();
    requestAnimationFrame(() => {
      elements.entityDialogInput.focus();
      elements.entityDialogInput.select();
    });
  });
}

function requestConfirmDialog({ title, message, confirmText = 'Confirm' }) {
  return new Promise((resolve) => {
    elements.confirmDialogTitle.textContent = title;
    elements.confirmDialogMessage.textContent = message;
    elements.confirmDialogConfirm.textContent = confirmText;
    const onClose = () => {
      elements.confirmDialog.removeEventListener('close', onClose);
      resolve(elements.confirmDialog.returnValue === 'confirm');
    };
    elements.confirmDialog.addEventListener('close', onClose, { once: true });
    elements.confirmDialog.showModal();
  });
}

function requestSelectDialog({ title, label, options = [], defaultValue = '' }) {
  return new Promise((resolve) => {
    elements.selectDialogTitle.textContent = title;
    elements.selectDialogLabel.textContent = label;
    elements.selectDialogInput.innerHTML = '';
    options.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      if (option.value === defaultValue) opt.selected = true;
      elements.selectDialogInput.appendChild(opt);
    });
    const onClose = () => {
      elements.selectDialog.removeEventListener('close', onClose);
      if (elements.selectDialog.returnValue === 'submit') {
        resolve(elements.selectDialogInput.value);
      } else {
        resolve(null);
      }
    };
    elements.selectDialog.addEventListener('close', onClose, { once: true });
    elements.selectDialog.showModal();
    requestAnimationFrame(() => {
      elements.selectDialogInput.focus();
    });
  });
}

function setAiToolsBusy(busy) {
  elements.aiTools.setAttribute('aria-busy', busy ? 'true' : 'false');
  elements.aiTools.querySelectorAll('button').forEach((button) => {
    button.disabled = busy;
  });
  if (busy && !state.aiDraft) {
    elements.aiDiff.innerHTML = '<div class="ai-status">Calling your local model…</div>';
  }
}

function setAiChatBusy(busy) {
  elements.aiChatForm.dataset.busy = busy ? 'true' : 'false';
  elements.aiChatForm.querySelector('button[type="submit"]').disabled = busy;
  elements.aiChatInput.disabled = busy;
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.hidden = !sidebar.hidden;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(null, args), delay);
  };
}

function setupGlobalErrorHandling() {
  let lastMessage = '';
  window.addEventListener('error', (event) => {
    const message = event?.message || 'Renderer error occurred';
    console.error(event.error || message);
    if (message !== lastMessage) {
      showToast(message);
      lastMessage = message;
    }
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason) || 'Unhandled promise rejection';
    console.error(reason);
    if (message !== lastMessage) {
      showToast(message);
      lastMessage = message;
    }
  });
}

ensureDesktopBridge()
  .then(() => {
    init();
  })
  .catch((error) => {
    console.error(error);
    renderDesktopShellError(error?.message || 'Desktop APIs unavailable');
  });
