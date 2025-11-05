import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import chokidar from 'chokidar';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { diffLines } from 'diff';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const SNAPSHOT_DIR = path.join(STORAGE_DIR, '.snapshots');
const md = new MarkdownIt();

let mainWindow;
let watcher;

const ensureStorage = async () => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
};

const getSpaces = async () => {
  await ensureStorage();
  const entries = await fs.readdir(STORAGE_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== '.snapshots')
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

const getSections = async (space) => {
  const spaceDir = path.join(STORAGE_DIR, space);
  const entries = await fs.readdir(spaceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

const getNotes = async (space, section) => {
  const sectionDir = path.join(STORAGE_DIR, space, section);
  const entries = await fs.readdir(sectionDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/, ''))
    .sort((a, b) => a.localeCompare(b));
};

const readNote = async (space, section, note) => {
  const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
  const raw = await fs.readFile(notePath, 'utf8');
  const parsed = matter(raw);
  return {
    frontmatter: parsed.data,
    body: parsed.content,
    raw,
    html: md.render(parsed.content),
    tags: extractTags(parsed.content),
    backlinks: await findBacklinks(space, section, note),
  };
};

const writeNote = async (space, section, note, content, frontmatter = {}) => {
  await ensureStorage();
  const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
  const file = matter.stringify(content, frontmatter);
  await fs.writeFile(notePath, file, 'utf8');
};

const createSnapshot = async (space, section, note) => {
  const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotName = `${space}__${section}__${note}__${timestamp}.md`;
  const snapshotPath = path.join(SNAPSHOT_DIR, snapshotName);
  try {
    const data = await fs.readFile(notePath, 'utf8');
    await fs.writeFile(snapshotPath, data, 'utf8');
    await pruneSnapshots(space, section, note);
  } catch (err) {
    console.error('Snapshot failed', err);
  }
};

const pruneSnapshots = async (space, section, note) => {
  const files = await fs.readdir(SNAPSHOT_DIR);
  const prefix = `${space}__${section}__${note}__`;
  const matches = files.filter((file) => file.startsWith(prefix)).sort();
  const excess = matches.length - 20;
  if (excess > 0) {
    const toDelete = matches.slice(0, excess);
    await Promise.all(
      toDelete.map((file) => fs.unlink(path.join(SNAPSHOT_DIR, file)))
    );
  }
};

const listSnapshots = async (space, section, note) => {
  const files = await fs.readdir(SNAPSHOT_DIR);
  return files
    .filter((file) => file.startsWith(`${space}__${section}__${note}__`))
    .map((file) => {
      const [spaceName, sectionName, noteName, timestamp] = file.replace(/\.md$/, '').split('__');
      return {
        file,
        space: spaceName,
        section: sectionName,
        note: noteName,
        timestamp: timestamp.replace(/-/g, ':').replace('T', ' ').replace('Z', 'Z'),
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

const readSnapshot = async (file) => {
  const snapshotPath = path.join(SNAPSHOT_DIR, file);
  const raw = await fs.readFile(snapshotPath, 'utf8');
  const parsed = matter(raw);
  return { frontmatter: parsed.data, body: parsed.content, raw };
};

const extractTags = (content) => {
  const tagRegex = /(^|\s)#([\p{L}0-9_-]+)/gu;
  const tags = new Set();
  let match;
  while ((match = tagRegex.exec(content))) {
    tags.add(match[2]);
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

const findBacklinks = async (space, section, note) => {
  const target = `[[${note}]]`;
  const backlinks = [];
  const spaces = await getSpaces();
  for (const sp of spaces) {
    const sections = await getSections(sp);
    for (const sec of sections) {
      const notes = await getNotes(sp, sec);
      for (const n of notes) {
        if (sp === space && sec === section && n === note) continue;
        const notePath = path.join(STORAGE_DIR, sp, sec, `${n}.md`);
        const raw = await fs.readFile(notePath, 'utf8');
        if (raw.includes(target)) {
          backlinks.push({ space: sp, section: sec, note: n });
        }
      }
    }
  }
  return backlinks;
};

const semanticSearch = async (query) => {
  const lower = query.toLowerCase();
  const results = [];
  const spaces = await getSpaces();
  for (const space of spaces) {
    const sections = await getSections(space);
    for (const section of sections) {
      const notes = await getNotes(space, section);
      for (const note of notes) {
        const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
        const raw = await fs.readFile(notePath, 'utf8');
        const parsed = matter(raw);
        const body = parsed.content.toLowerCase();
        const title = note.toLowerCase();
        const score = scoreSemantic(lower, title, body);
        if (score > 0) {
          results.push({ space, section, note, snippet: buildSnippet(parsed.content, query), score });
        }
      }
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 20);
};

const scoreSemantic = (query, title, body) => {
  let score = 0;
  if (title.includes(query)) score += 5;
  const queryWords = query.split(/\s+/);
  for (const word of queryWords) {
    if (body.includes(word)) score += 1;
  }
  if (body.includes(query)) score += 3;
  return score;
};

const buildSnippet = (content, query) => {
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, 120) + (content.length > 120 ? '…' : '');
  return content.slice(Math.max(0, idx - 40), idx + 80) + '…';
};

const applyAiAction = async ({ space, section, note, action, payload }) => {
  const noteData = await readNote(space, section, note);
  const text = noteData.body;
  let output = text;
  switch (action) {
    case 'summarize':
      output = summarize(text);
      break;
    case 'cleanup':
      output = cleanup(text);
      break;
    case 'tasks':
      output = extractTasks(text);
      break;
    case 'outline':
      output = outline(text);
      break;
    case 'merge':
      output = await mergeNotes(space, section, note, payload?.targetNote);
      break;
    default:
      break;
  }
  const diff = diffLines(text, output).map((part) => ({
    added: part.added || false,
    removed: part.removed || false,
    value: part.value,
  }));
  return { output, diff };
};

const summarize = (text) => {
  const lines = text.split(/\n/);
  const important = lines.filter((line) => line.startsWith('#') || line.startsWith('- [ ]') || line.startsWith('- [x]'));
  const summary = important.slice(0, 6).join('\n');
  return summary || text.split(/\n/).slice(0, 40).join('\n');
};

const cleanup = (text) => {
  return text
    .replace(/\s+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const extractTasks = (text) => {
  const matches = text.match(/- \[( |x)\] .+/g);
  if (!matches) return '- [ ] No tasks found';
  return matches.join('\n');
};

const outline = (text) => {
  const headings = text.match(/^#+ .+/gm) || [];
  return headings.map((heading, index) => `${index + 1}. ${heading.replace(/^#+\s*/, '')}`).join('\n');
};

const mergeNotes = async (space, section, note, targetNote) => {
  if (!targetNote) return (await readNote(space, section, note)).body;
  const primary = await readNote(space, section, note);
  const target = await readNote(space, section, targetNote);
  return `${primary.body}\n\n---\nMerged with ${targetNote}\n\n${target.body}`;
};

const quickCapture = async (title, content) => {
  const defaultSpace = 'Inbox';
  const defaultSection = 'Quick Captures';
  const spaceDir = path.join(STORAGE_DIR, defaultSpace);
  const sectionDir = path.join(spaceDir, defaultSection);
  await fs.mkdir(sectionDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const noteName = title?.trim() ? title.trim() : `Quick Capture ${stamp}`;
  const notePath = path.join(sectionDir, `${noteName}.md`);
  const body = `${title ? `# ${title}\n\n` : ''}${content}\n`;
  await fs.writeFile(notePath, body, 'utf8');
  return { space: defaultSpace, section: defaultSection, note: noteName };
};

const deleteNote = async (space, section, note) => {
  const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
  await fs.unlink(notePath);
};

const renameEntity = async (type, payload) => {
  switch (type) {
    case 'space':
      await fs.rename(path.join(STORAGE_DIR, payload.oldName), path.join(STORAGE_DIR, payload.newName));
      break;
    case 'section':
      await fs.rename(
        path.join(STORAGE_DIR, payload.space, payload.oldName),
        path.join(STORAGE_DIR, payload.space, payload.newName)
      );
      break;
    case 'note':
      await fs.rename(
        path.join(STORAGE_DIR, payload.space, payload.section, `${payload.oldName}.md`),
        path.join(STORAGE_DIR, payload.space, payload.section, `${payload.newName}.md`)
      );
      break;
    default:
      break;
  }
};

const createSpace = async (name) => {
  const dir = path.join(STORAGE_DIR, name);
  await fs.mkdir(dir, { recursive: true });
};

const createSection = async (space, name) => {
  const dir = path.join(STORAGE_DIR, space, name);
  await fs.mkdir(dir, { recursive: true });
};

const createNote = async (space, section, name) => {
  const dir = path.join(STORAGE_DIR, space, section);
  await fs.mkdir(dir, { recursive: true });
  const notePath = path.join(dir, `${name}.md`);
  await fs.writeFile(notePath, `# ${name}\n\n`, 'utf8');
};

const listTags = async () => {
  const tagMap = new Map();
  const spaces = await getSpaces();
  for (const space of spaces) {
    const sections = await getSections(space);
    for (const section of sections) {
      const notes = await getNotes(space, section);
      for (const note of notes) {
        const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
        const raw = await fs.readFile(notePath, 'utf8');
        const tags = extractTags(raw);
        tags.forEach((tag) => {
          const list = tagMap.get(tag) || [];
          list.push({ space, section, note });
          tagMap.set(tag, list);
        });
      }
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, notes]) => ({ tag, notes }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
};

const structuredListMetadata = async (space, section) => {
  const sectionDir = path.join(STORAGE_DIR, space, section);
  const metaPath = path.join(sectionDir, '.structured.json');
  try {
    const raw = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { enabled: false, fields: [] };
  }
};

const saveStructuredMetadata = async (space, section, metadata) => {
  const sectionDir = path.join(STORAGE_DIR, space, section);
  const metaPath = path.join(sectionDir, '.structured.json');
  await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf8');
};

const getStructuredRows = async (space, section) => {
  const notes = await getNotes(space, section);
  const metadata = await structuredListMetadata(space, section);
  const rows = [];
  for (const note of notes) {
    const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
    const raw = await fs.readFile(notePath, 'utf8');
    const parsed = matter(raw);
    rows.push({
      note,
      ...metadata.fields.reduce((acc, field) => {
        acc[field] = parsed.data?.[field] ?? '';
        return acc;
      }, {}),
    });
  }
  return { metadata, rows };
};

const handleSearch = async ({ query, mode }) => {
  if (!query) return [];
  if (mode === 'semantic') return semanticSearch(query);
  const lower = query.toLowerCase();
  const results = [];
  const spaces = await getSpaces();
  for (const space of spaces) {
    const sections = await getSections(space);
    for (const section of sections) {
      const notes = await getNotes(space, section);
      for (const note of notes) {
        const notePath = path.join(STORAGE_DIR, space, section, `${note}.md`);
        const raw = await fs.readFile(notePath, 'utf8');
        const parsed = matter(raw);
        const body = parsed.content;
        if (note.toLowerCase().includes(lower) || body.toLowerCase().includes(lower)) {
          results.push({
            space,
            section,
            note,
            snippet: buildSnippet(body, query),
            score: note.toLowerCase().includes(lower) ? 2 : 1,
          });
        }
      }
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 20);
};

const registerIpc = () => {
  ipcMain.handle('storage:list', async () => {
    const spaces = await getSpaces();
    const tree = [];
    for (const space of spaces) {
      const sections = await getSections(space);
      const sectionItems = [];
      for (const section of sections) {
        const notes = await getNotes(space, section);
        sectionItems.push({ name: section, notes });
      }
      tree.push({ name: space, sections: sectionItems });
    }
    return tree;
  });

  ipcMain.handle('storage:readNote', async (_, payload) => {
    return readNote(payload.space, payload.section, payload.note);
  });

  ipcMain.handle('storage:writeNote', async (_, payload) => {
    await writeNote(payload.space, payload.section, payload.note, payload.body, payload.frontmatter);
  });

  ipcMain.handle('storage:create', async (_, payload) => {
    if (payload.type === 'space') await createSpace(payload.name);
    if (payload.type === 'section') await createSection(payload.space, payload.name);
    if (payload.type === 'note') await createNote(payload.space, payload.section, payload.name);
  });

  ipcMain.handle('storage:deleteNote', async (_, payload) => deleteNote(payload.space, payload.section, payload.note));

  ipcMain.handle('storage:rename', async (_, payload) => renameEntity(payload.type, payload));

  ipcMain.handle('storage:tags', async () => listTags());

  ipcMain.handle('storage:structured', async (_, payload) => {
    if (payload.action === 'get') return structuredListMetadata(payload.space, payload.section);
    if (payload.action === 'save') return saveStructuredMetadata(payload.space, payload.section, payload.metadata);
    if (payload.action === 'rows') return getStructuredRows(payload.space, payload.section);
  });

  ipcMain.handle('storage:search', async (_, payload) => handleSearch(payload));

  ipcMain.handle('ai:apply', async (_, payload) => applyAiAction(payload));

  ipcMain.handle('ai:snapshot', async (_, payload) => {
    await createSnapshot(payload.space, payload.section, payload.note);
  });

  ipcMain.handle('storage:snapshots', async (_, payload) => listSnapshots(payload.space, payload.section, payload.note));

  ipcMain.handle('storage:readSnapshot', async (_, payload) => readSnapshot(payload.file));

  ipcMain.handle('quickCapture', async (_, payload) => quickCapture(payload.title, payload.content));
};

const watchStorage = () => {
  watcher = chokidar.watch(STORAGE_DIR, { ignoreInitial: true, depth: 3 });
  watcher.on('all', (_event, _path) => {
    if (mainWindow) {
      mainWindow.webContents.send('storage:updated');
    }
  });
};

const createWindow = async () => {
  await ensureStorage();
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#11131a',
    title: 'My Own Damn Second Brain',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  await mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  watchStorage();
};

app.whenReady().then(() => {
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (watcher) watcher.close();
});
