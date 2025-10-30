import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const releaseDirPath = fileURLToPath(new URL('../release', import.meta.url));
const winUnpackedDir = join(releaseDirPath, 'win-unpacked');
const portableExe = join(winUnpackedDir, 'NodeLab.exe');
const installerArtifacts = existsSync(releaseDirPath)
  ? readdirSync(releaseDirPath).filter((file) => /NodeLab-.*setup.*\.exe$/i.test(file))
  : [];

if (existsSync(portableExe)) {
  console.log('\n✅ Windows portable executable generated at:', portableExe);
} else {
  console.warn('\n⚠️ Portable executable missing. Expected at:', portableExe);
}

if (installerArtifacts.length === 0) {
  console.warn('\n⚠️ NodeLab-Setup.exe not generated. Build the Windows installer on a Windows host or Linux with Wine configured.');
} else {
  console.log('\n✅ Windows installer artifacts:', installerArtifacts.join(', '));
}
