@echo off
echo Building Kick AutoSend...

REM Get version from manifest.json
for /f "tokens=*" %%a in ('node -e "console.log(JSON.parse(require('fs').readFileSync('manifest.json')).version)"') do set VERSION=%%a

echo Building version %VERSION%...

REM Clean and create dist directory
if exist dist rmdir /s /q dist
mkdir dist

REM Copy all files
copy manifest.json dist\
copy popup.html dist\
copy popup.js dist\
copy content.js dist\
copy service_worker.js dist\

REM Copy all directories
xcopy assets dist\assets\ /E /I /Y
xcopy core dist\core\ /E /I /Y
xcopy utils dist\utils\ /E /I /Y

REM Create build info
echo Build timestamp: %date% %time% > dist\build-info.txt
echo Version: %VERSION% >> dist\build-info.txt

REM Create zip file
powershell -command "Compress-Archive -Path 'dist\*' -DestinationPath 'kick-autosend-v%VERSION%.zip' -Force"

echo.
echo Build complete!
echo Extension package: kick-autosend-v%VERSION%.zip
echo.
pause
