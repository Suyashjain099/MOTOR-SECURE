# Test Backend APIs

Write-Host "Testing Smart Bike Lock Backend APIs" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Test 1: Signup
Write-Host "1. Testing Signup API..." -ForegroundColor Yellow
$signupBody = @{
    name = "Test User"
    email = "testuser$(Get-Random)@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" -Method POST -ContentType "application/json" -Body $signupBody -SessionVariable session
    Write-Host "✓ Signup successful!" -ForegroundColor Green
    Write-Host $signupResponse.Content
    Write-Host ""
} catch {
    Write-Host "✗ Signup failed: $_" -ForegroundColor Red
}

# Test 2: Add Device
Write-Host "2. Testing Add Device API..." -ForegroundColor Yellow
$deviceBody = @{
    name = "My Bike Lock"
    uniqueId = "lock001"
} | ConvertTo-Json

try {
    $deviceResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/devices" -Method POST -ContentType "application/json" -Body $deviceBody -WebSession $session
    Write-Host "✓ Device added successfully!" -ForegroundColor Green
    Write-Host $deviceResponse.Content
    Write-Host ""
} catch {
    Write-Host "✗ Add device failed: $_" -ForegroundColor Red
}

# Test 3: Update Location with Motion Detection
Write-Host "3. Testing Location API (Motion Detection)..." -ForegroundColor Yellow
$locationBody = @{
    device_id = "lock001"
    motion_triggered = $true
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{
        latitude = 28.6139
        longitude = 77.2090
    }
} | ConvertTo-Json

try {
    $locationResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/location" -Method POST -ContentType "application/json" -Body $locationBody
    Write-Host "✓ Location updated successfully!" -ForegroundColor Green
    Write-Host $locationResponse.Content
    Write-Host ""
} catch {
    Write-Host "✗ Location update failed: $_" -ForegroundColor Red
}

# Test 4: Get All Devices
Write-Host "4. Testing Get Devices API..." -ForegroundColor Yellow
try {
    $getDevicesResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/devices" -Method GET -WebSession $session
    Write-Host "✓ Devices retrieved successfully!" -ForegroundColor Green
    Write-Host $getDevicesResponse.Content
    Write-Host ""
} catch {
    Write-Host "✗ Get devices failed: $_" -ForegroundColor Red
}

Write-Host "======================================" -ForegroundColor Green
Write-Host "API Testing Complete!" -ForegroundColor Green
