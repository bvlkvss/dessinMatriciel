import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { AttributebarComponent } from '@app/components/attributebar/attributebar.component';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    displayValue: string = 'none';
    @ViewChild('attributeBar') bar: AttributebarComponent;
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
