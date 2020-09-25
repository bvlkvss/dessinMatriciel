import { Component, OnInit } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
// tslint:disable:no-magic-numbers
@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
    hue: string;
    color: string;
    inputColor: string;
    opacity: string;

    lastColors: string[] = new Array<string>();
    constructor(private tools: ToolsManagerService) {
        this.opacity = 'ff';
        this.color = '#000000';
    }
    // tslint:disable-next-line:no-empty
    ngOnInit(): void {
        this.setColor();
    }

    setOpacity(): void {
        const input = document.querySelector('#opacityValue') as HTMLInputElement;
        if (input.valueAsNumber >= 100) input.value = '100';
        else if (input.valueAsNumber <= 0) input.value = '0';
        else if (input.value === '') input.value = '100';
        const integerValue = Math.round((input.valueAsNumber * 255) / 100);
        this.opacity = integerValue.toString(16);
        this.setColor(); // to udpate the 8 digits hex
    }
    setColor(): void {
        this.tools.setColor(this.color + this.opacity);
    }
    setColorFromInput(): void {
        const input = document.querySelector('.text') as HTMLInputElement;
        this.color = '#' + input.value;
        this.tools.setColor('#' + input.value);
    }
    addColor(color: string): void {
        if (!this.lastColors.find((element) => element === color)) {
            if (this.lastColors.length < 10) {
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
