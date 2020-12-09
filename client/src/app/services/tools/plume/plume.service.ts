import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { PlumeCommand } from '@app/classes/plume-command';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlumeService extends Tool {
    pathData: Vec2[];
    lastpoint: Vec2;
    angle: number = Const.DEFAULT_ANGLE;
    lineLenght: number = Const.LONGEUR_LIGNE;
    mouseIsOut: boolean = false;
    halfLength: number;
    arrayTooLarge: boolean = false;
    subject: BehaviorSubject<string> = new BehaviorSubject<string>('0');
    private plumeCommand: PlumeCommand;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);

        this.toolAttributes = ['lineLenght', 'angle'];
        this.lineWidth = Const.DEFAULT_WIDTH;
        this.clearPath();
    }

    sendMessage(message: number): void {
        this.subject.next(String(message));
    }

    /* tslint:disable:no-any*/
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.plumeCommand = new PlumeCommand(this, this.drawingService);
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.plumeCommand.pushData(this.mouseDownCoord);
        }
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) this.drawLine(this.drawingService.baseCtx, this.pathData);
        this.clearPath();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseIsOut = true;
    }

    onMouseEnter(event: MouseEvent): void {
        this.clearPath();
        this.mouseIsOut = false;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && !this.mouseIsOut) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (this.plumeCommand) {
                this.invoker.addToUndo(this.plumeCommand);
                this.invoker.setIsAllowed(true);
            }
        }
        this.mouseDown = false;
        this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.pathData.push(mousePosition);
        this.halfLength = Math.ceil(this.pathData.length / 2);
        this.arrayTooLarge = this.pathData.length > Const.TAILLE_MAX_DATA_PATH;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown && this.plumeCommand) this.plumeCommand.pushData(mousePosition);
        if (!this.arrayTooLarge) {
            if (!this.mouseDown) {
                this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);
            } else {
                this.drawLine(this.drawingService.previewCtx, this.pathData);
            }
        } else {
            if (!this.mouseDown) {
                this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);
            } else {
                this.drawLine(this.drawingService.baseCtx, this.pathData);
            }
            this.allocateSpace();
        }
    }

    allocateSpace(): void {
        this.pathData.splice(0, this.halfLength);
        this.arrayTooLarge = false;
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setLineLength(lenght: number): void {
        this.lineLenght = lenght;
    }

    setAngle(degrees: number): void {
        this.angle = degrees * (Const.PI / Const.PI_ANGLE);
        this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);
    }

    adjustAngle(event: WheelEvent): void {
        if (Math.sign(event.deltaY) === Const.POS_NUMBER) {
            if (!event.altKey) {
                this.angle = this.angle + Const.MULTIPLE_STEP;
            } else {
                this.angle = this.angle + Const.SINGLE_STEP;
            }
        } else {
            if (!event.altKey) {
                this.angle = this.angle - Const.MULTIPLE_STEP;
            } else {
                this.angle = this.angle - Const.SINGLE_STEP;
            }
        }
        this.validateAngle(this.angle);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);
    }

    validateAngle(angleToValidate: number): void {
        let degree = (angleToValidate * Const.PI_ANGLE) / Const.PI;
        degree = Math.round(degree);
        if (degree < 0) {
            degree = Const.FULL_CIRCLE;
            this.angle = 2 * Const.PI;
        } else if (degree >= Const.FULL_CIRCLE) {
            this.angle = degree = 0;
        }
        this.sendMessage(degree);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = Const.DEFAULT_WIDTH;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.primaryColor;
        ctx.beginPath();
        this.lastpoint = { x: path[0].x, y: path[0].y };
        for (const point of path) {
            for (let i = 0; i < this.lineLenght; i++) {
                ctx.moveTo(this.lastpoint.x + i * Math.cos(this.angle), this.lastpoint.y - i * Math.sin(this.angle));
                ctx.lineTo(point.x + i * Math.cos(this.angle), point.y - i * Math.sin(this.angle));
            }
            this.lastpoint = { x: point.x, y: point.y };
        }
        ctx.stroke();
    }

    drawPreviewLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = Const.DEFAULT_WIDTH;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.primaryColor;
        ctx.beginPath();

        const point = path[path.length - 1];
        if (!this.mouseIsOut) {
            if (point) {
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.x + this.lineLenght * Math.cos(this.angle), point.y - this.lineLenght * Math.sin(this.angle));
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                ctx.stroke();
            }
        }
    }

    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
