$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false

    if ($content -match "SIH 2026 / PS 26132") {
        $content = $content -replace "SIH 2026 / PS 26132", "AGRICULTURAL MARKET PLATFORM"
        $modified = $true
    }
    if ($content -match "SIH 2026<br/>Problem Statement 26132") {
        $content = $content -replace "SIH 2026<br/>Problem Statement 26132", "KrishiSetu AI<br/>Farm to Best Market"
        $modified = $true
    }
    if ($content -match "AI Prototype") {
        $content = $content -replace "AI Prototype", "AI PLATFORM"
        $modified = $true
    }
    if ($content -match "Prototype Network — Nearby Farmers") {
        $content = $content -replace "Prototype Network — Nearby Farmers", "Demo Network — Nearby Farmers"
        $modified = $true
    }
    if ($content -match "simulated prototype network nodes") {
        $content = $content -replace "simulated prototype network nodes", "demo network data nodes"
        $modified = $true
    }
    if ($content -match "KrishiSetu deterministic score model") {
        $content = $content -replace "KrishiSetu deterministic score model", "KrishiSetu Decision Engine"
        $modified = $true
    }
    if ($content -match "\*Prototype logistics estimate calculated deterministically based on volume thresholds.") {
        $content = $content -replace "\*Prototype logistics estimate calculated deterministically based on volume thresholds.", "*Logistics estimates calculated based on standard volume thresholds."
        $modified = $true
    }
    if ($content -match "KrishiSetu Prototype") {
        $content = $content -replace "KrishiSetu Prototype", "Demo Network"
        $modified = $true
    }
    if ($content -match "Prototype Route View") {
        $content = $content -replace "Prototype Route View", "Estimated Route View"
        $modified = $true
    }
    if ($content -match "mathematically optimal") {
        $content = $content -replace "mathematically optimal", "highest expected profit"
        $modified = $true
    }
    if ($content -match "PROTOTYPE TRANSACTION") {
        $content = $content -replace "PROTOTYPE TRANSACTION", "DEMO TRANSACTION"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Output "Updated: $($file.Name)"
    }
}
