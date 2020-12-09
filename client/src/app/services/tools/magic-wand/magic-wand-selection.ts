import { Const } from '@app/classes/constants';
import { Movable } from '@app/classes/movable';
import { PI_DEGREE } from '@app/classes/rotationable';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export class MagicWandSelection extends Movable {
    selectionPixels: number[];
    isActive: boolean;
    constructor(
        drawingService: DrawingService,
        invoker: UndoRedoService,
        canvas: HTMLCanvasElement,
        selectionStartPoint: Vec2,
        selectionEndPoint: Vec2,
        width: number,
        height: number,
        selectionPixels: number[],
        isActive: boolean,
    ) {
        super(drawingService, invoker);
        this.selectionData = canvas;
        this.selectionStartPoint = selectionStartPoint;
        this.selectionEndPoint = selectionEndPoint;
        this.width = width;
        this.height = height;
        this.selectionStyle = 0;
        this.selectionPixels = selectionPixels;
        this.isActive = isActive;
    }

    eraseSelectionOnDelete(): void {
        const ctx = this.selectionData.getContext('2d') as CanvasRenderingContext2D;
        const imData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const tempColor = this.primaryColor;
        this.primaryColor = '#ffffff';
        for (let i = 3; i < imData.data.length; i += Const.RGBA_NUMBER_OF_COMPONENTS) {
            if (imData.data[i] !== 0) {
                this.fillPixel(imData, i - Const.RGB_NUMBER_OF_COMPONENTS);
            }
        }
        this.primaryColor = tempColor;
        ctx.putImageData(imData, 0, 0);
        this.drawSelectionOnBase();
    }

    eraseSelectionFromBase(endPos: Vec2): void {
        const ctx = this.drawingService.baseCtx;
        const imData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const tempColor = this.primaryColor;
        this.primaryColor = '#ffffff';
        for (const pixel of this.selectionPixels) {
            this.fillPixel(imData, pixel);
        }
        this.primaryColor = tempColor;
        ctx.putImageData(imData, 0, 0);
        this.firstSelectionMove = false;
    }

    drawSelectionOnBase(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.translate(this.selectionStartPoint.x + this.width / 2, this.selectionStartPoint.y + this.height / 2);
        this.drawingService.baseCtx.rotate((this.degres * Math.PI) / PI_DEGREE);
        this.drawingService.baseCtx.drawImage(this.selectionData, -this.width / 2, -this.height / 2, Math.abs(this.width), Math.abs(this.height));
        this.drawingService.baseCtx.restore();
        if (this.selectionCommand) {
            this.selectionCommand.setStartPos(this.selectionStartPoint);
            this.selectionCommand.setEndPos(this.selectionEndPoint);
            this.selectionCommand.setSelectionStyle(this.selectionStyle);
            this.selectionCommand.setSize(this.width, this.height);
            this.selectionCommand.setCanvas(this.selectionData);
            this.invoker.addToUndo(this.selectionCommand);
            this.invoker.setIsAllowed(true);
        }
        this.drawingService.baseCtx.restore();
        this.resetSelection();
        this.selectionActivated = false;
    }

    createEnglobingBox(): void {
        this.rectangleService.drawRectangle(
            this.drawingService.previewCtx,
            this.selectionStartPoint,
            this.selectionEndPoint,
            this.rectangleService.toSquare,
        );
    }
}
