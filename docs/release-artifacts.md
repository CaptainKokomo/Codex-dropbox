# NodeLab Stage 0 – Release Artifacts Snapshot

When maintainers run the packaging pipeline for this repository snapshot, the Windows portable build appears at `release/win-unpacked/NodeLab.exe`. The excerpt below shows the directory contents captured after a successful Stage 0 package run:

```
release/win-unpacked
├── NodeLab.exe
├── LICENSE.electron.txt
├── LICENSES.chromium.html
├── chrome_100_percent.pak
├── chrome_200_percent.pak
├── d3dcompiler_47.dll
├── dxcompiler.dll
├── dxil.dll
├── ffmpeg.dll
├── icudtl.dat
├── libEGL.dll
├── libGLESv2.dll
├── locales/
├── resources/
├── resources.pak
├── snapshot_blob.bin
├── v8_context_snapshot.bin
├── vk_swiftshader.dll
├── vk_swiftshader_icd.json
└── vulkan-1.dll
```

`NodeLab-Setup.exe` is created only when the packaging job runs on Windows (or Linux with Wine). If the installer is missing, the post-package report prints a warning so the release team knows to rerun the job on a Windows-capable environment.
