$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
$albums = @('up-all-night','take-me-home','midnight-memories','four','made-in-the-am')

function Get-WithRetry($url, $maxTry = 4) {
    for ($i = 1; $i -le $maxTry; $i++) {
        try {
            return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40 -Headers @{'User-Agent'=$ua}).Content
        } catch {
            Write-Output "   retry $i/$maxTry for $url : $($_.Exception.Message)"
            Start-Sleep -Seconds (6 * $i)
        }
    }
    return $null
}

$out = @{}
foreach ($a in $albums) {
    $listUrl = "https://www.onedirectionmusic.com/gb/music/albums/$a/photos"
    Write-Output "=== $a ==="
    $html = Get-WithRetry $listUrl
    if (-not $html) { Write-Output "   LIST FAILED"; $out[$a] = @(); continue }
    # split into gallery-cover panel blocks
    $blocks = [regex]::Split($html, '(?=<div class="panel gallery-cover">)') | Where-Object { $_ -match 'gallery-cover' }
    $gals = @()
    foreach ($b in $blocks) {
        $bgM = [regex]::Match($b, 'background-image: url\(([^)]*gallery-images/rect-sml/([0-9a-f]{32})\.jpg)\)')
        $nameM = [regex]::Match($b, '<h2>([^<]+)</h2>')
        $cntM = [regex]::Match($b, 'count"><span>(\d+)')
        $slugM = [regex]::Match($b, 'photos/([a-z0-9-]+)')
        $name = if ($nameM.Success) { $nameM.Groups[1].Value.Trim() } else { '' }
        if ($name -eq '') { continue }
        # skip the release-header name if it equals album
        if ($name -ieq $a) { continue }
        $gals += @{
            name = $name
            slug = if ($slugM.Success) { $slugM.Groups[1].Value } else { '' }
            count = if ($cntM.Success) { [int]$cntM.Groups[1].Value } else { 0 }
            cover = if ($bgM.Success) { $bgM.Groups[2].Value } else { '' }
        }
    }
    # now scrape each gallery page for slide hashes
    foreach ($g in $gals) {
        if (-not $g.slug) { $g.slides = @(); continue }
        $gUrl = "https://www.onedirectionmusic.com/gb/music/albums/$a/photos/$($g.slug)"
        Start-Sleep -Seconds 3
        $gh = Get-WithRetry $gUrl
        if (-not $gh) { Write-Output "   gallery $($g.slug) FAILED"; $g.slides = @(); continue }
        $g.slides = [regex]::Matches($gh, 'gallery-images/rect-sml/([0-9a-f]{32})\.jpg') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
        $ogM = [regex]::Match($gh, 'og:image" content="[^"]*gallery-images/rect-med/([0-9a-f]{32})\.jpg')
        $g.og = if ($ogM.Success) { $ogM.Groups[1].Value } else { '' }
        Write-Output "   $($g.name) [$($g.count)] slug=$($g.slug) slides=$($g.slides.Count) og=$($g.og)"
        Start-Sleep -Seconds 3
    }
    $out[$a] = $gals
}
$out | ConvertTo-Json -Depth 5 | Out-File -FilePath 'tools\_photos_inventory.json' -Encoding UTF8
Write-Output 'inventory saved'
