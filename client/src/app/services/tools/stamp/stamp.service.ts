import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { Rotationable } from '@app/classes/rotationable';
import { StampCommand } from '@app/classes/stamp-command';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool implements Rotationable {
    image: HTMLImageElement;
    degres: number;
    stampObs: Subject<boolean>;
    center: Vec2;
    constructor(drawingService: DrawingService, private invoker: UndoRedoService) {
        super(drawingService);
        this.stampObs = new Subject<boolean>();
        this.degres = 0;
        this.toolAttributes = ['stamp'];
        this.image = new Image();
        this.image.src = '../../../assets/Stamps/face0.png';
        this.image.height = this.image.width = this.lineWidth = Const.DEFAULT_IMAGE_SIZE;
    }
    getRotatedGeniric: (point: Vec2, centre: Vec2, angle: number) => Vec2 = Rotationable.prototype.getRotatedGeniric;
    getUnrotatedPos: (element: Vec2) => Vec2 = Rotationable.prototype.getUnrotatedPos;
    getRotatedPos: (element: Vec2) => Vec2 = Rotationable.prototype.getRotatedPos;
    updateDegree: (event: WheelEvent) => void = Rotationable.prototype.updateDegree;
    onClick(event: MouseEvent): void {
        console.log('click');
        const centerPos = this.getPositionFromMouse(event);
        this.rotateStamp(this.drawingService.baseCtx, centerPos);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.center = this.getPositionFromMouse(event);
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.center = this.getPositionFromMouse(event);
            const centerPos = this.getPositionFromMouse(event);
            const cmd = new StampCommand(centerPos, this, this.drawingService);
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
        }
        this.mouseDown = false;
    }

    getStampObs(): Subject<boolean> {
        return this.stampObs;
    }
    rotateStamp(ctx: CanvasRenderingContext2D, centerPosition: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.save();
        ctx.translate(centerPosition.x, centerPosition.y);
        ctx.rotate((this.degres * Math.PI) / (Const.FULL_CIRCLE / 2));
        ctx.drawImage(this.image, -this.image.width / 2, -this.image.width / 2, this.image.width, this.image.height);
        ctx.restore();
    }
    onMouseMove(event: MouseEvent): void {
        const centerPos = this.getPositionFromMouse(event);
        this.center = this.getPositionFromMouse(event);
        this.rotateStamp(this.drawingService.previewCtx, centerPos);
    }

    setDegree(degree: number): void {
        this.degres = degree;
    }
    setStampSize(leftValue: number, rightValue: number): void {
        leftValue = leftValue > Const.MAX_STAMP_FACTOR ? Const.MAX_STAMP_FACTOR : leftValue;
        rightValue = rightValue > Const.MAX_STAMP_FACTOR ? Const.MAX_STAMP_FACTOR : rightValue;
        this.image.height = this.image.width = (this.lineWidth * leftValue) / rightValue;
    }
}
