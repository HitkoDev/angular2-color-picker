import { Injectable } from '@angular/core'
import { Rgba, Hsla, Hsva } from './color-picker.class'

@Injectable()
export class ColorPickerService {
    constructor() { }

    hsla2hsva(hsla: Hsla): Hsva {
        var h = Math.min(hsla.h, 1), s = Math.min(hsla.s, 1), l = Math.min(hsla.l, 1), a = Math.min(hsla.a, 1)
        if (l == 0)
            return new Hsva(h, 0, 0, a)
        else {
            var v = l + s * (1 - Math.abs(2 * l - 1)) / 2
            return new Hsva(h, 2 * (v - l) / v, v, a)
        }
    }

    hsva2hsla(hsva: Hsva): Hsla {
        var h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a
        if (v == 0)
            return new Hsla(h, 0, 0, a)
        else if (s == 0 && v == 1)
            return new Hsla(h, 1, 1, a)
        else {
            var l = v * (2 - s) / 2
            return new Hsla(h, v * s / (1 - Math.abs(2 * l - 1)), l, a)
        }
    }

    rgbaToHsva(rgba: Rgba): Hsva {
        var r = Math.min(rgba.r, 1), g = Math.min(rgba.g, 1), b = Math.min(rgba.b, 1), a = Math.min(rgba.a, 1)
        var max = Math.max(r, g, b), min = Math.min(r, g, b)
        var h, s, v = max

        var d = max - min
        s = max == 0 ? 0 : d / max

        if (max == min)
            h = 0
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0)
                    break
                case g:
                    h = (b - r) / d + 2
                    break
                case b:
                    h = (r - g) / d + 4
                    break
            }
            h /= 6
        }

        return new Hsva(h, s, v, a)
    }

    hsvaToRgba(hsva: Hsva): Rgba {
        var h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a
        var r, g, b

        var i = Math.floor(h * 6)
        var f = h * 6 - i
        var p = v * (1 - s)
        var q = v * (1 - f * s)
        var t = v * (1 - (1 - f) * s)

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p
                break
            case 1:
                r = q, g = v, b = p
                break
            case 2:
                r = p, g = v, b = t
                break
            case 3:
                r = p, g = q, b = v
                break
            case 4:
                r = t, g = p, b = v
                break
            case 5:
                r = v, g = p, b = q
                break
        }

        return new Rgba(r, g, b, a)
    }

    stringToHsva(colorString: string = ''): Hsva {
        var stringParsers = [
            {
                re: /(rgb)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*%?,\s*(\d{1,3})\s*%?(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                parse: function (execResult) {
                    return new Rgba(parseInt(execResult[2]) / 255,
                        parseInt(execResult[3]) / 255,
                        parseInt(execResult[4]) / 255,
                        isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5]))
                }
            },
            {
                re: /(hsl)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                parse: function (execResult) {
                    return new Hsla(parseInt(execResult[2]) / 360,
                        parseInt(execResult[3]) / 100,
                        parseInt(execResult[4]) / 100,
                        isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5]))
                }
            },
            {
                re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/,
                parse: function (execResult) {
                    return new Rgba(parseInt(execResult[1], 16) / 255,
                        parseInt(execResult[2], 16) / 255,
                        parseInt(execResult[3], 16) / 255,
                        1)
                }
            },
            {
                re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/,
                parse: function (execResult) {
                    return new Rgba(parseInt(execResult[1] + execResult[1], 16) / 255,
                        parseInt(execResult[2] + execResult[2], 16) / 255,
                        parseInt(execResult[3] + execResult[3], 16) / 255,
                        1)
                }
            }
        ]
        colorString = colorString.toLowerCase()
        var hsva = null
        for (var key in stringParsers) {
            if (stringParsers.hasOwnProperty(key)) {
                var parser = stringParsers[key]
                var match = parser.re.exec(colorString), color = match && parser.parse(match)
                if (color) {
                    if (color instanceof Rgba)
                        hsva = this.rgbaToHsva(color)
                    else if (color instanceof Hsla)
                        hsva = this.hsla2hsva(color)

                    return hsva
                }
            }
        }
        return hsva
    }

    outputFormat(hsva: Hsva, outputFormat: string): string {
        if (hsva.a < 1)
            switch (outputFormat) {
                case 'hsla':
                    let hsla = this.hsva2hsla(hsva)
                    let hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100), Math.round(hsla.a * 100) / 100)
                    return 'hsla(' + hslaText.h + ',' + hslaText.s + '%,' + hslaText.l + '%,' + hslaText.a + ')'

                default:
                    let rgba = this.denormalizeRGBA(this.hsvaToRgba(hsva))
                    return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + Math.round(rgba.a * 100) / 100 + ')'
            }
        else
            switch (outputFormat) {
                case 'hsla':
                    let hsla = this.hsva2hsla(hsva)
                    let hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100), Math.round(hsla.a * 100) / 100)
                    return 'hsl(' + hslaText.h + ',' + hslaText.s + '%,' + hslaText.l + '%)'

                case 'rgba':
                    let rgba = this.denormalizeRGBA(this.hsvaToRgba(hsva))
                    return 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')'

                default:
                    return this.hexText(this.denormalizeRGBA(this.hsvaToRgba(hsva)))
            }
    }

    hexText(rgba: Rgba): string {
        let hexText = '#' + ((1 << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b).toString(16).substr(1)
        if (hexText[1] == hexText[2] && hexText[3] == hexText[4] && hexText[5] == hexText[6])
            hexText = '#' + hexText[1] + hexText[3] + hexText[5]

        return hexText
    }

    denormalizeRGBA(rgba: Rgba): Rgba {
        return new Rgba(Math.round(rgba.r * 255), Math.round(rgba.g * 255), Math.round(rgba.b * 255), rgba.a)
    }

    calculateContrast(foreground: Rgba, background: Rgba) {

        if (Math.round(foreground.a * 100) < 100)
            foreground = this.compositeColors(foreground, background)

        let luminance1 = this.calculateLuminance(foreground) + 0.05
        let luminance2 = this.calculateLuminance(background) + 0.05

        return Math.max(luminance1, luminance2) / Math.min(luminance1, luminance2)
    }

    compositeColors(foreground: Rgba, background: Rgba) {
        let a = this.compositeAlpha(foreground.a, background.a)

        let r = this.compositeComponent(foreground.r, foreground.a, background.r, background.a, a)
        let g = this.compositeComponent(foreground.g, foreground.a, background.g, background.a, a)
        let b = this.compositeComponent(foreground.b, foreground.a, background.b, background.a, a)

        return new Rgba(r, g, b, a)
    }

    compositeAlpha(foregroundAlpha: number, backgroundAlpha: number) {
        return 1 - (1 - backgroundAlpha) * (1 - foregroundAlpha)
    }

    compositeComponent(fgC: number, fgA: number, bgC: number, bgA: number, a: number) {
        if (a == 0) return 0
        return ((fgC * fgA) + (bgC * bgA * (1 - fgA))) / a
    }

    calculateLuminance(color: Rgba) {
        let red = color.r / 255
        red = red < 0.03928 ? red / 12.92 : Math.pow((red + 0.055) / 1.055, 2.4)

        let green = color.g / 255
        green = green < 0.03928 ? green / 12.92 : Math.pow((green + 0.055) / 1.055, 2.4)

        let blue = color.b / 255
        blue = blue < 0.03928 ? blue / 12.92 : Math.pow((blue + 0.055) / 1.055, 2.4)

        return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue)
    }

    calculateMinimumAlpha(foreground: Rgba, background: Rgba, minContrastRatio: number) {
        if (Math.round(background.a * 100) < 100)
            return -1

        let testForeground = new Rgba(foreground.r, foreground.g, foreground.b, 1)
        let testRatio = this.calculateContrast(testForeground, background)
        if (testRatio < minContrastRatio)
            return -1

        let numIterations = 0
        let minAlpha = 0
        let maxAlpha = 1

        while (numIterations <= 10 && (maxAlpha - minAlpha) > 0.01) {
            let testAlpha = (minAlpha + maxAlpha) / 2

            testForeground = new Rgba(foreground.r, foreground.g, foreground.b, testAlpha)
            testRatio = this.calculateContrast(testForeground, background)

            if (testRatio < minContrastRatio)
                minAlpha = testAlpha
            else
                maxAlpha = testAlpha

            numIterations++
        }

        return maxAlpha
    }

}