import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class PencilCommand extends Command {
    private pathData: Vec2[];
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private lineWidht: number;
    isResize: boolean;

    constructor(pathData: Vec2[], protected tool: PencilService, protected drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.lineWidht = this.tool.lineWidth;
        this.pathData = [];
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.lineWidth = this.lineWidht;
        this.tool.drawLine(this.drawingService.baseCtx, this.pathData);
    }
}
