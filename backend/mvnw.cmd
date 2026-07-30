@echo off
setlocal

set "BASE_DIR=%~dp0"
set "WRAPPER_DIR=%BASE_DIR%.mvn\wrapper"
set "PROPERTIES_FILE=%WRAPPER_DIR%\maven-wrapper.properties"

if defined JAVA_HOME (
  set "JAVACMD=%JAVA_HOME%\bin\java.exe"
  if not exist "%JAVACMD%" (
    set "JAVACMD=java"
  )
) else (
  set "JAVACMD=java"
)

if "%JAVACMD%"=="java" (
  where java >nul 2>nul
  if errorlevel 1 (
    echo Error: Java is required to run Maven Wrapper.
    exit /b 1
  )
)

for /f "tokens=1,* delims==" %%A in ('findstr /b "distributionUrl=" "%PROPERTIES_FILE%"') do set "DISTRIBUTION_URL=%%B"

if "%DISTRIBUTION_URL%"=="" (
  echo Error: distributionUrl is missing in %PROPERTIES_FILE%
  exit /b 1
)

for %%F in ("%DISTRIBUTION_URL%") do set "ZIP_NAME=%%~nxF"
set "MAVEN_VERSION=%ZIP_NAME:apache-maven-=%"
set "MAVEN_VERSION=%MAVEN_VERSION:-bin.zip=%"

set "DIST_DIR=%WRAPPER_DIR%\dists\apache-maven-%MAVEN_VERSION%"
set "MAVEN_HOME=%DIST_DIR%\apache-maven-%MAVEN_VERSION%"
set "MAVEN_BIN=%MAVEN_HOME%\bin\mvn.cmd"
set "ZIP_FILE=%DIST_DIR%\apache-maven-%MAVEN_VERSION%-bin.zip"

if not exist "%MAVEN_BIN%" (
  if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"
  echo Downloading Maven %MAVEN_VERSION%...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%ZIP_FILE%'"
  if errorlevel 1 exit /b 1

  echo Extracting Maven %MAVEN_VERSION%...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%DIST_DIR%' -Force"
  if errorlevel 1 exit /b 1
)

call "%MAVEN_BIN%" %*
endlocal
