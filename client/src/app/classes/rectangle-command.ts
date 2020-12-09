import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class RectangleCommand extends Command {
    private startPos: Vec2;
    private endPos: Vec2;
    private style: number;
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private toSquare: boolean;
    isResize: boolean = false;

    constructor(startPos: Vec2, endPos: Vec2, style: number, protected tool: RectangleService, protected drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.startPos = startPos;
        this.endPos = endPos;
        this.style = style;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.toSquare = this.tool.toSquare;
    }
    execute(): void {
        this.tool.rectangleStyle = this.style;
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.drawRectangle(this.drawingService.baseCtx, this.startPos, this.endPos, this.toSquare);
    }
}
