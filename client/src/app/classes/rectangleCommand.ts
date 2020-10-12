// tslint:disable-next-line:no-relative-imports
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { DrawingService } from '../services/drawing/drawing.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class RectangleCommand implements Command {
    startPos: Vec2;
    endPos: Vec2;
    style: number;
    isResize: boolean = false;

    constructor(startPos: Vec2, endPos: Vec2, style: number, protected tool: RectangleService, protected drawingService: DrawingService) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.style = style;
    }
    execute(): void {
        this.tool.rectangleStyle = this.style;
        this.tool.drawRectangle(this.drawingService.baseCtx, this.startPos, this.endPos, false);
    }
    unexecute(): void { }
}
