import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { LineCommand } from '@app/classes/line-command';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    keyOnEscape: boolean;
    private allignementPoint: Vec2;
    isDoubleClicked: boolean;
    withJunction: boolean;
    pathData: Vec2[];
    toAllign: boolean;
    junctionWidth: number;
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.junctionWidth = 1;
        this.isDoubleClicked = false;
        this.withJunction = true;
        this.keyOnEscape = false;
        this.toAllign = false;
        this.pathData = [];
        this.toolAttributes = ['lineWidth', 'junctionWidth', 'junction'];
        this.lineWidth = 1;
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }

    setJunctionState(isChecked: boolean): void {
        this.withJunction = isChecked;
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    setJunctionWidth(width: number): void {
        this.junctionWidth = width;
    }

    onClick(event: MouseEvent): void {
        this.isDoubleClicked = false;
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown && !this.toAllign) {
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.keyOnEscape = false;
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }
    onDblClick(event: MouseEvent): void {
        const lastPoint: Vec2 = this.pathData[this.pathData.length - 1];
        this.isDoubleClicked = true;
        // tslint:disable:no-magic-numbers

        // check if the distance between the new point and last one is less than 20
        if (!this.toAllign && this.distanceBetween2Points(lastPoint, this.pathData[this.pathData.length - 3]) <= Const.LINE_MIN_DISTANCE) {
            this.pathData.pop();
            this.pathData[this.pathData.length - 2] = lastPoint;
        }
        // check if the distance between allignement point and last one is less than 20 and draw the allignement point
        else if (this.toAllign) {
            this.toAllign = false;
            if (this.distanceBetween2Points(lastPoint, this.allignementPoint) <= Const.LINE_MIN_DISTANCE) {
                this.pathData.pop();
                this.drawLine(this.drawingService.baseCtx, this.pathData[this.pathData.length - 1], this.allignementPoint);
            } else {
                this.drawLine(this.drawingService.baseCtx, this.pathData[this.pathData.length - 2], lastPoint);
                this.drawLine(this.drawingService.baseCtx, this.pathData[this.pathData.length - 1], this.allignementPoint);
            }
        }
        // if distance is more than 20, we need to push back the last point
        else this.pathData.push(lastPoint);

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLines(this.drawingService.baseCtx);
        const cmd = new LineCommand(this.pathData, this.withJunction, this, this.drawingService) as LineCommand;
        this.invoker.addToUndo(cmd);
        this.invoker.setIsAllowed(true);
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLines(this.drawingService.previewCtx);
            if (!this.keyOnEscape) {
                this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.currentPos);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.keyOnEscape = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.mouseDown = false;
            this.drawLines(this.drawingService.baseCtx);
            this.clearPath();
        } else if (event.key === 'Backspace') {
            if (this.pathData.length > 1) this.pathData.pop();
        } else if (event.shiftKey && !this.isDoubleClicked) {
            this.toAllign = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLines(this.drawingService.previewCtx);
            this.allignementPoint = this.findNewPointForAngle(this.pathData[this.pathData.length - 1], this.currentPos);
            this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.allignementPoint);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey && !this.isDoubleClicked) {
            this.toAllign = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLines(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.currentPos);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, startPoint: Vec2, endPoint: Vec2): void {
        if (startPoint && endPoint) {
            ctx.strokeStyle = this.primaryColor;
            ctx.fillStyle = this.secondaryColor;
            ctx.lineWidth = this.lineWidth;
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }
    }

    private drawLines(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.pathData.length - 1; i++) {
            this.drawLine(ctx, this.pathData[i], this.pathData[i + 1]);
            if (this.withJunction) {
                if (i === this.pathData.length - 3 && this.isDoubleClicked) break;
                this.drawJunction(ctx, this.pathData[i + 1]);
            }
        }
    }

    drawJunction(ctx: CanvasRenderingContext2D, centerPoint: Vec2): void {
        ctx.beginPath();
        ctx.arc(centerPoint.x, centerPoint.y, this.junctionWidth, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    private findNewPointForAngle(beginPoint: Vec2, endPoint: Vec2): Vec2 {
        const currentAngle: number = this.angleBetween2Points(beginPoint, endPoint);
        const distance: number = this.distanceBetween2Points(beginPoint, endPoint);
        const closestAngle: number =
            (Math.round(currentAngle / (Const.ALLIGNEMENT_ANGLE / Const.PI_ANGLE)) * Const.ALLIGNEMENT_ANGLE) / Const.PI_ANGLE;
        const xDistance: number = distance * Math.cos(closestAngle);
        const yDistance: number = distance * Math.sin(closestAngle);
        return { x: beginPoint.x + xDistance, y: beginPoint.y - yDistance };
    }

    private angleBetween2Points(lastPoint: Vec2, currentPoint: Vec2): number {
        const adjacent = this.distanceBetween2Points(lastPoint, { x: currentPoint.x, y: lastPoint.y });
        const hypothenus = this.distanceBetween2Points(lastPoint, currentPoint);

        let angle = Math.acos(adjacent / hypothenus);

        // convert the angle value to always be positive depending on the cirle quadrant it is on
        if (lastPoint.x < currentPoint.x) {
            // first circle quadrant --nothing to add--

            // fourth circle quadrant
            if (lastPoint.y < currentPoint.y) {
                angle = 2 * Math.PI - angle;
            }
        } else {
            // second circle quadrant
            if (lastPoint.y > currentPoint.y) {
                angle = Math.PI - angle;
            }
            // third cirle quadrant
            else {
                angle = Math.PI + angle;
            }
        }

        return angle;
    }

    private distanceBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
