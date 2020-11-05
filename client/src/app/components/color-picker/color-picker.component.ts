/****************************************************************************************
 * this code was inspired from :
 *
 *    Title: color-picker Component with Angular
 *    Author: Lukas Marx
 *    Date: 2018
 *    Availability: https://malcoded.com/posts/angular-color-picker/
 *
 ***************************************************************************************/

import { AfterViewInit, Component, Input } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

const DEFAULT_OPACITY = 100;
const DEFAULT_COLOR = '#000000';
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
    opacity: number;
    private isPrime: boolean;
    @Input() lastColors: string[];

    constructor(private tools: ToolsManagerService) {
        this.opacity = DEFAULT_OPACITY;
        this.color = DEFAULT_COLOR;
    }

    /*tslint:disable-next-line:no-empty*/
    ngAfterViewInit(): void {}

    setColor(): void {
        const stringValue: string = Math.round((this.opacity * MAX_COLOR_VALUE) / PERCENTAGE_DIVIDER).toString(16);
        this.tools.setColor(this.color + stringValue, this.isPrimaryColor);
    }
    setColorOnClick(event: MouseEvent, color: string): void {
        this.color = color;
        if (event.button === 0) {
            this.isPrime = true;
        } else if (event.button === 2) {
            this.isPrime = false;
        }
        const stringValue: string = Math.round((this.opacity * MAX_COLOR_VALUE) / PERCENTAGE_DIVIDER).toString(16);
        this.tools.setColor(this.color + stringValue, this.isPrime);
    }

    setOpacity(inputValue: number): void {
        this.opacity = inputValue;
        if (inputValue >= PERCENTAGE_DIVIDER) this.opacity = DEFAULT_OPACITY;
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
    closePalette(): void {
        document.getElementById('closeButton');
    }
}
