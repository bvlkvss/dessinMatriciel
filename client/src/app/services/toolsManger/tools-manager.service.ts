import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsManagerService {
    private tools: Tool[];
    currentTool: Tool;


    constructor(pencilService: PencilService, brushService: BrushService, rectangleService: RectangleService, eraserService: EraserService,ellipseService: EllipseService) {
        this.tools = [pencilService, brushService, rectangleService, eraserService,ellipseService];
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
