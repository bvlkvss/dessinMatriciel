import { PencilService } from '..services/tools/pencil/pencil-service';
import { DrawingService } from '../services/drawing/drawing.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class PencilCommand implements Command {
    private pathData: Vec2[] = [];
    isResize: boolean = false;

    constructor(pathData: Vec2[], protected tool: PencilService, protected drawingService: DrawingService) {
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }
    execute(): void {
        this.tool.drawLine(this.drawingService.baseCtx, this.pathData);
    }
    unexecute(): void { }
}
