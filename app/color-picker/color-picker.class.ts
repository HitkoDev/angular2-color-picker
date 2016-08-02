export class Hsva {
    constructor(public h: number, public s: number, public v: number, public a: number) { }
}
export class Hsla {
    constructor(public h: number, public s: number, public l: number, public a: number) { }
}
export class Rgba {
    constructor(public r: number, public g: number, public b: number, public a: number) { }
}
export class SliderPosition {
    constructor(public h: string, public s: string, public v: string, public a: string) { }
}
export class SliderDimension {
    constructor(public h: number, public s: number, public v: number, public a: number) { }
}
export class ColorPickerOptions {
    position: string = 'right'
    outputFormat: string = 'hex'
    cancelButton: boolean = false
    cancelButtonText: string = 'Cancel'
    fallbackColor: string = '#ffffff'
    dialogHeight: number = 290
    dialogWidth: number = 230
    alpha: boolean = true
}