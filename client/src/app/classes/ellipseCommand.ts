import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
// tslint:disable-next-line:no-relative-imports
import { DrawingService } from '../services/drawing/drawing.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class EllipseCommand implements Command {
    startPos: Vec2;
    endPos: Vec2;
    style: number;
    isResize: boolean = false;

    constructor(startPos: Vec2, endPos: Vec2, style: number, protected tool: EllipseService, protected drawingService: DrawingService) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.style = style;
    }
    execute(): void {
        this.tool.ellipseStyle = this.style;
        this.tool.drawEllipse(this.drawingService.baseCtx, this.startPos, this.endPos, false, false);
    }
    unexecute(): void { }
}
