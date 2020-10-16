import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class PencilCommand extends Command {
    private pathData: Vec2[] = [];
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    isResize: boolean = false;

    constructor(pathData: Vec2[], protected tool: PencilService, protected drawingService: DrawingService) {
        super();
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.drawLine(this.drawingService.baseCtx, this.pathData);
    }
}
