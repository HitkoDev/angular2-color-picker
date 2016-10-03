import { NgModule } from '@angular/core'
import { ColorPickerService } from './color-picker.service'
import { ColorPickerDirective, TextDirective, SliderDirective, DialogComponent } from './color-picker.directive'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

@NgModule({
    declarations: [
        ColorPickerDirective
    ],
    providers: [
        ColorPickerService
    ],
    exports: [
        ColorPickerDirective
    ]
})
export class ColorPickerModule { }