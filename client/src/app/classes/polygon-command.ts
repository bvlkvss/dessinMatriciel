import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class PolygonCommand extends Command {
    private startPos: Vec2;
    private endPos: Vec2;
    private style: number;
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private numberside: number;
    isResize: boolean;

    constructor(startPos: Vec2, endPos: Vec2, style: number, protected tool: PolygonService, protected drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.startPos = startPos;
        this.endPos = endPos;
        this.style = style;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.numberside = this.tool.numberSides;
    }
    execute(): void {
        this.tool.polygonStyle = this.style;
        this.tool.numberSides = this.numberside;
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.drawPolygon(this.drawingService.baseCtx, this.startPos, this.endPos);
    }
}
