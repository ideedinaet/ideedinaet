@echo off
title Idee di NaeT - sito locale
cd /d "%~dp0"
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
  echo  Scaricate la versione LTS da https://nodejs.org, installatela,
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
