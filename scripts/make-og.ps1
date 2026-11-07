# Снимает картинку-превью для соцсетей со страницы /og в public/og.png (1200x630).
# Нужен запущенный dev-сервер (npm run dev). Использует уже установленный Chrome — без новых пакетов.
# Запуск: powershell -ExecutionPolicy Bypass -File scripts/make-og.ps1

$chrome = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
$out = Join-Path $PSScriptRoot "..\public\og.png"

& $chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
  --window-size=1200,630 --virtual-time-budget=4000 `
  --screenshot="$out" "http://localhost:4321/umbra/og" | Out-Null

if (Test-Path $out) { "OK: $out" } else { "FAILED: is 'npm run dev' running?" }

# иконка для iPhone: тот же favicon.svg, отрисованный в 180x180
$icon = Join-Path $PSScriptRoot "..\public\apple-touch-icon.png"
# SVG без width/height браузер рисует 300x150, поэтому оборачиваем в страницу точного размера
$wrap = Join-Path $env:TEMP "umbra-icon.html"
$svg = (Get-Content (Join-Path $PSScriptRoot "..\public\favicon.svg") -Raw) -replace '<svg ', '<svg width="180" height="180" style="display:block" '
"<!doctype html><body style=`"margin:0;background:#090910`">$svg</body>" | Set-Content -Path $wrap -Encoding ascii
& $chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
  --window-size=180,180 --virtual-time-budget=2000 --screenshot="$icon" "file:///$($wrap -replace '\\','/')" | Out-Null
Remove-Item $wrap
if (Test-Path $icon) { "OK: $icon" }
