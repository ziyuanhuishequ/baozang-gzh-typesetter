Add-Type -AssemblyName System.Drawing
$root = "C:\Users\Administrator\Documents\Codex\2026-07-09\https-github-com-isjiamu-gzh-design\outputs\gzh-electron-app"
$build = Join-Path $root "build"
$sizes = @(16,24,32,48,64,128,256)
$pngs = @()
function RoundedRect($x,$y,$w,$h,$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x,$y,$d,$d,180,90)
  $p.AddArc($x+$w-$d,$y,$d,$d,270,90)
  $p.AddArc($x+$w-$d,$y+$h-$d,$d,$d,0,90)
  $p.AddArc($x,$y+$h-$d,$d,$d,90,90)
  $p.CloseFigure()
  return $p
}
foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)
  $rect = New-Object System.Drawing.RectangleF(($size*0.06),($size*0.06),($size*0.88),($size*0.88))
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255,16,185,129)), ([System.Drawing.Color]::FromArgb(255,4,120,87)), 45
  $bg = RoundedRect ($size*0.06) ($size*0.06) ($size*0.88) ($size*0.88) ($size*0.2)
  $g.FillPath($brush, $bg)
  $doc = RoundedRect ($size*0.28) ($size*0.22) ($size*0.44) ($size*0.56) ($size*0.07)
  $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245,255,255,255))), $doc)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,5,150,105)), ([Math]::Max(1.4, $size*0.045))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  foreach ($i in 0..2) {
    $y = $size*(0.38 + $i*0.12)
    $x1 = $size*0.37
    $x2 = if ($i -eq 2) { $size*0.58 } else { $size*0.63 }
    $g.DrawLine($pen, $x1, $y, $x2, $y)
  }
  $accentPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,187,247,208)), ([Math]::Max(1.6, $size*0.05))
  $accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($accentPen, $size*0.31, $size*0.74, $size*0.69, $size*0.74)
  $png = Join-Path $build "app-icon-$size.png"
  $bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngs += [PSCustomObject]@{ Size=$size; Path=$png; Bytes=[System.IO.File]::ReadAllBytes($png) }
  $pen.Dispose(); $accentPen.Dispose(); $brush.Dispose(); $g.Dispose(); $bmp.Dispose(); $bg.Dispose(); $doc.Dispose()
}
$icoPath = Join-Path $build "app-icon.ico"
$fs = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$pngs.Count)
$offset = 6 + 16 * $pngs.Count
foreach ($p in $pngs) {
  $w = if ($p.Size -eq 256) { 0 } else { $p.Size }
  $bw.Write([Byte]$w); $bw.Write([Byte]$w); $bw.Write([Byte]0); $bw.Write([Byte]0)
  $bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$p.Bytes.Length); $bw.Write([UInt32]$offset)
  $offset += $p.Bytes.Length
}
foreach ($p in $pngs) { $bw.Write($p.Bytes) }
$bw.Close(); $fs.Close()
Write-Host "Generated $icoPath"
