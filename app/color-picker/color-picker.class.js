export class Hsva {
    constructor(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
}
export class Hsla {
    constructor(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
}
export class Rgba {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
export class SliderPosition {
    constructor(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
}
export class SliderDimension {
    constructor(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
}
export class ColorPickerOptions {
    constructor() {
        this.position = 'right';
        this.outputFormat = 'hex';
        this.cancelButton = false;
        this.cancelButtonText = 'Cancel';
        this.fallbackColor = '#ffffff';
        this.dialogHeight = 290;
        this.dialogWidth = 230;
        this.alpha = true;
    }
}
//# sourceMappingURL=color-picker.class.js.map