$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
$root = (Get-Location).Path
$base = 'https://www.onedirectionmusic.com/onedirectionmusiccom-ukprod/media/gallery-images'

function Get-WithRetry($url, $outFile, $maxTry = 4) {
    for ($i = 1; $i -le $maxTry; $i++) {
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40 -Headers @{'User-Agent'=$ua} -OutFile $outFile
            return $true
        } catch {
            Write-Output "   retry $i/$maxTry $($url.Substring($url.Length-40)) : $($_.Exception.Message)"
            Start-Sleep -Seconds (5 * $i)
        }
    }
    return $false
}

$inv = Get-Content (Join-Path $root 'tools\_photos_inventory.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$four = $inv.four
$smlDir = Join-Path $root 'images\media\gallery-images\rect-sml'
$medDir = Join-Path $root 'images\media\gallery-images\rect-med'
New-Item -ItemType Directory -Force -Path $smlDir, $medDir | Out-Null

$seen = @{}
$total = 0; $ok = 0
foreach ($g in $four) {
    foreach ($h in $g.slides) {
        if ($seen.ContainsKey($h)) { continue }
        $seen[$h] = $true
        $total++
        $dst = Join-Path $smlDir "$h.jpg"
        if (Test-Path $dst) { $ok++; continue }
        if (Get-WithRetry "$base/rect-sml/$h.jpg" $dst) { $ok++; Write-Output "OK rect-sml $h" } else { Write-Output "FAIL rect-sml $h" }
        Start-Sleep -Seconds 2
    }
    if ($g.og) {
        $dst = Join-Path $medDir "$($g.og).jpg"
        if (-not (Test-Path $dst)) {
            if (Get-WithRetry "$base/rect-med/$($g.og).jpg" $dst) { Write-Output "OK rect-med $($g.og)" } else { Write-Output "FAIL rect-med $($g.og)" }
            Start-Sleep -Seconds 2
        }
    }
}
Write-Output "done: $ok/$total new files (4 album)"
