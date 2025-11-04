# Theft Detection Test Script
# Make sure the device is LOCKED in the dashboard first!

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  THEFT DETECTION TEST" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure device 'lock001' is LOCKED in the dashboard first!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
Write-Host ""

# Step 1: Send initial motion detection
Write-Host "Step 1: Sending initial motion detection..." -ForegroundColor Green
Write-Host "Location: 25.4358, 81.8463 (Initial position)" -ForegroundColor Gray
$body1 = '{"device_id":"lock001","motion_triggered":true,"timestamp":"2025-11-04T10:00:00Z","location":{"latitude":25.4358,"longitude":81.8463,"address":"Initial Location"}}'
try {
    $response1 = Invoke-RestMethod -Uri 'http://localhost:3000/api/location' -Method POST -Body $body1 -ContentType 'application/json'
    Write-Host "✅ Success! Theft detection ACTIVATED" -ForegroundColor Green
    Write-Host "Response: $($response1 | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    if ($response1.theftDetection) {
        Write-Host "🚨 Theft Detection Active: $($response1.theftDetection.active)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Start-Sleep -Seconds 3

# Step 2: Move bike 55 meters away (triggers theft alert)
Write-Host "Step 2: Moving bike 55+ meters away..." -ForegroundColor Green
Write-Host "Location: 25.4363, 81.8470 (Moved ~55 meters)" -ForegroundColor Gray
$body2 = '{"device_id":"lock001","motion_triggered":true,"timestamp":"2025-11-04T10:05:00Z","location":{"latitude":25.4363,"longitude":81.8470,"address":"Moved 55m"}}'
try {
    $response2 = Invoke-RestMethod -Uri 'http://localhost:3000/api/location' -Method POST -Body $body2 -ContentType 'application/json'
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response: $($response2 | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    if ($response2.theftDetection) {
        Write-Host "🚨 Distance Moved: $([math]::Round($response2.theftDetection.distanceMoved, 2)) meters" -ForegroundColor Red
        Write-Host "🚨 Theft Alert: $($response2.theftDetection.theftAlerted)" -ForegroundColor Red
        if ($response2.theftDetection.theftAlerted) {
            Write-Host ""
            Write-Host "🚨🚨🚨 THEFT ALERT TRIGGERED! 🚨🚨🚨" -ForegroundColor Red -BackgroundColor White
            Write-Host "Check your dashboard - you should see:" -ForegroundColor Yellow
            Write-Host "  - Red theft notification in notification history" -ForegroundColor Yellow
            Write-Host "  - 10-second intense alarm sound playing" -ForegroundColor Yellow
            Write-Host "  - Toast: 'THEFT ALERT - BIKE IS BEING STOLEN!'" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 3: Continue moving (shows increasing distance)
Write-Host "Step 3: Moving even further (100+ meters)..." -ForegroundColor Green
Write-Host "Location: 25.4368, 81.8480 (Moved ~111 meters)" -ForegroundColor Gray
Start-Sleep -Seconds 2
$body3 = '{"device_id":"lock001","motion_triggered":true,"timestamp":"2025-11-04T10:10:00Z","location":{"latitude":25.4368,"longitude":81.8480,"address":"Moved 111m"}}'
try {
    $response3 = Invoke-RestMethod -Uri 'http://localhost:3000/api/location' -Method POST -Body $body3 -ContentType 'application/json'
    Write-Host "✅ Success!" -ForegroundColor Green
    if ($response3.theftDetection) {
        Write-Host "🚨 Total Distance Moved: $([math]::Round($response3.theftDetection.distanceMoved, 2)) meters" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Check your dashboard at: http://localhost:3000/dashboard" -ForegroundColor Green
Write-Host "🔔 You should see theft alerts in the notification history" -ForegroundColor Green
Write-Host "🔊 The 10-second alarm should have played when >30m was detected" -ForegroundColor Green
Write-Host ""
