@echo off
title Idee di NaeT - sito locale
cd /d "%~dp0"
rem Node.js dedicato al sito (versione portatile): usato SOLO in questa finestra,
rem non cambia le altre versioni di Node installate sul computer.
set "NODE_SITO=C:\node-sito"
if exist "percorso-node.txt" set /p NODE_SITO=<"percorso-node.txt"
if exist "%NODE_SITO%\node.exe" (
  set "PATH=%NODE_SITO%;%PATH%"
  echo Uso Node.js da %NODE_SITO%
)
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js non e' installato.
  echo  Scaricatelo da https://nodejs.org ^(versione LTS^), installatelo e riprovate.
  echo.
  pause
  exit /b
)
for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODEMAJ=%%v
if %NODEMAJ% LSS 20 (
  echo.
  echo  La versione di Node.js installata e' troppo vecchia ^(serve almeno la 20^).
  echo  Scaricate da https://nodejs.org la versione LTS per Windows in formato .zip,
  echo  estraetela in C:\node-sito ^(deve esistere C:\node-sito\node.exe^),
  echo  poi cancellate la cartella node_modules qui dentro e riprovate.
  echo.
  pause
  exit /b
)
if not exist node_modules\decap-server (
  echo Prima installazione: scarico i componenti necessari, un momento...
  call npm install
)
call npm run locale
pause
