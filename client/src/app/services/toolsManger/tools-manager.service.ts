import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush.service';
import { PencilService } from '@app/services/tools/pencil-service';

@Injectable({
    providedIn: 'root',
})
export class ToolsManagerService {
    private tools: Tool[];
    currentTool: Tool;

    constructor(pencilService: PencilService, brushService: BrushService) {
        this.tools = [pencilService, brushService];
        this.currentTool = this.tools[0];
    }
    setTools(index: number): void {
        this.currentTool = this.tools[index];
    }
    setSize(width: number, height: number): void {
        this.currentTool.height = height;
        this.currentTool.width = width;
    }
    getTools(): Tool[] {
        return this.tools;
    }
    setRGB(r: number, g: number, b: number): void {
        this.currentTool.primaryColor.red = r;
        this.currentTool.primaryColor.green = g;
        this.currentTool.primaryColor.blue = b;
    }
}
