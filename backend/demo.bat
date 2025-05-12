@echo off
echo Starting Xeno CRM Backend Demo...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed. Please install npm first.
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xeno_crm
        echo SESSION_SECRET=your-secret-key
        echo GOOGLE_CLIENT_ID=your-google-client-id
        echo GOOGLE_CLIENT_SECRET=your-google-client-secret
        echo FRONTEND_URL=http://localhost:3000
    ) > .env
)

REM Create test environment file
echo Creating test environment file...
(
    echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xeno_crm_test
    echo SESSION_SECRET=test-secret-key
    echo GOOGLE_CLIENT_ID=test-google-client-id
    echo GOOGLE_CLIENT_SECRET=test-google-client-secret
    echo FRONTEND_URL=http://localhost:3000
    echo NODE_ENV=test
) > .env.test

REM Run database migrations
echo Running database migrations...
call npx prisma migrate deploy

REM Start the server
echo Starting server...
start cmd /k "npm run dev"

REM Wait for server to start
timeout /t 5 /nobreak

REM Run tests
echo Running tests...
call npm test

echo.
echo Demo is running!
echo.
echo API Documentation: http://localhost:3001/api-docs
echo Monitoring: http://localhost:3001/monitoring
echo.
echo Press Ctrl+C to stop the server
pause 