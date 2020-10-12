import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class LineCommand implements Command {
    private pathData: Vec2[] = [];
    private withJunction: boolean;
    isResize: boolean = false;

    constructor(pathData: Vec2[], withJunction: boolean, protected tool: LineService, protected drawingService: DrawingService) {
        for (const point of pathData) {
            this.pathData.push(point);
        }
        this.withJunction = withJunction;
    }
    execute(): void {
        for (let i = 0; i < this.pathData.length - 1; i++) {
            this.tool.drawLine(this.drawingService.baseCtx, this.pathData[i], this.pathData[i + 1]);
            if (this.withJunction) {
                if (i === this.pathData.length - 3) break;
                this.tool.drawJunction(this.drawingService.baseCtx, this.pathData[i + 1]);
            }
        }
    }
    unexecute(): void {}
}
