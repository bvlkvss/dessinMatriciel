import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayPaintService } from '@app/services/tools/spray-paint/spray-paint.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class SprayPaintCommand extends Command {
    private pathData: Vec2[] = [];
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private lineWidht: number;
    private radius: number;
    private dropletRadius: number;
    private period: number;
    private density: number;
    isResize: boolean = false;

    constructor(protected tool: SprayPaintService, protected drawingService: DrawingService) {
        super();
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.lineWidht = this.tool.lineWidth;
        this.radius = this.tool.radius;
        this.dropletRadius = this.tool.dropletRadius;
        this.period = this.tool.period;
        this.density = this.tool.density;
    }

    pushData(position: Vec2): void {
        this.pathData.push(position);
    }

    spray(ctx: CanvasRenderingContext2D, points: Vec2[]): void {
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.dropletRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.fillStyle = ctx.strokeStyle = this.primaryColor;
            ctx.fill();
            ctx.stroke();
        }
    }

    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.lineWidth = this.lineWidht;
        this.tool.radius = this.radius;
        this.tool.period = this.period;
        this.tool.density = this.density;
        this.tool.dropletRadius = this.dropletRadius;
        this.spray(this.drawingService.baseCtx, this.pathData);
    }
}
