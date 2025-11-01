@echo off
setlocal enabledelayedexpansion

set "GRADLE_VERSION=%GRADLE_VERSION%"
if "%GRADLE_VERSION%"=="" set "GRADLE_VERSION=8.7"
set "GRADLE_DIST=%GRADLE_DIST%"
if "%GRADLE_DIST%"=="" set "GRADLE_DIST=bin"

set "SCRIPT_DIR=%~dp0"
if "%GRADLE_INSTALL_DIR%"=="" (
  set "GRADLE_INSTALL_DIR=%SCRIPT_DIR%\.gradle-dist"
)

set "DIST_NAME=gradle-%GRADLE_VERSION%"
set "INSTALL_DIR=%GRADLE_INSTALL_DIR%\%DIST_NAME%"
set "GRADLE_EXE=%INSTALL_DIR%\bin\gradle.bat"
set "ARCHIVE_NAME=%DIST_NAME%-%GRADLE_DIST%.zip"
set "ARCHIVE_PATH=%GRADLE_INSTALL_DIR%\%ARCHIVE_NAME%"
set "GRADLE_URL=https://services.gradle.org/distributions/%ARCHIVE_NAME%"

if not exist "%GRADLE_EXE%" (
  call :downloadGradle || goto :fail
)

if "%GRADLE_USER_HOME%"=="" set "GRADLE_USER_HOME=%SCRIPT_DIR%\.gradle"
set "GRADLE_USER_HOME=%GRADLE_USER_HOME%"

call "%GRADLE_EXE%" %*
exit /b %ERRORLEVEL%

:downloadGradle
if not exist "%GRADLE_INSTALL_DIR%" mkdir "%GRADLE_INSTALL_DIR%"
if not exist "%ARCHIVE_PATH%" (
  where powershell >NUL 2>&1
  if errorlevel 1 (
    echo Error: PowerShell is required to download Gradle.>&2
    exit /b 1
  )
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& {param($url,$dest) $client = [System.Net.WebClient]::new(); try {$client.DownloadFile($url,$dest)} finally {$client.Dispose()}}" "%GRADLE_URL%" "%ARCHIVE_PATH%"
  if errorlevel 1 exit /b 1
)
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%ARCHIVE_PATH%' -DestinationPath '%GRADLE_INSTALL_DIR%' -Force"
if errorlevel 1 exit /b 1
exit /b 0

:fail
exit /b 1
