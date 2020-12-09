import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { Command } from './command';
import { Const } from './constants';

export class BrushCommand extends Command {
    private pathData: Vec2[];
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private lineWidht: number;
    isResize: boolean;

    constructor(pathData: Vec2[], protected tool: BrushService, protected drawingService: DrawingService) {
        super();
        this.pathData = [];
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.lineWidht = this.tool.lineWidth;
        this.isResize = false;
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }

    drawLineCommand(startPos: Vec2, endPos: Vec2): void {
        this.drawingService.baseCtx.beginPath();
        const dist = this.tool.distanceBetween2Points(startPos, endPos);
        const angle = this.tool.angleBetween2Points(startPos, endPos);
        let k = 0;
        const image = this.tool.makeBaseImage();
        do {
            const x = startPos.x + Math.sin(angle) * k;
            const y = startPos.y + Math.cos(angle) * k;
            this.drawingService.baseCtx.globalAlpha = this.tool.color.opacity / Const.MAX_EIGHT_BIT_NB;
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.translate(x, y);
            this.drawingService.baseCtx.drawImage(image, 0, 0, -this.tool.lineWidth / 2, -this.tool.lineWidth / 2);
            this.drawingService.baseCtx.restore();
            k += Const.IMAGES_PER_POINT;
        } while (k < dist);
        this.drawingService.baseCtx.closePath();
    }
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.lineWidth = this.lineWidht;
        for (let i = 0; i < this.pathData.length - 1; i++) {
            this.drawLineCommand(this.pathData[i], this.pathData[i + 1]);
        }
    }
}
