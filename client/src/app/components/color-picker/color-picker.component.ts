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
    lastColors: string[] = new Array<string>();
    constructor(private tools: ToolsManagerService) {
        this.color = '000000';
    }
    // tslint:disable-next-line:no-empty
    ngOnInit(): void {}

    setOpacity(): void {
        const input = document.querySelector('#opacityValue') as HTMLInputElement;
        console.log(input);
        if (input.valueAsNumber >= 100) input.value = '100';
        else if (input.valueAsNumber <= 0) input.value = '0';
        else if (input.value === '') input.value = '100';

        this.tools.setOpacity(input.valueAsNumber);
    }
    setColor(): void {
        this.tools.setColor(this.color);
    }
    setColorFromInput(): void {
        const input = document.querySelector('.text') as HTMLInputElement;
        this.color = input.value;
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
