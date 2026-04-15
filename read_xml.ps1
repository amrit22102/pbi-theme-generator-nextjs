Add-Type -AssemblyName System.IO.Compression.FileSystem
$pbixPath = "c:\Users\AmritpreetSinghBhati\Desktop\Theme Generator - NextJs\theme-generator\Blank PBIX.pbix"
$zip = [System.IO.Compression.ZipFile]::OpenRead($pbixPath)
$entry = $zip.GetEntry("[Content_Types].xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
Write-Output $content
$reader.Dispose()
$stream.Dispose()
$zip.Dispose()
