$path = "c:\Users\pafer\Desktop\warngen_antig\warning_gen\frontend\src\App.js"
$lines = Get-Content $path -Encoding UTF8
$newLines = $lines[0..919] + $lines[1161..($lines.Count - 1)]
$newLines | Set-Content $path -Encoding UTF8
