import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { Command } from './command';
import { Vec2 } from './vec2';
export class StampCommand extends Command {
    private position: Vec2;
    private stampImage: HTMLImageElement;
    private degres: number;

    isResize: boolean;

    constructor(centerPos: Vec2, private tool: StampService, private drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.position = centerPos;
        this.degres = this.tool.degres;
        this.stampImage = new Image();
        this.stampImage.src = this.tool.image.src;
        this.stampImage.width = this.tool.image.width;
        this.stampImage.height = this.tool.image.height;
    }
    execute(): void {
        const tmp = this.tool.degres;
        this.tool.degres = this.degres;
        this.tool.image.src = this.stampImage.src;
        this.tool.image.width = this.stampImage.width;
        this.tool.image.height = this.stampImage.height;
        this.tool.rotateStamp(this.drawingService.baseCtx, this.position);
        this.tool.degres = tmp;
        this.tool.rotateStamp(this.drawingService.previewCtx, this.tool.center);
    }
}
