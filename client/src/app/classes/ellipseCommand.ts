import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class EllipseCommand implements Command {
    startPos: Vec2;
    endPos: Vec2;
    style: number;
    primaryColor: string;
    secondaryColor: string;
    opacity: number;
    isResize: boolean = false;

    constructor(startPos: Vec2, endPos: Vec2, style: number, protected tool: EllipseService, protected drawingService: DrawingService) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.style = style;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
    }
    execute(): void {
        this.tool.ellipseStyle = this.style;
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.drawEllipse(this.drawingService.baseCtx, this.startPos, this.endPos, false, false);
    }
    unexecute(): void {
        throw new Error('This methdode is not Implimented');
    }
}
