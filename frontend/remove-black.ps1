Add-Type -AssemblyName System.Drawing
$inputFile = "c:\projects\sasilk\public\custom-pillar.png"
$outputFile = "c:\projects\sasilk\public\custom-pillar-transparent.png"
$bitmap = [System.Drawing.Bitmap]::FromFile($inputFile)
# Make the pure black background transparent
$bitmap.MakeTransparent([System.Drawing.Color]::Black)
$bitmap.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
Write-Host "Transparency applied successfully."
