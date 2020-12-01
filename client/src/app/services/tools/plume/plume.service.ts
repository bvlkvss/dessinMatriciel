import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BehaviorSubject, Observable } from 'rxjs';

const DEFAULT_WIDTH = 2;
const DEFAULT_ANGLE = 0;
const LONGEUR_LIGNE = 50;
const TAILLE_MAX_DATA_PATH = 2;
const SINGLE_STEP = 0.0174533; // 1° en radians
const MULTIPLE_STEP = 0.261799; // 15° en radians
const PI = Math.PI;
const POS_NUMBER = 1;
const HALF_2PI = 180;
const FULL_CIRCLE = 360;
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
export class PlumeService extends Tool {
    private pathData: Vec2[];
    lastpoint: Vec2;
    angle: number = DEFAULT_ANGLE;
    lineLenght: number = LONGEUR_LIGNE;
    mouseIsOut: boolean = false;
    halfLength: number;
    arrayTooLarge: boolean = false;
    subject: BehaviorSubject<string> = new BehaviorSubject<string>('0');

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);

        this.toolAttributes = ['lineLenght', 'angle'];
        this.lineWidth = DEFAULT_WIDTH;
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
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
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
            this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);

            // const cmd = new PencilCommand(this.pathData, this, this.drawingService) as PencilCommand;
            // this.invoker.addToUndo(cmd);
            // this.invoker.setIsAllowed(true);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.pathData.push(mousePosition);
        this.halfLength = Math.ceil(this.pathData.length / 2);
        this.arrayTooLarge = this.pathData.length > TAILLE_MAX_DATA_PATH;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (!this.arrayTooLarge) {
            // Reduire la taille du tableau pour que literation se fasse plus rapidement (Fix probleme de latence)
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
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
        this.angle = degrees * (PI / HALF_2PI);
    }

    adjustAngle(event: WheelEvent): void {
        if (Math.sign(event.deltaY) === POS_NUMBER) {
            if (!event.altKey) {
                this.angle = this.angle + MULTIPLE_STEP;
            } else {
                this.angle = this.angle + SINGLE_STEP;
            }
        } else {
            if (!event.altKey) {
                this.angle = this.angle - MULTIPLE_STEP;
            } else {
                this.angle = this.angle - SINGLE_STEP;
            }
        }

        this.validateAngle(this.angle);

        this.drawPreviewLine(this.drawingService.previewCtx, this.pathData);
    }

    validateAngle(angleToValidate: number): void {
        let degree = (angleToValidate * HALF_2PI) / PI;
        degree = Math.round(degree);
        if (degree < 0) {
            degree = FULL_CIRCLE;
            this.angle = 2 * PI;
        } else if (degree >= FULL_CIRCLE) {
            this.angle = degree = 0;
        }
        this.sendMessage(degree);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = DEFAULT_WIDTH;
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
        ctx.lineWidth = DEFAULT_WIDTH;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.primaryColor;
        ctx.beginPath();

        const point = path[path.length - 1];
        if (!this.mouseIsOut) {
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x + this.lineLenght * Math.cos(this.angle), point.y - this.lineLenght * Math.sin(this.angle));
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.stroke();
        }
    }

    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
