$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false

    if ($content -match "Opportunity Score:") {
        $content = $content -replace "Opportunity Score:", "Market Opportunity Score:"
        $modified = $true
    }
    if ($content -match "Score: ") {
        $content = $content -replace "Score: ", "Market Opportunity Score: "
        $modified = $true
    }
    if ($content -match "Est. Net Realization") {
        $content = $content -replace "Est. Net Realization", "Expected Net Realization"
        $modified = $true
    }
    if ($content -match "Net Realization") {
        $content = $content -replace "Net Realization", "Expected Net Realization"
        # Since this might duplicate to 'Expected Expected Net Realization', let's clean it:
        $content = $content -replace "Expected Expected", "Expected"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Output "Updated: $($file.Name)"
    }
}
