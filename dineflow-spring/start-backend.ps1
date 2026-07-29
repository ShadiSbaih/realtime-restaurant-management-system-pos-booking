# Load .env and start the Spring Boot backend
$envFile = Join-Path $PSScriptRoot ".env"
$envVars = @{}

if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^[^#].+=.' } | ForEach-Object {
        $parts = $_ -split '=', 2
        $k = $parts[0].Trim()
        $v = $parts[1].Trim()
        [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
        $envVars[$k] = $v
    }
    Write-Host "Loaded .env (DB_USERNAME=$env:DB_USERNAME)" -ForegroundColor Green
} else {
    Write-Host "WARNING: .env file not found" -ForegroundColor Yellow
}

Set-Location "$PSScriptRoot\backend"

# Build -D flags array so special characters in values are handled safely
$props = @(
    "DATABASE_URL",
    "DB_USERNAME",
    "DB_PASSWORD",
    "JWT_SECRET",
    "CLIENT_URL",
    "GEMINI_API_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_FOLDER",
    "UPLOAD_DIR",
    "UPLOAD_BASE_URL",
    "PAYMENT_MOCK_SUCCESS_RATE",
    "PAYMENT_MOCK_DELAY_MS",
    "PAYMENT_MOCK_CURRENCY"
)

$jvmArgs = ($props | Where-Object { $envVars.ContainsKey($_) } | ForEach-Object {
    "-D$_=$($envVars[$_])"
}) -join " "

Write-Host "Starting Spring Boot backend..." -ForegroundColor Cyan
& .\mvnw spring-boot:run "-Dspring-boot.run.jvmArguments=$jvmArgs"
