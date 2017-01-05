import { NgModule } from '@angular/core';
import { ColorPickerService } from './color-picker.service';
import { ColorPickerDirective, TextDirective, SliderDirective, DialogComponent } from './color-picker.directive';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
export class ColorPickerModule {
}
ColorPickerModule.decorators = [
    { type: NgModule, args: [{
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
                ]
            },] },
];
/** @nocollapse */
ColorPickerModule.ctorParameters = () => [];
//# sourceMappingURL=color-picker.module.js.map