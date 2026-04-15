Add-Type -AssemblyName System.IO.Compression.FileSystem
$pbixPath = "c:\Users\AmritpreetSinghBhati\Desktop\Theme Generator - NextJs\theme-generator\Blank PBIX.pbix"
$zip = [System.IO.Compression.ZipFile]::OpenRead($pbixPath)
foreach ($entry in $zip.Entries) {
    Write-Output ("{0}: Compressed={1}, Uncompressed={2}" -f $entry.FullName, $entry.CompressedLength, $entry.Length)
}
$zip.Dispose()
