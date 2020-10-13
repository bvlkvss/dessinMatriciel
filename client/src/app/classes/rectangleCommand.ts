import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class RectangleCommand implements Command {
    startPos: Vec2;
    endPos: Vec2;
    style: number;
    primaryColor: string;
    secondaryColor: string;
    opacity: number;
    isResize: boolean = false;

    constructor(startPos: Vec2, endPos: Vec2, style: number, protected tool: RectangleService, protected drawingService: DrawingService) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.style = style;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
    }
    execute(): void {
        this.tool.rectangleStyle = this.style;
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.drawRectangle(this.drawingService.baseCtx, this.startPos, this.endPos, false);
    }
    unexecute(): void {
        throw new Error('This methdode is not Implimented');
    }
}
