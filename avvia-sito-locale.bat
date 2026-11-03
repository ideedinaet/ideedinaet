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
if not exist node_modules\decap-server (
  echo Prima installazione: scarico i componenti necessari, un momento...
  call npm install
)
call npm run locale
pause
