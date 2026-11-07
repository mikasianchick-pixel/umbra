# Screenshots for README: headless Chrome -> docs/screenshots/*.png
# Shoots the production build (no Astro dev toolbar):
#   npm run build; npm run preview -- --port 4400   (in another terminal)
#   powershell -ExecutionPolicy Bypass -File scripts/screenshots.ps1
# Uses the installed Chrome, no extra packages.

param([string]$base = "http://localhost:4400")
$chrome = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
$dir = Join-Path $PSScriptRoot "..\docs\screenshots"
New-Item -ItemType Directory -Force $dir | Out-Null

$shots = @(
  @{ name = "home";      url = "/?noloader";            size = "1440,900" },
  @{ name = "catalog";   url = "/games";                size = "1440,900" },
  @{ name = "game";      url = "/games/hollow-signal";  size = "1440,900" },
  @{ name = "system";    url = "/system";               size = "1440,900" },
  @{ name = "404-game";  url = "/oops";                 size = "1440,900" },
  # headless Chrome can't make a window narrower than ~500px, so the phone shot
  # loads the site inside a 390px iframe on a temporary wrapper page (removed below)
  @{ name = "mobile";    url = "/_phone.html";          size = "390,844" }
)

$wrapper = Join-Path $PSScriptRoot "..\dist\_phone.html"
'<!doctype html><body style="margin:0;background:#090910"><iframe src="/?noloader" width="390" height="844" style="border:0;display:block"></iframe></body>' |
  Set-Content -Path $wrapper -Encoding ascii

foreach ($s in $shots) {
  $out = Join-Path $dir "$($s.name).png"
  # software WebGL (SwiftShader) so the Three.js scene renders without a GPU;
  # virtual time lets the loader and the intro animation finish before the shot
  & $chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 `
    --use-angle=swiftshader --enable-unsafe-swiftshader `
    --window-size=$($s.size) --virtual-time-budget=9000 `
    --screenshot="$out" "$base$($s.url)" 2>$null | Out-Null
  if (Test-Path $out) { "OK: $($s.name)" } else { "FAILED: $($s.name)" }
}

Remove-Item $wrapper
