$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
$root = (Get-Location).Path
$base = 'https://www.onedirectionmusic.com/onedirectionmusiccom-ukprod/media/gallery-images'

function Get-WithRetry($url, $outFile, $maxTry = 4) {
    for ($i = 1; $i -le $maxTry; $i++) {
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40 -Headers @{'User-Agent'=$ua} -OutFile $outFile
            if ((Get-Item $outFile).Length -gt 1000) { return $true }
            Write-Output "   small file (<1KB), retry $i : $url"
        } catch {
            Write-Output "   retry $i/$maxTry $($url.Substring($url.Length-40)) : $($_.Exception.Message)"
            Start-Sleep -Seconds (5 * $i)
        }
    }
    return $false
}

$inv = Get-Content (Join-Path $root 'tools\_photos_inventory.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$smlDir = Join-Path $root 'images\media\gallery-images\rect-sml'
$medDir = Join-Path $root 'images\media\gallery-images\rect-med'
New-Item -ItemType Directory -Force -Path $smlDir, $medDir | Out-Null

$seen = @{}
$total = 0; $ok = 0; $fail = 0
foreach ($album in $inv.PSObject.Properties) {
    Write-Output "=== $($album.Name) ==="
    foreach ($g in $album.Value) {
        foreach ($h in $g.slides) {
            if ($seen.ContainsKey($h)) { continue }
            $seen[$h] = $true
            $total++
            $dst = Join-Path $smlDir "$h.jpg"
            if (Test-Path $dst) { $ok++; continue }
            if (Get-WithRetry "$base/rect-sml/$h.jpg" $dst) { $ok++; Write-Output "OK rect-sml $h" } else { $fail++; Write-Output "FAIL rect-sml $h" }
            Start-Sleep -Seconds 1
        }
        if ($g.og) {
            $dst = Join-Path $medDir "$($g.og).jpg"
            if (-not (Test-Path $dst)) {
                if (Get-WithRetry "$base/rect-med/$($g.og).jpg" $dst) { Write-Output "OK rect-med $($g.og)" } else { $fail++; Write-Output "FAIL rect-med $($g.og)" }
                Start-Sleep -Seconds 1
            }
        }
    }
}
Write-Output "done: ok=$ok fail=$fail total=$total"
