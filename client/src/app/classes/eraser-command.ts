import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class EraserCommand extends Command {
    private pathData: Vec2[] = [];
    private lineWidht: number;
    isResize: boolean = false;

    constructor(pathData: Vec2[], protected tool: EraserService, protected drawingService: DrawingService) {
        super();
        this.lineWidht = this.tool.lineWidth;
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }
    execute(): void {
        this.tool.lineWidth = this.lineWidht;
        this.tool.clearLine(this.drawingService.baseCtx, this.pathData);
    }
}