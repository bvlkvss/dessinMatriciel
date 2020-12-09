import { Const } from '@app/classes/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Command } from './command';
import { Movable } from './movable';
import { Vec2 } from './vec2';
export class SelectionCommand extends Command {
    private startPosErase: Vec2;
    private endPosErase: Vec2;
    private startPos: Vec2;
    private endPos: Vec2;
    private height: number;
    private width: number;
    private selectionStyle: number;
    private selectionData: HTMLCanvasElement;
    private degres: number;

    isResize: boolean;

    constructor(startPosErase: Vec2, protected tool: Movable, protected drawingService: DrawingService) {
        super();
        this.isResize = false;
        this.startPosErase = startPosErase;
    }
    setDegres(degres: number): void {
        this.degres = degres;
    }
    setStartPos(endPos: Vec2): void {
        this.startPos = endPos;
    }
    setEndPos(endPos: Vec2): void {
        this.endPos = endPos;
    }
    setEndPosErase(endPos: Vec2): void {
        this.endPosErase = endPos;
    }
    setSelectionStyle(style: number): void {
        this.selectionStyle = style;
    }
    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
    setCanvas(data: HTMLCanvasElement): void {
        this.selectionData = data;
    }
    execute(): void {
        const centre = { x: (this.startPos.x + this.endPos.x) / 2, y: (this.startPos.y + this.endPos.y) / 2 };
        this.tool.selectionStartPoint = this.startPosErase;
        this.tool.width = this.width;
        this.tool.height = this.height;
        this.tool.selectionData = this.selectionData;
        this.tool.selectionStyle = this.selectionStyle;
        this.tool.eraseSelectionFromBase(this.endPosErase);
        this.tool.selectionStartPoint = this.startPos;
        this.tool.selectionEndPoint = this.endPos;
        this.tool.degres = this.degres;
        this.drawingService.baseCtx.save();
        if (this.selectionStyle === 1) {
            this.tool.clipImageWithEllipse();
        } else {
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.translate(centre.x, centre.y);
            this.drawingService.baseCtx.rotate((this.degres * Math.PI) / Const.PI_ANGLE);
            this.drawingService.baseCtx.drawImage(this.tool.selectionData, -Math.abs(this.width) / 2, -Math.abs(this.height) / 2);
            this.drawingService.baseCtx.restore();
        }
        this.drawingService.baseCtx.restore();
        this.tool.firstSelectionMove = true;
    }
}
