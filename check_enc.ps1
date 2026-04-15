Add-Type -AssemblyName System.IO.Compression.FileSystem
$pbixPath = "c:\Users\AmritpreetSinghBhati\Desktop\Theme Generator - NextJs\theme-generator\Blank PBIX.pbix"
$zip = [System.IO.Compression.ZipFile]::OpenRead($pbixPath)
$entry = $zip.GetEntry("Report/definition/report.json")
$stream = $entry.Open()
$bytes = New-Object byte[] 10
$stream.Read($bytes, 0, 10) | Out-Null
Write-Output "Bytes: $($bytes -join ' ')"
$stream.Dispose()
$zip.Dispose()
