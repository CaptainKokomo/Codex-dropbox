import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const CONFIG_DIR = path.join(process.cwd(), 'config');
const CONFIG_PATH = path.join(CONFIG_DIR, 'app.config.json');
const CONFIG_TEMPLATE = path.join(CONFIG_DIR, 'app.config.example.json');
const SPACES = [
  {
    name: 'Inbox',
    sections: [
      {
        name: 'Quick Captures',
        notes: [
          {
            title: 'Welcome to My Own Damn Second Brain',
            body: `---\ncreated: ${new Date().toISOString()}\n---\n\n# Welcome\n\nThis is your space. Use the quick capture shortcut (Ctrl+N or Cmd+N) to jot things down.`,
          },
        ],
      },
    ],
  },
  {
    name: 'Projects',
    sections: [
      {
        name: 'Structured Lists',
        notes: [
          {
            title: 'Project Tracker',
            body: `---\nstatus: active\npriority: medium\n---\n\n# Project Tracker\n\n- [ ] Sample task\n- [x] Completed item\n`,
          },
        ],
      },
    ],
  },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function createLaunchers() {
  const scriptsDir = path.join(process.cwd(), 'launchers');
  await ensureDir(scriptsDir);
  const platform = process.platform;
  if (platform === 'darwin') {
    const content = `#!/bin/bash\ncd "$(dirname "$0")/.."\nnpm run start`;
    await fs.writeFile(path.join(scriptsDir, 'Start My Own Damn Second Brain.command'), content, 'utf8');
    await fs.chmod(path.join(scriptsDir, 'Start My Own Damn Second Brain.command'), 0o755);
  } else if (platform === 'win32') {
    const content = `@echo off\ncd /d %~dp0..\ncall npm start`;
    await fs.writeFile(path.join(scriptsDir, 'Start My Own Damn Second Brain.bat'), content, 'utf8');
  } else {
    const content = `#!/bin/bash\ncd "$(dirname "$0")/.."\nnpm run start`;
    await fs.writeFile(path.join(scriptsDir, 'start-my-own-damn-second-brain.sh'), content, 'utf8');
    await fs.chmod(path.join(scriptsDir, 'start-my-own-damn-second-brain.sh'), 0o755);
  }
}

async function bootstrap() {
  await ensureDir(STORAGE_DIR);
  await ensureDir(CONFIG_DIR);
  try {
    await fs.access(CONFIG_PATH);
  } catch {
    try {
      const template = await fs.readFile(CONFIG_TEMPLATE, 'utf8');
      await fs.writeFile(CONFIG_PATH, template, 'utf8');
    } catch {
      await fs.writeFile(
        CONFIG_PATH,
        JSON.stringify(
          {
            llm: {
              provider: 'openwebui',
              baseUrl: 'http://127.0.0.1:3000',
              endpoint: '/v1/chat/completions',
              model: 'openchat',
              temperature: 0.2,
              apiKey: '',
            },
          },
          null,
          2
        ),
        'utf8'
      );
    }
  }
  for (const space of SPACES) {
    const spaceDir = path.join(STORAGE_DIR, space.name);
    await ensureDir(spaceDir);
    for (const section of space.sections) {
      const sectionDir = path.join(spaceDir, section.name);
      await ensureDir(sectionDir);
      for (const note of section.notes) {
        const notePath = path.join(sectionDir, `${note.title}.md`);
        try {
          await fs.access(notePath);
        } catch {
          await fs.writeFile(notePath, note.body, 'utf8');
        }
      }
    }
  }
  await ensureDir(path.join(STORAGE_DIR, '.snapshots'));
  await createLaunchers();
}

bootstrap().catch((err) => {
  console.error('Postinstall bootstrap failed', err);
});
