import { AfterViewChecked, Component, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { AttributeBarComponent } from '@app/components/attribute-bar/attribute-bar.component';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewChecked {
    displayValue: string = 'none';
    @ViewChild('attributeBar') bar: AttributeBarComponent;
    lastColors: string[] = new Array<string>();
    currentTool: Tool = this.tools.currentTool;
    constructor(private tools: ToolsManagerService) {}
    ngAfterViewChecked(): void {
        if (this.tools.currentTool instanceof StampService) {
            this.tools.currentTool
                .getStampObs()
                .asObservable()
                .subscribe(() => {
                    this.bar.stampIcon.nativeElement.innerHTML = AttributeBarComponent.showStamps ? 'keyboard_arrow_right' : 'expand_more';
                    this.displayValue = AttributeBarComponent.showStamps ? 'block' : 'none';
                });
        }
    }
}
