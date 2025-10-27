@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set TOOLS_DIR=%SCRIPT_DIR%tools
set NODE_VERSION=20.11.1
set NODE_DIR=%TOOLS_DIR%\node-v%NODE_VERSION%-win-x64
set NODE_ZIP=node-v%NODE_VERSION%-win-x64.zip
set NODE_DOWNLOAD=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_ZIP%
set DIST_DIR=%SCRIPT_DIR%dist
set TEMP_DIST=%LOCALAPPDATA%\NodeLabBuild
set LOG_DIR=%SCRIPT_DIR%logs
set LOG_FILE=%LOG_DIR%\BuildNodeLabInstaller.log

if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"

if exist "%TEMP_DIST%" rmdir /s /q "%TEMP_DIST%"
mkdir "%TEMP_DIST%" || goto :fail

echo NodeLab packaging log (generated %date% %time%)>"%LOG_FILE%"

echo Working directory: %SCRIPT_DIR%>>"%LOG_FILE%"
echo Temporary output: %TEMP_DIST%>>"%LOG_FILE%"
echo Final output: %DIST_DIR%>>"%LOG_FILE%"

echo Checking portable Node.js runtime...>>"%LOG_FILE%"
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

echo Installing build dependencies (this may take a moment)...
"%NODE_EXE%" "%NPM_CLI%" install --no-audit --no-fund >>"%LOG_FILE%" 2>&1 || goto :fail

echo Building NodeLab installer and portable package...
"%NODE_EXE%" "%NPM_CLI%" run package:win -- --config.directories.output="%TEMP_DIST%" >>"%LOG_FILE%" 2>&1 || goto :fail

set SETUP_PATH=%TEMP_DIST%\NodeLab-Setup.exe
set PORTABLE_PATH=%TEMP_DIST%\NodeLab.exe

if not exist "%SETUP_PATH%" goto :missingArtifacts
if not exist "%PORTABLE_PATH%" goto :missingArtifacts

copy /Y "%SETUP_PATH%" "%DIST_DIR%\NodeLab-Setup.exe" >nul || goto :fail
copy /Y "%PORTABLE_PATH%" "%DIST_DIR%\NodeLab.exe" >nul || goto :fail

echo.
echo Build complete.
echo   Portable app:   %DIST_DIR%\NodeLab.exe
echo   Installer:      %DIST_DIR%\NodeLab-Setup.exe
echo.
echo Distribution folder is located alongside this script.
echo Build log saved to: %LOG_FILE%
echo Temporary artifacts: %TEMP_DIST%
echo.
echo Double-click the installer for a one-click setup or run the portable exe directly.
echo.
echo Press any key to close this window.
pause >nul
goto :cleanup

:missingArtifacts
echo.>>"%LOG_FILE%"
echo Expected artifacts were not found in %TEMP_DIST%>>"%LOG_FILE%"
goto :fail

:fail
echo.
echo NodeLab packaging failed. Review the log for details:
echo   %LOG_FILE%
echo.
echo Press any key to close this window.
pause >nul
exit /b 1

:cleanup
if exist "%TEMP_DIST%" rmdir /s /q "%TEMP_DIST%"
exit /b 0
