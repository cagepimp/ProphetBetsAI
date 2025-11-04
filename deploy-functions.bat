@echo off
echo ========================================
echo  DEPLOYING PROPHETBETSAI EDGE FUNCTIONS
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Supabase CLI...
npx supabase --version
if errorlevel 1 (
    echo ERROR: Supabase CLI not available
    pause
    exit /b 1
)
echo.

echo [2/4] Linking to Supabase project...
echo NOTE: You will be prompted for your database password
npx supabase link --project-ref abglcmahihbmglkbolir
if errorlevel 1 (
    echo ERROR: Failed to link project
    pause
    exit /b 1
)
echo.

echo [3/4] Setting API secrets...
echo.
set /p ODDS_KEY="Enter your The Odds API key: "
set /p OPENAI_KEY="Enter your OpenAI API key (sk-...): "

npx supabase secrets set ODDS_API_KEY=%ODDS_KEY%
npx supabase secrets set OPENAI_API_KEY=%OPENAI_KEY%
echo.

echo [4/4] Deploying functions...
echo.

echo Deploying populate-games...
npx supabase functions deploy populate-games --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo Deploying fetch-odds...
npx supabase functions deploy fetch-odds --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo Deploying run-analyzer...
npx supabase functions deploy run-analyzer --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo Deploying sync-rosters...
npx supabase functions deploy sync-rosters --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo Deploying generate-props...
npx supabase functions deploy generate-props --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo Deploying update-results...
npx supabase functions deploy update-results --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo Deploying fetch-injuries...
npx supabase functions deploy fetch-injuries --no-verify-jwt
if errorlevel 1 goto :error

echo.
echo ========================================
echo  SUCCESS! ALL FUNCTIONS DEPLOYED
echo ========================================
echo.
echo Next steps:
echo 1. Test functions: node test-functions.mjs
echo 2. Open UI: http://localhost:5173
echo 3. Click "Refresh Games" on NFL page
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo  ERROR: DEPLOYMENT FAILED
echo ========================================
echo.
echo Check the error message above and try again.
echo.
pause
exit /b 1
