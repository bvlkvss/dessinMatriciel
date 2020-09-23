import { Component, OnInit } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
    hue: string;
    color: string;
    constructor(private tools: ToolsManagerService) {
        this.color = "rgba(0,0,0,1)";
    }



    ngOnInit(): void {
    }

    setOpacity(): void {
        let input = document.querySelector("#opacityValue") as HTMLInputElement;
        console.log(input);
        if (input.valueAsNumber >= 100)
            input.value = "100";
        else if (input.valueAsNumber <= 0)
            input.value = "0";
        else if (input.value === "")
            input.value = "100";

        this.tools.setOpacity(input.valueAsNumber);

    }
    setColor(): void {

        this.tools.setColor(this.color);
    }


}
