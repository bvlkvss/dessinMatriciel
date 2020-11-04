import { Injectable } from '@angular/core';
import { EraserCommand } from '@app/classes/eraser-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

const MINIMUM_ERASER_SIZE = 5;
// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toolAttributes = ['eraserWidth'];
        this.lineWidth = MINIMUM_ERASER_SIZE;
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) this.clearLine(this.drawingService.baseCtx, this.pathData);
        this.clearPath();
    }

    onMouseEnter(event: MouseEvent): void {
        this.clearPath();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearLine(this.drawingService.baseCtx, this.pathData);
            const cmd = new EraserCommand(this.pathData, this, this.drawingService) as EraserCommand;
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    setLineWidth(thickness: number): void {
        if (thickness >= MINIMUM_ERASER_SIZE) {
            this.lineWidth = thickness;
        } else {
            this.lineWidth = MINIMUM_ERASER_SIZE;
        }
    }

    clearLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.canvas.style.cursor = 'url("../../../assets/whiteSquare.png"), auto';
        ctx.strokeStyle = 'rgba(255,255,255)';
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
