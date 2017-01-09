import { NgModule } from '@angular/core'
import { ColorPickerService } from './color-picker.service'
import { ColorPickerDirective, TextDirective, SliderDirective, DialogComponent } from './color-picker.directive'

import { CommonModule } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'

@NgModule({
    imports: [
        BrowserModule,
        CommonModule
    ],
    declarations: [
        ColorPickerDirective,
        SliderDirective,
        DialogComponent,
        TextDirective
    ],
    providers: [
        ColorPickerService
    ],
    exports: [
        ColorPickerDirective
    ],
    entryComponents: [
        DialogComponent
    ]
})
export class ColorPickerModule { }