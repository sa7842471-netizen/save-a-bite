@echo off
title Save-A-Bite - Saving Food. Serving Hope.
color 0A

echo.
echo  ============================================
echo    Save-A-Bite - Food Rescue Platform
echo    Saving Food. Serving Hope.
echo  ============================================
echo.

:: Store project directory
set PROJ=%~dp0

:: Check Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON=python
    goto PYTHON_OK
)
where py >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON=py
    goto PYTHON_OK
)
echo [ERROR] Python not found. Please install from https://www.python.org
echo         Tick Add Python to PATH during setup.
pause
exit /b 1

:PYTHON_OK
echo [OK] Python found: %PYTHON%
echo.

:: Kill anything on port 3000
echo [1/3] Clearing port 3000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    if not "%%a"=="0" taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Start the HTTP server in a separate window
echo [2/3] Starting frontend server...
start "Save-A-Bite Server" cmd /k "%PYTHON% -m http.server 3000 --directory %PROJ%"

:: Give server time to start
echo      Waiting 4 seconds...
timeout /t 4 /nobreak >nul

:: Open browser
echo [3/3] Opening browser...
start "" http://localhost:3000/index.html

echo.
echo  ============================================
echo   Save-A-Bite is running!
echo   Open: http://localhost:3000/index.html
echo  ============================================
echo.
echo  Pages:
echo    Home      : http://localhost:3000/index.html
echo    Donate    : http://localhost:3000/donor.html
echo    NGO       : http://localhost:3000/ngo.html
echo    Volunteer : http://localhost:3000/volunteer.html
echo    Admin     : http://localhost:3000/admin.html
echo.
echo  Close the Save-A-Bite Server window to stop.
echo  Press any key to close this launcher...
pause >nul
