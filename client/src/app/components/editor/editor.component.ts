import { Component } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
    constructor(private tools: ToolsManagerService) {

    }
    lastColors: string[] = new Array<string>();
    currentTool: Tool = this.tools.currentTool;


}
