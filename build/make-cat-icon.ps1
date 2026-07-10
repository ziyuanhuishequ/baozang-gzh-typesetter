Add-Type -AssemblyName System.Drawing
$root = "C:\Users\Administrator\Documents\Codex\2026-07-09\https-github-com-isjiamu-gzh-design\outputs\gzh-electron-app"
$build = Join-Path $root "build"
New-Item -ItemType Directory -Force $build | Out-Null
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

  $bgRect = New-Object System.Drawing.RectangleF(($size*0.06),($size*0.06),($size*0.88),($size*0.88))
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, ([System.Drawing.Color]::FromArgb(255,255,247,237)), ([System.Drawing.Color]::FromArgb(255,209,250,229)), 45
  $bg = RoundedRect ($size*0.06) ($size*0.06) ($size*0.88) ($size*0.88) ($size*0.22)
  $g.FillPath($bgBrush, $bg)
  $g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180,16,185,129)), ([Math]::Max(1,$size*0.012))), $bg)

  $catBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,251,191,36))
  $catDark = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,146,64,14)), ([Math]::Max(1.2,$size*0.018))
  $ear1 = New-Object System.Drawing.PointF[] 3
  $ear1[0] = New-Object System.Drawing.PointF ($size*0.32),($size*0.38)
  $ear1[1] = New-Object System.Drawing.PointF ($size*0.40),($size*0.20)
  $ear1[2] = New-Object System.Drawing.PointF ($size*0.48),($size*0.39)
  $ear2 = New-Object System.Drawing.PointF[] 3
  $ear2[0] = New-Object System.Drawing.PointF ($size*0.52),($size*0.39)
  $ear2[1] = New-Object System.Drawing.PointF ($size*0.62),($size*0.20)
  $ear2[2] = New-Object System.Drawing.PointF ($size*0.70),($size*0.42)
  $g.FillPolygon($catBrush, $ear1); $g.FillPolygon($catBrush, $ear2)
  $g.DrawPolygon($catDark, $ear1); $g.DrawPolygon($catDark, $ear2)

  $face = New-Object System.Drawing.RectangleF ($size*0.25),($size*0.30),($size*0.52),($size*0.42)
  $g.FillEllipse($catBrush, $face)
  $g.DrawEllipse($catDark, $face)

  $eyeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,30,41,59))
  $g.FillEllipse($eyeBrush, ($size*0.40), ($size*0.46), ($size*0.045), ($size*0.06))
  $g.FillEllipse($eyeBrush, ($size*0.59), ($size*0.46), ($size*0.045), ($size*0.06))
  $nose = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,244,114,182))
  $g.FillEllipse($nose, ($size*0.50), ($size*0.54), ($size*0.045), ($size*0.035))
  $mouthPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,120,53,15)), ([Math]::Max(1,$size*0.012))
  $g.DrawArc($mouthPen, ($size*0.47), ($size*0.56), ($size*0.06), ($size*0.05), 20, 120)
  $g.DrawArc($mouthPen, ($size*0.52), ($size*0.56), ($size*0.06), ($size*0.05), 40, 120)

  $paperBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248,255,255,255))
  $paper = RoundedRect ($size*0.30) ($size*0.64) ($size*0.50) ($size*0.22) ($size*0.04)
  $g.FillPath($paperBrush, $paper)
  $g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,16,185,129)), ([Math]::Max(1,$size*0.012))), $paper)
  $linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,16,185,129)), ([Math]::Max(1,$size*0.014))
  $linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($linePen, $size*0.38, $size*0.72, $size*0.66, $size*0.72)
  $g.DrawLine($linePen, $size*0.38, $size*0.78, $size*0.58, $size*0.78)

  $penBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,14,165,233))
  $penPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $penPath.AddPolygon([System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF ($size*0.70),($size*0.58)),
    (New-Object System.Drawing.PointF ($size*0.78),($size*0.62)),
    (New-Object System.Drawing.PointF ($size*0.58),($size*0.86)),
    (New-Object System.Drawing.PointF ($size*0.52),($size*0.83))
  ))
  $g.FillPath($penBrush, $penPath)

  $png = Join-Path $build "cat-icon-$size.png"
  $bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngs += [PSCustomObject]@{ Size=$size; Path=$png; Bytes=[System.IO.File]::ReadAllBytes($png) }
  $g.Dispose(); $bmp.Dispose()
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
