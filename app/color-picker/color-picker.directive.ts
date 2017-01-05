import { Component, ComponentFactoryResolver, Directive, Input, Output, ViewContainerRef, ElementRef, EventEmitter, OnInit, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ColorPickerService } from './color-picker.service'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { Rgba, Hsla, Hsva, SliderPosition, SliderDimension, ColorPickerOptions } from './color-picker.class'
import { Compiler, ReflectiveInjector } from '@angular/core';

@Directive({
    selector: '[colorPicker]',
    host: {
        '(input)': 'changeInput($event.target.value)',
        '(click)': 'onClick()'
    }
})
export class ColorPickerDirective implements OnInit {
    @Input('colorPicker') colorPicker: string
    @Output('colorPickerChange') colorPickerChange = new EventEmitter<string>()
    cpOptions: ColorPickerOptions = new ColorPickerOptions
    @Input('options') set options(val: Object) {
        this.cpOptions = new ColorPickerOptions()
        for (let key in this.cpOptions)
            if (key in val)
                this.cpOptions[key] = val[key]
    }

    private dialog: any
    private created: boolean

    constructor(private compiler: Compiler, private vcRef: ViewContainerRef, private el: ElementRef, private service: ColorPickerService) {
        this.created = false
    }

    ngOnInit() {
        var hsva = this.service.stringToHsva(this.colorPicker)
        if (!hsva)
            hsva = this.service.stringToHsva(this.cpOptions.fallbackColor)

        this.colorPickerChange.emit(this.service.outputFormat(hsva, this.cpOptions.outputFormat))
    }

    onClick() {
        if (!this.created) {
            this.created = true

            this.compiler.compileModuleAndAllComponentsAsync(DynamicCpModule)
                .then(factory => {
                    const compFactory = factory.componentFactories.find(x => x.componentType === DialogComponent);
                    const injector = ReflectiveInjector.fromResolvedProviders([], this.vcRef.parentInjector);
                    const cmpRef = this.vcRef.createComponent(compFactory, 0, injector, []);
                    cmpRef.instance.setDialog(this, this.el, this.colorPicker, this.cpOptions);
                    this.dialog = cmpRef.instance;
                });

        } else if (this.dialog) {
            this.dialog.setInitialColor(this.colorPicker)
            this.dialog.openColorPicker()
        }
    }

    colorChanged(value: string) {
        this.colorPickerChange.emit(value)
    }

    changeInput(value: string) {
        this.dialog.setColorFromString(value)
        this.colorPickerChange.emit(value)
    }
}


@Directive({
    selector: '[text]',
    host: {
        '(input)': 'changeInput($event.target.value)'
    }
})
export class TextDirective {
    @Output('newValue') newValue = new EventEmitter<any>()
    @Input('text') text: any
    @Input('rg') rg: number

    changeInput(value: string) {
        if (this.rg == undefined)
            this.newValue.emit(value)
        else {
            let numeric = parseFloat(value)
            if (!isNaN(numeric) && numeric >= 0 && numeric <= this.rg)
                this.newValue.emit({ v: numeric, rg: this.rg })
        }
    }
}

@Directive({
    selector: '[slider]',
    host: {
        '(mousedown)': 'start($event)',
        '(touchstart)': 'start($event)'
    }
})
export class SliderDirective {
    @Output('newValue') newValue = new EventEmitter<any>()
    @Input('slider') slider: string
    @Input('rgX') rgX: number
    @Input('rgY') rgY: number
    private listenerMove: any
    private listenerStop: any

    constructor(private el: ElementRef) {
        this.listenerMove = (event: any) => { this.move(event) }
        this.listenerStop = () => { this.stop() }
    }

    setCursor(event: any) {
        let height = this.el.nativeElement.offsetHeight
        let width = this.el.nativeElement.offsetWidth
        let x = Math.max(0, Math.min(this.getX(event), width))
        let y = Math.max(0, Math.min(this.getY(event), height))

        if (this.rgX != undefined && this.rgY != undefined)
            this.newValue.emit({ s: x / width, v: (1 - y / height), rgX: this.rgX, rgY: this.rgY })
        else if (this.rgX == undefined && this.rgY != undefined)
            this.newValue.emit({ v: y / height, rg: this.rgY })
        else
            this.newValue.emit({ v: x / width, rg: this.rgX })

    }

    move(event: any) {
        event.preventDefault()
        this.setCursor(event)
    }

    start(event: any) {
        this.setCursor(event)
        document.addEventListener('mousemove', this.listenerMove)
        document.addEventListener('touchmove', this.listenerMove)
        document.addEventListener('mouseup', this.listenerStop)
        document.addEventListener('touchend', this.listenerStop)
    }

    stop() {
        document.removeEventListener('mousemove', this.listenerMove)
        document.removeEventListener('touchmove', this.listenerMove)
        document.removeEventListener('mouseup', this.listenerStop)
        document.removeEventListener('touchend', this.listenerStop)
    }

    getX(event: any): number {
        return (event.pageX != undefined ? event.pageX : event.touches[0].pageX) - this.el.nativeElement.getBoundingClientRect().left - window.pageXOffset
    }
    getY(event: any): number {
        return (event.pageY != undefined ? event.pageY : event.touches[0].pageY) - this.el.nativeElement.getBoundingClientRect().top - window.pageYOffset
    }
}

@Component({
    moduleId: module.id,
    selector: 'color-picker',
    templateUrl: 'color-picker.html',
    styleUrls: ['color-picker.css'],
})
export class DialogComponent implements OnInit {
    private hsva: Hsva
    private rgbaText: Rgba
    private hslaText: Hsla
    private hexText: string
    private outputColor: string
    private alphaSliderColor: SafeStyle
    private hueSliderColor: string
    private slider: SliderPosition
    private sliderDimMax: SliderDimension
    private format: number
    show: boolean
    private top: number
    private left: number
    private position: string
    private directiveInstance: any
    private initialColor: string
    private directiveElementRef: ElementRef

    private listenerMouseDown: any
    private listenerResize: any

    private cpOptions: ColorPickerOptions

    private dialogArrowSize: number = 12
    private dialogArrowOffset: number = 18
    private arrowTop: number
    private actualPosition: string

    constructor(private el: ElementRef, private service: ColorPickerService, private sanitizer: DomSanitizer) { }

    setDialog(instance: any, elementRef: ElementRef, color: any, cpOptions: ColorPickerOptions) {
        this.directiveInstance = instance
        this.initialColor = color
        this.directiveElementRef = elementRef
        this.cpOptions = cpOptions
    }

    setInitialColor(color: any) {
        this.initialColor = color
    }

    ngOnInit() {
        let hsva = this.service.stringToHsva(this.initialColor)
        if (hsva)
            this.hsva = hsva
        else
            this.hsva = new Hsva(0, 1, 1, 1)

        if (!this.cpOptions.alpha)
            this.hsva.a = 1

        this.sliderDimMax = new SliderDimension(150, 230, 130, 150)
        this.slider = new SliderPosition('0%', '0%', '0%', '0%')

        switch (this.cpOptions.outputFormat) {
            case 'rgba':
                this.format = 1
                break

            case 'hsla':
                this.format = 2
                break

            default:
                this.format = 0
                break
        }

        this.listenerMouseDown = (event: any) => this.onMouseDown(event)
        this.listenerResize = () => this.onResize()
        this.update()
        this.openColorPicker()
    }

    openColorPicker() {
        if (!this.show) {
            this.show = true
            this.setDialogPosition()
            document.addEventListener('mousedown', this.listenerMouseDown)
            window.addEventListener('resize', this.listenerResize)
        }
    }

    onMouseDown(event: any) {
        if (!this.isDescendant(this.el.nativeElement, event.target)
            && event.target != this.directiveElementRef.nativeElement) {
            this.closeColorPicker()
        }
    }

    closeColorPicker() {
        this.show = false
        document.removeEventListener('mousedown', this.listenerMouseDown)
        window.removeEventListener('resize', this.listenerResize)
    }

    onResize() {
        this.setDialogPosition()
    }

    setDialogPosition() {
        var node = this.directiveElementRef.nativeElement, position = 'static'
        let parentNode = null
        while (node && node.tagName != 'HTML') {
            position = window.getComputedStyle(node).getPropertyValue("position")
            if (position != 'static' && !parentNode)
                parentNode = node

            if (position == 'fixed')
                break

            node = node.parentNode
        }
        var boxDirective = this.createBox(this.directiveElementRef.nativeElement, position != 'fixed')
        if (position != 'fixed') {
            if (!parentNode)
                parentNode = node
            let boxParent = this.createBox(parentNode, true)
            this.top = boxDirective.top - boxParent.top
            this.left = boxDirective.left - boxParent.left
        } else {
            this.top = boxDirective.top
            this.left = boxDirective.left
            this.position = 'fixed'
        }

        let rect = this.el.nativeElement.getBoundingClientRect()
        let top = rect.top
        let left = rect.left
        let bottom = top + this.cpOptions.dialogHeight
        let right = left + this.cpOptions.dialogWidth

        this.actualPosition = this.cpOptions.position
        if (this.actualPosition != 'top' && this.actualPosition != 'bottom') {
            if (right + boxDirective.width + this.dialogArrowOffset + 20 > window.innerWidth)
                this.actualPosition = 'left'

            if (left - this.cpOptions.dialogWidth - this.dialogArrowOffset - 20 < 0)
                this.actualPosition = 'right'

            if (right + boxDirective.width + this.dialogArrowOffset + 20 > window.innerWidth || left - this.cpOptions.dialogWidth - this.dialogArrowOffset - 20 < 0)
                this.actualPosition = 'top'
        }

        if (this.actualPosition == 'top' && top - this.cpOptions.dialogHeight - this.dialogArrowSize - 20 < 0)
            this.actualPosition = 'bottom'

        switch (this.actualPosition) {
            case 'top':
                this.top -= this.cpOptions.dialogHeight + this.dialogArrowOffset
                this.arrowTop = this.cpOptions.dialogHeight
                break

            case 'bottom':
                this.top += boxDirective.height + this.dialogArrowOffset
                this.arrowTop = -2 * this.dialogArrowSize
                break

            case 'left':
                this.top -= this.dialogArrowOffset
                bottom -= this.dialogArrowOffset
                this.left -= this.cpOptions.dialogWidth + this.dialogArrowOffset
                this.arrowTop = this.dialogArrowSize + boxDirective.height / 2
                if (bottom + 20 > window.innerHeight) {
                    let diff = bottom + 20 - window.innerHeight
                    this.top -= diff
                    this.arrowTop += diff
                }
                break

            default:
                this.top -= this.dialogArrowOffset
                bottom -= this.dialogArrowOffset
                this.left += boxDirective.width + this.dialogArrowOffset
                this.arrowTop = this.dialogArrowSize + boxDirective.height / 2
                if (bottom + 20 > window.innerHeight) {
                    let diff = bottom + 20 - window.innerHeight
                    this.top -= diff
                    this.arrowTop += diff
                }
                break
        }
    }

    setSaturation(val: { v: number, rg: number }) {
        let hsla = this.service.hsva2hsla(this.hsva)
        hsla.s = val.v / val.rg
        this.hsva = this.service.hsla2hsva(hsla)
        this.update()
    }

    setLightness(val: { v: number, rg: number }) {
        let hsla = this.service.hsva2hsla(this.hsva)
        hsla.l = val.v / val.rg
        this.hsva = this.service.hsla2hsva(hsla)
        this.update()
    }

    setHue(val: { v: number, rg: number }) {
        this.hsva.h = val.v / val.rg
        this.update()
    }

    setAlpha(val: { v: number, rg: number }) {
        this.hsva.a = this.cpOptions.alpha ? val.v / val.rg : 1
        this.update()
    }

    setR(val: { v: number, rg: number }) {
        let rgba = this.service.hsvaToRgba(this.hsva)
        rgba.r = val.v / val.rg
        this.hsva = this.service.rgbaToHsva(rgba)
        this.update()
    }
    setG(val: { v: number, rg: number }) {
        let rgba = this.service.hsvaToRgba(this.hsva)
        rgba.g = val.v / val.rg
        this.hsva = this.service.rgbaToHsva(rgba)
        this.update()
    }
    setB(val: { v: number, rg: number }) {
        let rgba = this.service.hsvaToRgba(this.hsva)
        rgba.b = val.v / val.rg
        this.hsva = this.service.rgbaToHsva(rgba)
        this.update()
    }

    setSaturationAndBrightness(val: { s: number, v: number, rgX: number, rgY: number }) {
        this.hsva.s = val.s / val.rgX
        this.hsva.v = val.v / val.rgY
        this.update()
    }

    setColorFromString(value: string) {
        let hsva = this.service.stringToHsva(value)
        if (hsva)
            this.hsva = hsva

        this.update()
    }

    formatPolicy(): number {
        this.format = (this.format + 1) % 3
        if (this.format == 0 && this.hsva.a < 1)
            this.format++

        return this.format
    }

    update() {
        let hsla = this.service.hsva2hsla(this.hsva)
        let rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva))
        let hueRgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(new Hsva(this.hsva.h, 1, 1, 1)))

        this.hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100), Math.round(hsla.a * 100) / 100)
        this.rgbaText = new Rgba(rgba.r, rgba.g, rgba.b, Math.round(rgba.a * 100) / 100)
        this.hexText = this.service.hexText(rgba)

        this.alphaSliderColor = this.sanitizer.bypassSecurityTrustStyle('linear-gradient(to right, rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ', 0) 0%, rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ', 1) 100%)')
        this.hueSliderColor = 'rgb(' + hueRgba.r + ',' + hueRgba.g + ',' + hueRgba.b + ')'

        if (this.format == 0 && this.hsva.a < 1)
            this.format++

        this.outputColor = this.service.outputFormat(this.hsva, this.cpOptions.outputFormat)

        this.slider = new SliderPosition(this.hsva.h * 100 + '%', this.hsva.s * 100 + '%', (1 - this.hsva.v) * 100 + '%', this.hsva.a * 100 + '%')

        this.directiveInstance.colorChanged(this.outputColor)
    }

    cancelColor() {
        this.setColorFromString(this.initialColor)
        this.closeColorPicker()
    }

    isDescendant(parent, child): boolean {
        var node = child.parentNode
        while (node) {
            if (node == parent)
                return true

            node = node.parentNode
        }
        return false
    }

    createBox(element, offset) {
        return {
            top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
            left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
            width: element.offsetWidth,
            height: element.offsetHeight
        }
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [DialogComponent, TextDirective, SliderDirective]
})
class DynamicCpModule { };