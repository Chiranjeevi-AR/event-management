# Campus Drive API Test Script
# Run this after starting the server with 'npm start'

Write-Host "Campus Drive API Test Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Check if server is running
Write-Host "1. Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Server is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running. Please start with 'npm start'" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get API information
Write-Host "2. Getting API information..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✓ API Info: $($response.message)" -ForegroundColor Green
    Write-Host "  Version: $($response.version)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to get API information" -ForegroundColor Red
}

Write-Host ""

# Test 3: View existing data - Event Popularity Report
Write-Host "3. Testing Event Popularity Report..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reports/event-popularity" -Method GET
    if ($response.Count -gt 0) {
        Write-Host "✓ Found $($response.Count) events:" -ForegroundColor Green
        foreach ($event in $response) {
            Write-Host "  - $($event.title) ($($event.event_type)) - $($event.registrations) registrations" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠ No events found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to get event popularity report" -ForegroundColor Red
}

Write-Host ""

# Test 4: Student Participation Report
Write-Host "4. Testing Student Participation Report..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reports/student-participation" -Method GET
    if ($response.Count -gt 0) {
        Write-Host "✓ Found $($response.Count) students:" -ForegroundColor Green
        foreach ($student in $response) {
            Write-Host "  - $($student.name) ($($student.email)) - $($student.events_attended) events attended" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠ No students found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to get student participation report" -ForegroundColor Red
}

Write-Host ""

# Test 5: Top Students Report
Write-Host "5. Testing Top Students Report..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reports/top-students" -Method GET
    if ($response.Count -gt 0) {
        Write-Host "✓ Top $($response.Count) most active students:" -ForegroundColor Green
        for ($i = 0; $i -lt $response.Count; $i++) {
            $student = $response[$i]
            Write-Host "  $($i+1). $($student.name) - $($student.events_attended) events attended" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠ No student data found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to get top students report" -ForegroundColor Red
}

Write-Host ""

# Test 6: Create a new college (POST request)
Write-Host "6. Testing College Creation..." -ForegroundColor Yellow
try {
    $collegeData = @{
        name = "Test College $(Get-Date -Format 'yyyyMMddHHmmss')"
        location = "Test City, Test State"  
        contact_email = "test@college.edu"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/colleges" -Method POST -Body $collegeData -ContentType "application/json"
    Write-Host "✓ Created college: $($response.name) (ID: $($response.id))" -ForegroundColor Green
    $testCollegeId = $response.id
} catch {
    Write-Host "✗ Failed to create college: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Create a new student (POST request)
if ($testCollegeId) {
    Write-Host "7. Testing Student Registration..." -ForegroundColor Yellow
    try {
        $studentData = @{
            name = "Test Student $(Get-Date -Format 'yyyyMMddHHmmss')"
            email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@college.edu"
            phone = "1234567890"
            college_id = $testCollegeId
            course = "Computer Science"
            year = 2
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/students" -Method POST -Body $studentData -ContentType "application/json"
        Write-Host "✓ Registered student: $($response.name) (ID: $($response.id))" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to register student: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To test more endpoints manually, use:" -ForegroundColor Yellow
Write-Host "- Browser: Visit the URLs shown above" -ForegroundColor Cyan
Write-Host "- Postman: Import the API endpoints" -ForegroundColor Cyan  
Write-Host "- PowerShell: Use Invoke-RestMethod commands" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check README.md for complete curl command examples!" -ForegroundColor Magenta
