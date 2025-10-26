@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set TOOLS_DIR=%SCRIPT_DIR%tools
set NODE_VERSION=20.11.1
set NODE_DIR=%TOOLS_DIR%\node-v%NODE_VERSION%-win-x64
set NODE_ZIP=node-v%NODE_VERSION%-win-x64.zip
set NODE_DOWNLOAD=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_ZIP%
set DIST_DIR=%SCRIPT_DIR%dist
set LOG_DIR=%SCRIPT_DIR%logs
set LOG_FILE=%LOG_DIR%\BuildNodeLabInstaller.log

if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo NodeLab packaging log (generated %date% %time%)>"%LOG_FILE%"

if not exist "%NODE_DIR%" (
  echo Downloading portable Node.js runtime...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '%NODE_DOWNLOAD%' -OutFile '%TOOLS_DIR%\%NODE_ZIP%'" >>"%LOG_FILE%" 2>&1 || goto :fail
  echo Extracting Node.js...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory('%TOOLS_DIR%\%NODE_ZIP%', '%TOOLS_DIR%')" >>"%LOG_FILE%" 2>&1 || goto :fail
)

set PATH=%NODE_DIR%;%NODE_DIR%\node_modules\npm\bin;%PATH%
set NODE_EXE=%NODE_DIR%\node.exe
set NPM_CLI=%NODE_DIR%\node_modules\npm\bin\npm-cli.js
set NPX_CLI=%NODE_DIR%\node_modules\npm\bin\npx-cli.js

if not exist "%SCRIPT_DIR%node_modules" (
  echo Installing build dependencies...
  "%NODE_EXE%" "%NPM_CLI%" install --no-audit --no-fund >>"%LOG_FILE%" 2>&1 || goto :fail
)

echo Building NodeLab installer and portable package...
"%NODE_EXE%" "%NPX_CLI%" --yes electron-builder --config electron-builder.yml >>"%LOG_FILE%" 2>&1 || goto :fail

echo.
echo Build complete.
echo   Portable app:   %DIST_DIR%\NodeLab.exe
echo   Installer:      %DIST_DIR%\NodeLab-Setup.exe
echo.
echo Distribution folder is located alongside this script.
echo Build log saved to: %LOG_FILE%
echo.
echo Double-click the installer for a one-click setup or run the portable exe directly.
echo.
echo Press any key to close this window.
pause >nul
goto :eof

:fail
echo.
echo NodeLab packaging failed. Review the log for details:
echo   %LOG_FILE%
echo.
echo Press any key to close this window.
pause >nul
exit /b 1
