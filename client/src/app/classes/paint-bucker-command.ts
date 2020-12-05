import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';

export class PaintBucketCommand extends Command {
    imageData: ImageData;
    isResize: boolean;

    constructor(imagedata: ImageData, protected drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.imageData = imagedata;
    }
    execute(): void {
        this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
    }
}
