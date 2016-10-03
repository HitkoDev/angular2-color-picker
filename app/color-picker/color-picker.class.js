"use strict";
var Hsva = (function () {
    function Hsva(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
    return Hsva;
}());
exports.Hsva = Hsva;
var Hsla = (function () {
    function Hsla(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
    return Hsla;
}());
exports.Hsla = Hsla;
var Rgba = (function () {
    function Rgba(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    return Rgba;
}());
exports.Rgba = Rgba;
var SliderPosition = (function () {
    function SliderPosition(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
    return SliderPosition;
}());
exports.SliderPosition = SliderPosition;
var SliderDimension = (function () {
    function SliderDimension(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
    return SliderDimension;
}());
exports.SliderDimension = SliderDimension;
var ColorPickerOptions = (function () {
    function ColorPickerOptions() {
        this.position = 'right';
        this.outputFormat = 'hex';
        this.cancelButton = false;
        this.cancelButtonText = 'Cancel';
        this.fallbackColor = '#ffffff';
        this.dialogHeight = 290;
        this.dialogWidth = 230;
        this.alpha = true;
    }
    return ColorPickerOptions;
}());
exports.ColorPickerOptions = ColorPickerOptions;
//# sourceMappingURL=color-picker.class.js.map