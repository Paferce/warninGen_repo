$path = "c:\Users\pafer\Desktop\warngen_antig\warning_gen\frontend\src\App.js"
$lines = Get-Content $path -Encoding UTF8
$newLines = $lines[0..918] + $lines[1248..1499] + $lines[2603..($lines.Count-1)]
$newLines | Set-Content $path -Encoding UTF8
