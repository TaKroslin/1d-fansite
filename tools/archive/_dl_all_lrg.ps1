$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
$root = (Get-Location).Path
$base = 'https://www.onedirectionmusic.com/onedirectionmusiccom-ukprod/media/gallery-images'

function Get-WithRetry($url, $outFile, $maxTry = 6) {
    for ($i = 1; $i -le $maxTry; $i++) {
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60 -Headers @{'User-Agent'=$ua} -OutFile $outFile
            if ((Get-Item $outFile).Length -gt 10000) { return $true }
            Write-Output "   small file (<10KB), retry $i : $url"
        } catch {
            Write-Output "   retry $i/$maxTry $($url.Substring($url.Length-40)) : $($_.Exception.Message)"
            Start-Sleep -Seconds (6 * $i)
        }
    }
    return $false
}

$inv = Get-Content (Join-Path $root 'tools\_photos_inventory.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$lrgDir = Join-Path $root 'images\media\gallery-images\rect-lrg'
New-Item -ItemType Directory -Force -Path $lrgDir | Out-Null

$seen = @{}
$total = 0; $ok = 0; $fail = 0
foreach ($album in $inv.PSObject.Properties) {
    foreach ($g in $album.Value) {
        foreach ($h in $g.slides) {
            if ($seen.ContainsKey($h)) { continue }
            $seen[$h] = $true
            $total++
            $dst = Join-Path $lrgDir "$h.jpg"
            if ((Test-Path $dst) -and ((Get-Item $dst).Length -gt 10000)) { $ok++; continue }
            if (Get-WithRetry "$base/rect-lrg/$h.jpg" $dst) { $ok++; Write-Output "OK rect-lrg $h" } else { $fail++; Write-Output "FAIL rect-lrg $h" }
            Start-Sleep -Seconds 1
        }
    }
}
Write-Output "done: ok=$ok fail=$fail total=$total"
