Add-Type -AssemblyName System.Drawing

function Draw-PlantBookIcon([int]$size, [bool]$isRound) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml("#2E1065")), ([System.Drawing.ColorTranslator]::FromHtml("#4338CA")), 45.0

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $size, $size)
        $g.FillPath($bgBrush, $path)
        $path.Dispose()
    } else {
        # Squircle / rounded rect
        $corner = [int]($size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $corner * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($size - $d, 0, $d, $d, 270, 90)
        $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
        $path.AddArc(0, $size - $d, $d, $d, 90, 90)
        $path.CloseFigure()
        $g.FillPath($bgBrush, $path)
        $path.Dispose()
    }
    $bgBrush.Dispose()

    # Scale coordinates based on 64x64 grid
    $scale = $size / 64.0

    # Book base
    $bookBaseBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#1E1B4B"))
    $bookBasePts = @(
        New-Object System.Drawing.PointF (8 * $scale), (48 * $scale)
        New-Object System.Drawing.PointF (32 * $scale), (46 * $scale)
        New-Object System.Drawing.PointF (56 * $scale), (48 * $scale)
        New-Object System.Drawing.PointF (53 * $scale), (53 * $scale)
        New-Object System.Drawing.PointF (32 * $scale), (52 * $scale)
        New-Object System.Drawing.PointF (11 * $scale), (53 * $scale)
    )
    $g.FillPolygon($bookBaseBrush, $bookBasePts)
    $bookBaseBrush.Dispose()

    # Left Page (White)
    $leftPageBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF"))
    $leftPts = @(
        New-Object System.Drawing.PointF (10 * $scale), (46 * $scale)
        New-Object System.Drawing.PointF (32 * $scale), (45 * $scale)
        New-Object System.Drawing.PointF (32 * $scale), (38 * $scale)
        New-Object System.Drawing.PointF (10 * $scale), (39 * $scale)
    )
    $g.FillPolygon($leftPageBrush, $leftPts)
    $leftPageBrush.Dispose()

    # Right Page (Soft Slate White)
    $rightPageBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F1F5F9"))
    $rightPts = @(
        New-Object System.Drawing.PointF (32 * $scale), (45 * $scale)
        New-Object System.Drawing.PointF (54 * $scale), (46 * $scale)
        New-Object System.Drawing.PointF (54 * $scale), (39 * $scale)
        New-Object System.Drawing.PointF (32 * $scale), (38 * $scale)
    )
    $g.FillPolygon($rightPageBrush, $rightPts)
    $rightPageBrush.Dispose()

    # Spine Ribbon
    $ribbonBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F59E0B"))
    $g.FillRectangle($ribbonBrush, [float](31 * $scale), [float](46.5 * $scale), [float](2 * $scale), [float](5.5 * $scale))
    $ribbonBrush.Dispose()

    # Stem
    $stemPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#10B981")), ([float](3.2 * $scale))
    $stemPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $stemPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($stemPen, [float](32 * $scale), [float](41 * $scale), [float](32 * $scale), [float](23 * $scale))
    $stemPen.Dispose()

    # Left Leaf (Emerald Green)
    $leftLeafBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#10B981"))
    $leftLeafPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $leftLeafPath.AddBezier([float](32 * $scale), [float](31 * $scale), [float](25 * $scale), [float](29 * $scale), [float](20 * $scale), [float](22 * $scale), [float](23 * $scale), [float](16 * $scale))
    $leftLeafPath.AddBezier([float](23 * $scale), [float](16 * $scale), [float](29 * $scale), [float](17 * $scale), [float](31 * $scale), [float](23 * $scale), [float](32 * $scale), [float](27 * $scale))
    $leftLeafPath.CloseFigure()
    $g.FillPath($leftLeafBrush, $leftLeafPath)
    $leftLeafBrush.Dispose()
    $leftLeafPath.Dispose()

    # Right Leaf (Mint / Forest Green)
    $rightLeafBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#059669"))
    $rightLeafPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rightLeafPath.AddBezier([float](32 * $scale), [float](28 * $scale), [float](39 * $scale), [float](26 * $scale), [float](44 * $scale), [float](19 * $scale), [float](41 * $scale), [float](13 * $scale))
    $rightLeafPath.AddBezier([float](41 * $scale), [float](13 * $scale), [float](35 * $scale), [float](14 * $scale), [float](33 * $scale), [float](20 * $scale), [float](32 * $scale), [float](24 * $scale))
    $rightLeafPath.CloseFigure()
    $g.FillPath($rightLeafBrush, $rightLeafPath)
    $rightLeafBrush.Dispose()
    $rightLeafPath.Dispose()

    # Apex Leaf Bud
    $apexBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#6EE7B7"))
    $g.FillEllipse($apexBrush, [float](30.5 * $scale), [float](12 * $scale), [float](3 * $scale), [float](9 * $scale))
    $apexBrush.Dispose()

    # Golden Guidance Star
    $starBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#FBBF24"))
    $starPts = @(
        New-Object System.Drawing.PointF (32 * $scale), (6 * $scale)
        New-Object System.Drawing.PointF (33.2 * $scale), (9.5 * $scale)
        New-Object System.Drawing.PointF (36.5 * $scale), (10.5 * $scale)
        New-Object System.Drawing.PointF (33.2 * $scale), (11.5 * $scale)
        New-Object System.Drawing.PointF (32 * $scale), (15 * $scale)
        New-Object System.Drawing.PointF (30.8 * $scale), (11.5 * $scale)
        New-Object System.Drawing.PointF (27.5 * $scale), (10.5 * $scale)
        New-Object System.Drawing.PointF (30.8 * $scale), (9.5 * $scale)
    )
    $g.FillPolygon($starBrush, $starPts)
    $starBrush.Dispose()

    $g.Dispose()
    return $bmp
}

$resBase = "C:\Users\Abhis\.gemini\antigravity\scratch\shikshan\android\app\src\main\res"

$densities = @(
    @{ folder = "mipmap-mdpi"; size = 48 },
    @{ folder = "mipmap-hdpi"; size = 72 },
    @{ folder = "mipmap-xhdpi"; size = 96 },
    @{ folder = "mipmap-xxhdpi"; size = 144 },
    @{ folder = "mipmap-xxxhdpi"; size = 192 }
)

foreach ($d in $densities) {
    $dir = Join-Path $resBase $d.folder
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    # Standard Icon
    $icon = Draw-PlantBookIcon $d.size $false
    $iconPath = Join-Path $dir "ic_launcher.png"
    $icon.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $icon.Dispose()

    # Round Icon
    $roundIcon = Draw-PlantBookIcon $d.size $true
    $roundPath = Join-Path $dir "ic_launcher_round.png"
    $roundIcon.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $roundIcon.Dispose()

    # Foreground Icon
    $fg = Draw-PlantBookIcon $d.size $false
    $fgPath = Join-Path $dir "ic_launcher_foreground.png"
    $fg.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $fg.Dispose()

    Write-Output "Generated icons in $($d.folder) ($($d.size)x$($d.size))"
}

# Generate splash screen
function Draw-SplashScreen([int]$width, [int]$height, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml("#F7F5FC")), ([System.Drawing.ColorTranslator]::FromHtml("#ECE5FA")), 90.0
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Draw centered icon
    $iconSize = [int]([Math]::Min($width, $height) * 0.30)
    $icon = Draw-PlantBookIcon $iconSize $false
    $x = ($width - $iconSize) / 2
    $y = ($height - $iconSize) / 2 - ($iconSize * 0.25)
    $g.DrawImage($icon, [float]$x, [float]$y, [float]$iconSize, [float]$iconSize)
    $icon.Dispose()

    # Text
    $fontSize = [float]([Math]::Max(16.0, $iconSize * 0.18))
    $font = [System.Drawing.Font]::new("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#1C1938"))

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textY = $y + $iconSize + ($iconSize * 0.15)
    $g.DrawString("Shikshan", $font, $textBrush, [float]($width / 2), [float]$textY, $format)

    $subFontSize = [float]($fontSize * 0.45)
    $subFont = [System.Drawing.Font]::new("Arial", $subFontSize, [System.Drawing.FontStyle]::Regular)
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#7C3AED"))
    $g.DrawString("Learn with confidence. Grow with guidance.", $subFont, $subBrush, [float]($width / 2), [float]($textY + $fontSize * 1.6), $format)

    $font.Dispose()
    $subFont.Dispose()
    $textBrush.Dispose()
    $subBrush.Dispose()
    $format.Dispose()
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$splashDirs = @(
    @{ path = "drawable/splash.png"; w = 480; h = 800 },
    @{ path = "drawable-port-hdpi/splash.png"; w = 480; h = 800 },
    @{ path = "drawable-port-mdpi/splash.png"; w = 320; h = 480 },
    @{ path = "drawable-port-xhdpi/splash.png"; w = 720; h = 1280 },
    @{ path = "drawable-port-xxhdpi/splash.png"; w = 960; h = 1600 },
    @{ path = "drawable-port-xxxhdpi/splash.png"; w = 1280; h = 1920 },
    @{ path = "drawable-land-hdpi/splash.png"; w = 800; h = 480 },
    @{ path = "drawable-land-mdpi/splash.png"; w = 480; h = 320 },
    @{ path = "drawable-land-xhdpi/splash.png"; w = 1280; h = 720 },
    @{ path = "drawable-land-xxhdpi/splash.png"; w = 1600; h = 960 },
    @{ path = "drawable-land-xxxhdpi/splash.png"; w = 1920; h = 1280 }
)

foreach ($s in $splashDirs) {
    $fullPath = Join-Path $resBase $s.path
    $parentDir = Split-Path $fullPath
    if (-not (Test-Path $parentDir)) { New-Item -ItemType Directory -Path $parentDir -Force | Out-Null }
    Draw-SplashScreen $s.w $s.h $fullPath
    Write-Output "Generated splash screen: $($s.path) ($($s.w)x$($s.h))"
}
