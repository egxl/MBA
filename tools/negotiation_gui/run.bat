@echo off
title Negotiation Styles Analysis GUI
cd /d "%~dp0"
py app.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo An error occurred running the Python app.
    pause
)
