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
    private tools: Map<string, Tool>;
    currentTool: Tool;

    constructor(
        pencilService: PencilService,
        brushService: BrushService,
        rectangleService: RectangleService,
        eraserService: EraserService,
        ellipseService: EllipseService,
        lineService: LineService,
    ) {
        this.tools = new Map<string, Tool>([
            ["pencil", pencilService],
            ["brush", brushService],
            ["rectangle", rectangleService],
            ["eraser", eraserService],
            ["ellipse", ellipseService],
            ["line", lineService]
        ]);
        this.currentTool = this.tools.get("pencil") as Tool;
    }
    setTools(name: string): void {
        this.currentTool = this.tools.get(name) as Tool;
    }
    setSize(width: number, height: number): void {
        this.currentTool.height = height;
        this.currentTool.width = width;
    }
    getTools(): Map<string, Tool> {
        return this.tools;
    }
    setOpacity(opacity: number): void {
        this.currentTool.opacity = opacity / OPACITY_DIVIDER;
    }
    setLineWidth(lineWidth: number): void {
        this.currentTool.setLineWidth(lineWidth);
    }
    setColor(color: string): void {
        this.tools.forEach((element) => {
            element.setPrimaryColor(color);
        });
    }
    setRectangleStyle(id: number): void {
        let rectangle = this.currentTool as RectangleService;
        rectangle.setStyle(id);

    }

    setEllipseStyle(id: number): void {
        let ellipse = this.currentTool as EllipseService;
        ellipse.setStyle(id);

    }
    setJunctionWidth(id: number): void {
        let line = this.currentTool as LineService;
        line.setJunctionWidth(id);

    }
    setJunctionState(): void {
        let line = this.currentTool as LineService;
        line.setJunctionState();
    }
}
