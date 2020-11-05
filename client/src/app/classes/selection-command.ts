import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { Command } from './command';
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

    isResize: boolean = false;

    constructor(startPosErase: Vec2, protected tool: SelectionService, protected drawingService: DrawingService) {
        super();
        this.startPosErase = startPosErase;
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
        this.tool.selectionStartPoint = this.startPosErase;
        this.tool.width = this.width;
        this.tool.height = this.height;
        this.tool.selectionData = this.selectionData;
        this.tool.selectionStyle = this.selectionStyle;
        this.tool.eraseSelectionFromBase(this.endPosErase);
        this.tool.selectionStartPoint = this.startPos;
        this.tool.selectionEndPoint = this.endPos;
        this.drawingService.baseCtx.save();
        if (this.selectionStyle === 1) {
            this.tool.clipImageWithEllipse();
        } else {
            this.drawingService.baseCtx.drawImage(this.tool.selectionData, this.startPos.x, this.startPos.y);
        }
        this.drawingService.baseCtx.restore();
        this.tool.firstSelectionMove = true;
    }
}