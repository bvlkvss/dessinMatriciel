import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ColorPaletteComponent } from '@app/components/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';
import { ColorSliderComponent } from '@app/components/color-picker/color-slider/color-slider.component';

@NgModule({
    imports: [CommonModule],
    declarations: [ColorPickerComponent, ColorSliderComponent, ColorPaletteComponent],
    exports: [ColorPickerComponent],
})
export class ColorPickerModule {


}
