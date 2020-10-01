import { Component, Input, OnInit } from '@angular/core';
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
    @Input() isPrimaryColor: boolean = true;
    opacity: string;
    lastColors: string[] = new Array<string>();
    constructor(private tools: ToolsManagerService) {
        this.opacity = 'ff';
        this.color = '#000000';

    }
    // tslint:disable-next-line:no-empty
    ngOnInit(): void {
        //this.setColor();
    }
    acceptChanges(): void {
        this.addColor(this.color);
        this.setOpacity();
        this.tools.setColor(this.color + this.opacity, this.isPrimaryColor);
    }
    cancelChanges(): void {
        this.color = this.tools.currentTool.primaryColor.slice(0, 7);
        const input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = ((parseInt(this.opacity, 16) / 255) * 100).toString();

    }
    setOpacity(): void {
        const input = document.querySelector('#opacityValue') as HTMLInputElement;
        if (input.valueAsNumber >= 100) input.value = '100';
        else if (input.valueAsNumber <= 0) input.value = '0';
        else if (input.value === '') input.value = '100';
        const integerValue = Math.round((input.valueAsNumber * 255) / 100);
        this.opacity = integerValue.toString(16);
        // this.setColor(); // to udpate the 8 digits hex
    }

    setColorFromInput(): void {
        const input = document.querySelector('.text') as HTMLInputElement;
        this.color = '#' + input.value;
        //   this.tools.setColor('#' + input.value + this.opacity);
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
