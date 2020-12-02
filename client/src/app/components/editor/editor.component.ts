import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { AttributeBarComponent } from '@app/components/attribute-bar/attributebar.component';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    displayValue: string = 'none';
    @ViewChild('attributeBar') bar: AttributeBarComponent;
    lastColors: string[] = new Array<string>();
    currentTool: Tool = this.tools.currentTool;
    constructor(private tools: ToolsManagerService) {}
    ngAfterViewInit(): void {
        if (this.currentTool instanceof StampService)
            this.currentTool
                .getStampObs()
                .asObservable()
                .subscribe(() => {
                    this.bar.stampIcon.nativeElement.innerHTML = this.bar.showStamps ? 'keyboard_arrow_right' : 'expand_more';
                    this.displayValue = this.bar.showStamps ? 'block' : 'none';
                    this.bar.showStamps = !this.bar.showStamps;
                });
    }
}
