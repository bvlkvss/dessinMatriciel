import { DrawingService } from '@app/services/drawing/drawing.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { Command } from './command';
import { Vec2 } from './vec2';

const MOUSE_POSITION_OFFSET_DIVIDER = 10;
const IMAGES_PER_POINT = 5;
const MAX_EIGHT_BIT_NB = 255;

export class BrushCommand implements Command {
    private pathData: Vec2[] = [];
    primaryColor: string;
    secondaryColor: string;
    opacity: number;
    isResize: boolean = false;

    constructor(pathData: Vec2[], protected tool: BrushService, protected drawingService: DrawingService) {
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }
    // maybe i will add some methode
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        for (let i = 0; i < this.pathData.length; i++) {
            if (i !== this.pathData.length - 1 && i !== 0) {
                this.drawingService.baseCtx.beginPath();
                const dist = this.tool.distanceBetween2Points(this.pathData[i], this.pathData[i + 1]);
                const angle = this.tool.angleBetween2Points(this.pathData[i], this.pathData[i + 1]);
                let k = 0;
                const image = this.tool.makeBaseImage();
                do {
                    const x = this.pathData[i].x + Math.sin(angle) * k - this.tool.image.width / MOUSE_POSITION_OFFSET_DIVIDER;
                    const y = this.pathData[i].y + Math.cos(angle) * k - this.tool.image.height / MOUSE_POSITION_OFFSET_DIVIDER;
                    this.drawingService.baseCtx.globalAlpha = this.tool.color.opacity / MAX_EIGHT_BIT_NB;
                    this.drawingService.baseCtx.drawImage(image, x, y, this.tool.lineWidth, this.tool.lineWidth);
                    k += IMAGES_PER_POINT;
                } while (k < dist);
                this.drawingService.baseCtx.closePath();
            } else {
                this.drawingService.baseCtx.beginPath();
                const dist = this.tool.distanceBetween2Points(this.pathData[i], this.pathData[i]);
                const angle = this.tool.angleBetween2Points(this.pathData[i], this.pathData[i]);
                let k = 0;
                const image = this.tool.makeBaseImage();
                do {
                    const x = this.pathData[i].x + Math.sin(angle) * k - this.tool.image.width / MOUSE_POSITION_OFFSET_DIVIDER;
                    const y = this.pathData[i].y + Math.cos(angle) * k - this.tool.image.height / MOUSE_POSITION_OFFSET_DIVIDER;
                    this.drawingService.baseCtx.globalAlpha = this.tool.color.opacity / MAX_EIGHT_BIT_NB;
                    this.drawingService.baseCtx.drawImage(image, x, y, this.tool.lineWidth, this.tool.lineWidth);
                    k += IMAGES_PER_POINT;
                } while (k < dist);
                this.drawingService.baseCtx.closePath();
            }
        }
    }
    unexecute(): void { }
}
