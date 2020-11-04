import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class PaintBucketCommand extends Command {
    imageData: ImageData;

    constructor(imagedata: ImageData, protected drawingService: DrawingService) {
        super();
        this.imageData = imagedata;
    }
    makeCanvasWhite(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.fillStyle = 'white';
        context.rect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        context.fill();
        context.closePath();
    }
    execute(): void {
        this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
    }
}
