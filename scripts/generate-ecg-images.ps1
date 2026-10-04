# ###################################################
# File Name : generate-ecg-images.ps1
# Purpose : Generate the ECG page's language-neutral concept illustrations.
# Description : Projects fictional layered graphs into raster PNG images using
#               System.Drawing and colors from the shared HASM palette.
# ###################################################

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$outputDirectory = Join-Path $root 'public/images'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

Push-Location $root
try {
    $paletteJson = node --input-type=module -e "import { getPatternById } from './src/hasm_color_pattern/src/index.js'; process.stdout.write(JSON.stringify({ cool: getPatternById('ocean-light').colors, warm: getPatternById('sunrise-light').colors, green: getPatternById('forest-light').colors }));"
    if ($LASTEXITCODE -ne 0) { throw 'Unable to load HASM color patterns.' }
    $palette = $paletteJson | ConvertFrom-Json
} finally {
    Pop-Location
}

$background = [System.Drawing.ColorTranslator]::FromHtml($palette.cool.textBackgroundColor)
$ink = [System.Drawing.ColorTranslator]::FromHtml($palette.cool.textColor)
$cool = [System.Drawing.ColorTranslator]::FromHtml($palette.cool.mainColor)
$warm = [System.Drawing.ColorTranslator]::FromHtml($palette.warm.mainColor)
$green = [System.Drawing.ColorTranslator]::FromHtml($palette.green.mainColor)
$labelFont = New-Object System.Drawing.Font('Georgia', 24)
$axisFont = New-Object System.Drawing.Font('Georgia', 21, ([System.Drawing.FontStyle]::Italic))
$labelBrush = New-Object System.Drawing.SolidBrush($ink)
$backgroundBrush = New-Object System.Drawing.SolidBrush($background)
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(24, $cool), 1)
$axisPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, $cool), 2)
$causalPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(185, $cool), 4)
$semanticPen = New-Object System.Drawing.Pen($warm, 4)
$semanticPen.DashPattern = [single[]]@(3, 2.5)
$trajectoryPen = New-Object System.Drawing.Pen($green, 4)
$arrowCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(5, 6)
$causalPen.CustomEndCap = $arrowCap
$axisPen.CustomEndCap = $arrowCap

function Project([double]$time, [double]$context, [double]$depth) {
    return [System.Drawing.PointF]::new((190 + $time * 170 + $context * 80), (650 - $context * 78 - $depth * 120))
}

function Draw-Label($graphics, [string]$text, [System.Drawing.PointF]$point, [int]$offset = 32) {
    $labelSize = $graphics.MeasureString($text, $labelFont)
    $graphics.FillRectangle($backgroundBrush, ($point.X - 22), ($point.Y + $offset), ($labelSize.Width + 4), $labelSize.Height)
    $graphics.DrawString($text, $labelFont, $labelBrush, ($point.X - 20), ($point.Y + $offset))
}

function Draw-Sphere($graphics, [System.Drawing.PointF]$point, [string]$id) {
    $bounds = [System.Drawing.RectangleF]::new(($point.X - 19), ($point.Y - 19), 38, 38)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse($bounds)
    $fill = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $fill.CenterPoint = [System.Drawing.PointF]::new(($point.X - 6), ($point.Y - 7))
    $fill.CenterColor = $background
    $fill.SurroundColors = [System.Drawing.Color[]]@($cool)
    $graphics.FillEllipse($fill, $bounds)
    Draw-Label $graphics $id $point 26
    $fill.Dispose()
    $path.Dispose()
}

function Draw-Cube($graphics, [System.Drawing.PointF]$point, [string]$id) {
    $top = [System.Drawing.PointF]::new($point.X, ($point.Y - 25))
    $left = [System.Drawing.PointF]::new(($point.X - 23), ($point.Y - 12))
    $right = [System.Drawing.PointF]::new(($point.X + 23), ($point.Y - 12))
    $middle = [System.Drawing.PointF]::new($point.X, ($point.Y + 1))
    $bottom = [System.Drawing.PointF]::new($point.X, ($point.Y + 27))
    $leftBottom = [System.Drawing.PointF]::new(($point.X - 23), ($point.Y + 13))
    $rightBottom = [System.Drawing.PointF]::new(($point.X + 23), ($point.Y + 13))
    $topBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(125, $cool))
    $leftBrush = New-Object System.Drawing.SolidBrush($cool)
    $rightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(185, $cool))
    $graphics.FillPolygon($topBrush, [System.Drawing.PointF[]]@($top, $left, $middle, $right))
    $graphics.FillPolygon($leftBrush, [System.Drawing.PointF[]]@($left, $leftBottom, $bottom, $middle))
    $graphics.FillPolygon($rightBrush, [System.Drawing.PointF[]]@($middle, $bottom, $rightBottom, $right))
    Draw-Label $graphics $id $point 34
    $topBrush.Dispose()
    $leftBrush.Dispose()
    $rightBrush.Dispose()
}

function Draw-Experience($graphics, [System.Drawing.PointF]$point, [string]$id, [System.Drawing.Color]$color) {
    $top = [System.Drawing.PointF]::new($point.X, ($point.Y - 34))
    $left = [System.Drawing.PointF]::new(($point.X - 27), $point.Y)
    $right = [System.Drawing.PointF]::new(($point.X + 27), $point.Y)
    $middle = [System.Drawing.PointF]::new(($point.X + 6), ($point.Y - 2))
    $bottom = [System.Drawing.PointF]::new($point.X, ($point.Y + 34))
    $halo = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, $color), 2)
    $graphics.DrawEllipse($halo, ($point.X - 45), ($point.Y - 45), 90, 90)
    $faceBrush = New-Object System.Drawing.SolidBrush($color)
    $lightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, $color))
    $graphics.FillPolygon($faceBrush, [System.Drawing.PointF[]]@($top, $left, $middle))
    $graphics.FillPolygon($lightBrush, [System.Drawing.PointF[]]@($top, $middle, $right))
    $graphics.FillPolygon($lightBrush, [System.Drawing.PointF[]]@($left, $bottom, $middle))
    $graphics.FillPolygon($faceBrush, [System.Drawing.PointF[]]@($middle, $bottom, $right))
    Draw-Label $graphics $id $point 42
    $halo.Dispose()
    $faceBrush.Dispose()
    $lightBrush.Dispose()
}

function Draw-Link($graphics, $pen, [System.Drawing.PointF]$start, [System.Drawing.PointF]$end, [double]$bend = 0) {
    if ($pen -eq $causalPen) {
        $deltaX = $end.X - $start.X
        $deltaY = $end.Y - $start.Y
        $distance = [Math]::Sqrt($deltaX * $deltaX + $deltaY * $deltaY)
        $end = [System.Drawing.PointF]::new(($end.X - $deltaX / $distance * 30), ($end.Y - $deltaY / $distance * 30))
    }
    $firstControl = [System.Drawing.PointF]::new(($start.X + ($end.X - $start.X) * 0.33), ($start.Y + ($end.Y - $start.Y) * 0.33 - $bend))
    $secondControl = [System.Drawing.PointF]::new(($start.X + ($end.X - $start.X) * 0.66), ($start.Y + ($end.Y - $start.Y) * 0.66 - $bend))
    $graphics.DrawBezier($pen, $start, $firstControl, $secondControl, $end)
}

function Draw-Base($graphics) {
    for ($time = 0; $time -le 6; $time++) {
        $graphics.DrawLine($gridPen, (Project $time 0 0), (Project $time 3.8 0))
    }
    for ($context = 0; $context -le 3.5; $context += 0.5) {
        $graphics.DrawLine($gridPen, (Project 0 $context 0), (Project 6.5 $context 0))
    }
    $origin = Project 0 0 0
    $timeEnd = Project 7 0 0
    $contextEnd = Project 0 4.4 0
    $depthEnd = Project 0 0 4.3
    $graphics.DrawLine($axisPen, $origin, $timeEnd)
    $graphics.DrawLine($axisPen, $origin, $contextEnd)
    $graphics.DrawLine($axisPen, $origin, $depthEnd)
    $graphics.DrawString('X', $axisFont, $labelBrush, ($timeEnd.X + 12), ($timeEnd.Y - 14))
    $graphics.DrawString('Y', $axisFont, $labelBrush, ($contextEnd.X + 14), ($contextEnd.Y - 24))
    $graphics.DrawString('Z', $axisFont, $labelBrush, ($depthEnd.X - 13), ($depthEnd.Y - 42))
}

function Save-Illustration([string]$name, [bool]$branches) {
    $bitmap = New-Object System.Drawing.Bitmap(1600, 800)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    try {
        $graphics.Clear($background)
        Draw-Base $graphics
        $first = Project 0.5 0.4 0
        $second = Project 2.2 1.2 0
        $achievement = Project 4.1 1.2 0
        Draw-Link $graphics $causalPen $first $second
        Draw-Link $graphics $causalPen $second $achievement
        if ($branches) {
            $original = Project 1.1 0.4 2.5
            $alternative = Project 1.8 2.8 1.7
            $reevaluation = Project 4.8 1.6 2.8
            Draw-Link $graphics $semanticPen $first $original 32
            Draw-Link $graphics $semanticPen $first $alternative 45
            Draw-Link $graphics $semanticPen $achievement $reevaluation 30
            Draw-Link $graphics $semanticPen $original $reevaluation 75
            Draw-Link $graphics $trajectoryPen $alternative $reevaluation -80
            Draw-Experience $graphics $original 'E1' $warm
            Draw-Experience $graphics $alternative 'E2' $green
            Draw-Experience $graphics $reevaluation 'E3' $warm
        } else {
            $last = Project 5.3 2.9 0
            $earlyExperience = Project 1.9 1.4 2.2
            $laterExperience = Project 4.6 1.8 2.4
            Draw-Link $graphics $causalPen $achievement $last
            Draw-Link $graphics $semanticPen $first $earlyExperience 26
            Draw-Link $graphics $semanticPen $second $earlyExperience 26
            Draw-Link $graphics $semanticPen $achievement $laterExperience 20
            Draw-Link $graphics $semanticPen $last $laterExperience 20
            Draw-Link $graphics $trajectoryPen $earlyExperience $laterExperience 70
            Draw-Cube $graphics $last 'A2'
            Draw-Experience $graphics $earlyExperience 'E1' $warm
            Draw-Experience $graphics $laterExperience 'E2' $green
        }
        Draw-Sphere $graphics $first 'R1'
        Draw-Sphere $graphics $second 'R2'
        Draw-Cube $graphics $achievement 'A1'
        $bitmap.Save((Join-Path $outputDirectory $name), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

try {
    Save-Illustration 'ecg-layers.png' $false
    Save-Illustration 'ecg-branches.png' $true
} finally {
    $labelFont.Dispose()
    $axisFont.Dispose()
    $labelBrush.Dispose()
    $backgroundBrush.Dispose()
    $gridPen.Dispose()
    $axisPen.Dispose()
    $causalPen.Dispose()
    $semanticPen.Dispose()
    $trajectoryPen.Dispose()
    $arrowCap.Dispose()
}