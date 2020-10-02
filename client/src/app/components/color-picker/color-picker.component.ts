/****************************************************************************************
 * this code was inspired from :
 *
 *    Title: color-picker Component with Angular
 *    Author: Lukas Marx
 *    Date: 2018
 *    Availability: https://malcoded.com/posts/angular-color-picker/
 *
 ***************************************************************************************/

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ColorPaletteComponent } from '@app/components/color-picker/color-palette/color-palette.component';
import { ColorSliderComponent } from '@app/components/color-picker/color-slider/color-slider.component';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

const DEFAULT_OPACITY = 'ff';
const DEFAULT_COLOR = '#000000';
const COLOR_STRING_LENGTH = 7;
const MAX_COLOR_VALUE = 255;
const PERCENTAGE_DIVIDER = 100;
const MAX_SAVED_COLORS = 10;

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements AfterViewInit {
    hue: string;
    color: string;
    @Input() isPrimaryColor: boolean = true;
    opacity: string;
    @ViewChild('palette') colorPalette: ColorPaletteComponent;
    @ViewChild('slider') colorSlider: ColorSliderComponent;
    private selectedPositionSlider: number;
    private selectedPositionPalette: Vec2;
    private onInput: boolean;
    private isPrime: boolean;
    private onLasts: boolean;
    @Input() lastColors: string[];

    constructor(private tools: ToolsManagerService) {
        this.opacity = DEFAULT_OPACITY;
        this.color = DEFAULT_COLOR;
    }

    ngAfterViewInit(): void {
        this.selectedPositionPalette = this.colorPalette.selectedPosition;
        this.selectedPositionSlider = this.colorSlider.selectedHeight;
    }

    acceptChanges(): void {
        this.addColor(this.color);
        if (this.onInput) {
            this.setOpacity();
            this.tools.setColor(this.color + this.opacity, this.isPrimaryColor);
            this.onInput = false;
        } else if (this.onLasts) {
            this.tools.setColor(this.color + this.opacity, this.isPrime);
            this.onLasts = false;
        } else {
            this.selectedPositionSlider = this.colorSlider.selectedHeight;
            this.selectedPositionPalette = this.colorPalette.selectedPosition;
            this.setOpacity();
            this.tools.setColor(this.color + this.opacity, this.isPrimaryColor);
        }
    }

    setColorOnClick(event: MouseEvent, color: string): void {
        this.color = color;
        this.onLasts = true;
        if (event.button === 0) {
            this.isPrime = true;
        } else if (event.button === 2) {
            this.isPrime = false;
        }
    }

    cancelChanges(): void {
        if (this.isPrimaryColor) this.color = this.tools.currentTool.primaryColor.slice(0, COLOR_STRING_LENGTH);
        else this.color = this.tools.currentTool.secondaryColor.slice(0, COLOR_STRING_LENGTH);
        const input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = ((parseInt(this.opacity, 16) / MAX_COLOR_VALUE) * 100).toString();

        if (this.colorPalette.selectedPosition !== this.selectedPositionPalette) {
            this.colorPalette.selectedPosition = this.selectedPositionPalette;
            this.colorPalette.color.emit(this.color);
            this.colorPalette.draw();
        }
        if (this.colorSlider.selectedHeight !== this.selectedPositionSlider) {
            this.colorSlider.selectedHeight = this.selectedPositionSlider;
            this.colorSlider.color.emit(this.color);
            this.colorSlider.draw();
        }
    }

    setOpacity(): void {
        const input = document.querySelector('#opacityValue') as HTMLInputElement;
        if (input.valueAsNumber >= PERCENTAGE_DIVIDER) input.value = '100';
        else if (input.valueAsNumber <= 0) input.value = '0';
        const integerValue = Math.round((input.valueAsNumber * MAX_COLOR_VALUE) / PERCENTAGE_DIVIDER);
        this.opacity = integerValue.toString(16);
    }

    setColorFromInput(): void {
        const input = document.querySelector('.text') as HTMLInputElement;
        if (input.value > 'ffffff') input.value = 'ffffff';
        else if (input.value < '000000') input.value = '000000';
        this.color = '#' + input.value;
        this.colorSlider.color.emit(this.color);
        this.onInput = true;
    }

    addColor(color: string): void {
        if (!this.lastColors.find((element) => element === color)) {
            if (this.lastColors.length < MAX_SAVED_COLORS) {
                this.lastColors.push(color);
            } else {
                const tmp = this.lastColors;
                tmp.reverse();
                tmp.pop();
                tmp.reverse();
                this.lastColors = tmp;
                this.lastColors.push(color);
            }
        }
    }
}
