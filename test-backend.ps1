# Complete Backend Test Script
Write-Host "`n=== Smart Bike Lock Backend Test ===" -ForegroundColor Cyan
Write-Host ""

# Generate random email to avoid conflicts
$randomEmail = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"

# Step 1: Create User Account
Write-Host "Step 1: Creating user account..." -ForegroundColor Yellow
$signupData = @{
    name = "Test User"
    email = $randomEmail
    password = "password123"
} | ConvertTo-Json

try {
    $signup = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupData `
        -SessionVariable webSession
    
    $signupResult = $signup.Content | ConvertFrom-Json
    Write-Host "✓ User created successfully!" -ForegroundColor Green
    Write-Host "  Email: $randomEmail" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Add Device
Write-Host "Step 2: Adding device 'lock001'..." -ForegroundColor Yellow
$deviceData = @{
    name = "My Bike Lock"
    uniqueId = "lock001"
} | ConvertTo-Json

try {
    $device = Invoke-WebRequest -Uri "http://localhost:3000/api/devices" `
        -Method POST `
        -ContentType "application/json" `
        -Body $deviceData `
        -WebSession $webSession
    
    $deviceResult = $device.Content | ConvertFrom-Json
    Write-Host "✓ Device added successfully!" -ForegroundColor Green
    Write-Host "  Device ID: lock001" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to add device: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 3: Send Location Data with Motion Detection
Write-Host "Step 3: Sending location data with motion detection..." -ForegroundColor Yellow
$locationData = @{
    device_id = "lock001"
    motion_triggered = $true
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{
        latitude = 28.6139
        longitude = 77.2090
    }
} | ConvertTo-Json

try {
    $location = Invoke-WebRequest -Uri "http://localhost:3000/api/location" `
        -Method POST `
        -ContentType "application/json" `
        -Body $locationData
    
    $locationResult = $location.Content | ConvertFrom-Json
    Write-Host "✓ Location updated successfully!" -ForegroundColor Green
    Write-Host "  Latitude: 28.6139" -ForegroundColor Gray
    Write-Host "  Longitude: 77.2090" -ForegroundColor Gray
    Write-Host "  Motion Triggered: Yes" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to update location: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# Step 4: Get All Devices
Write-Host "Step 4: Retrieving all devices..." -ForegroundColor Yellow
try {
    $devices = Invoke-WebRequest -Uri "http://localhost:3000/api/devices" `
        -Method GET `
        -WebSession $webSession
    
    $devicesResult = $devices.Content | ConvertFrom-Json
    Write-Host "✓ Devices retrieved successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Device Details:" -ForegroundColor Cyan
    Write-Host ($devices.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get devices: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now:" -ForegroundColor Green
Write-Host "1. Login with: $randomEmail / password123" -ForegroundColor Gray
Write-Host "2. View the location on the dashboard at http://localhost:3000/dashboard" -ForegroundColor Gray
Write-Host "3. See the motion alert in the Security tab" -ForegroundColor Gray
Write-Host ""
