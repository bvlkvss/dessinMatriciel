import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class LineCommand extends Command {
    private pathData: Vec2[];
    private withJunction: boolean;
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    isResize: boolean;

    constructor(pathData: Vec2[], withJunction: boolean, protected tool: LineService, protected drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.pathData = [];
        for (const point of pathData) {
            this.pathData.push(point);
        }
        this.withJunction = withJunction;
    }
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        for (let i = 0; i < this.pathData.length - 1; i++) {
            this.tool.drawLine(this.drawingService.baseCtx, this.pathData[i], this.pathData[i + 1]);
            if (this.withJunction) {
                // tslint:disable-next-line:no-magic-numbers
                if (i === this.pathData.length - 3) break;
                this.tool.drawJunction(this.drawingService.baseCtx, this.pathData[i + 1]);
            }
        }
    }
}
