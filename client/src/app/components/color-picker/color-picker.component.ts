/****************************************************************************************
 * this code was inspired from :
 *
 *    Title: color-picker Component with Angular
 *    Author: Lukas Marx
 *    Date: 2018
 *    Availability: https://malcoded.com/posts/angular-color-picker/
 *
 ***************************************************************************************/

import { Component, Input } from '@angular/core';
import { Const } from '@app/classes/constants';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent {
    hue: string;
    color: string;
    @Input() isPrimaryColor: boolean;
    opacity: number;
    private isPrime: boolean;
    @Input() lastColors: string[];

    constructor(private tools: ToolsManagerService) {
        this.isPrimaryColor = true;
        this.opacity = Const.DEFAULT_OPACITY;
        this.color = Const.DEFAULT_COLOR;
    }
    setColor(): void {
        const stringValue: string = Math.round((this.opacity * Const.MAX_COLOR_VALUE) / Const.PERCENTAGE_DIVIDER).toString(16);
        this.tools.setColor(this.color + stringValue, this.isPrimaryColor);
    }
    setColorOnClick(event: MouseEvent, color: string): void {
        this.color = color;
        if (event.button === 0) {
            this.isPrime = true;
        } else if (event.button === 2) {
            this.isPrime = false;
        }
        const stringValue: string = Math.round((this.opacity * Const.MAX_COLOR_VALUE) / Const.PERCENTAGE_DIVIDER).toString(16);
        this.tools.setColor(this.color + stringValue, this.isPrime);
    }

    setOpacity(inputValue: number): void {
        this.opacity = inputValue;
        if (inputValue >= Const.PERCENTAGE_DIVIDER) this.opacity = Const.DEFAULT_OPACITY;
        else if (inputValue <= 0) this.opacity = 0;
        this.setColor();
    }

    isHex(str: string): boolean {
        return str.match(/^[a-f0-9]{6}$/i) !== null;
    }

    setColorFromInput(color: string): void {
        let tmpColor: string = color;
        if (!this.isHex(color)) {
            tmpColor = '000000';
        }
        this.color = '#' + tmpColor;
        this.setColor();
    }

    addColor(color: string): void {
        if (!this.lastColors.find((element) => element === color)) {
            if (this.lastColors.length < Const.MAX_SAVED_COLORS) {
                this.lastColors.push(color);
                return;
            }
            const tmp = this.lastColors;
            tmp.reverse();
            tmp.pop();
            tmp.reverse();
            this.lastColors = tmp;
            this.lastColors.push(color);
        }
    }
    closePalette(): void {
        document.getElementById('closeButton');
    }
}
