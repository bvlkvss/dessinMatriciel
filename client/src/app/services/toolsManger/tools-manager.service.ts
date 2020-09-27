import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';


const OPACITY_DIVIDER = 100.0;
@Injectable({
    providedIn: 'root',
})
export class ToolsManagerService {
    private tools: Tool[];
    currentTool: Tool;

    constructor(
        pencilService: PencilService,
        brushService: BrushService,
        rectangleService: RectangleService,
        eraserService: EraserService,
        ellipseService: EllipseService,
        lineService: LineService,
    ) {
        this.tools = [pencilService, brushService, rectangleService, eraserService, ellipseService, lineService];
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
    setOpacity(opacity: number): void {
        this.currentTool.opacity = opacity / OPACITY_DIVIDER;
    }
    setLineWidth(lineWidth: number): void {
        this.currentTool.lineWidth = lineWidth;
    }

    setColor(color: string): void {
        this.tools.forEach((element) => {
            element.primaryColor = color;
        });
    }
}
