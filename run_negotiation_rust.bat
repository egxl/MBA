@echo off
title Negotiation Styles Analysis (Rust Interactive Tool)
cd /d "%~dp0"
tools\negotiation-app.exe %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    pause
)
