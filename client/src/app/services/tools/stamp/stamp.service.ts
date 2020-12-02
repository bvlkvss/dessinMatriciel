import { Injectable } from '@angular/core';
import { Rotationable } from '@app/classes/rotationable';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subject } from 'rxjs';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const DEFAULT_IMAGE_SIZE = 100;
const MAX_DEGREE_VALUE = 360;
@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool implements Rotationable {
    image: HTMLImageElement;
    degres: number;
    stampObs: Subject<boolean>;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.stampObs = new Subject<boolean>();
        this.degres = 0;
        this.toolAttributes = ['stamp'];
        this.image = new Image();
        this.image.src = '../../../assets/Stamps/animal0.png';
        this.image.height = this.image.width = this.lineWidth = DEFAULT_IMAGE_SIZE;
    }
    getRotatedGeniric: (point: Vec2, centre: Vec2, angle: number) => Vec2 = Rotationable.prototype.getRotatedGeniric;
    getUnrotatedPos: (element: Vec2) => Vec2 = Rotationable.prototype.getUnrotatedPos;
    getRotatedPos: (element: Vec2) => Vec2 = Rotationable.prototype.getRotatedPos;
    updateDegree: (event: WheelEvent) => void = Rotationable.prototype.updateDegree;
    onClick(event: MouseEvent): void {
        const centerPos = this.getPositionFromMouse(event);
        this.rotateStamp(this.drawingService.baseCtx, centerPos);
    }

    getStampObs(): Subject<boolean> {
        return this.stampObs;
    }
    rotateStamp(ctx: CanvasRenderingContext2D, centerPosition: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.save();
        ctx.translate(centerPosition.x, centerPosition.y);
        ctx.rotate((this.degres * Math.PI) / (MAX_DEGREE_VALUE / 2));
        ctx.canvas.style.cursor = 'none';
        ctx.drawImage(this.image, -this.image.width / 2, -this.image.width / 2, this.image.width, this.image.height);
        ctx.restore();
    }
    onMouseMove(event: MouseEvent): void {
        const centerPos = this.getPositionFromMouse(event);
        this.rotateStamp(this.drawingService.previewCtx, centerPos);
    }

    setDegree(degree: number): void {
        this.degres = degree;
    }
    setStampSize(leftValue: number, rightValue: number): void {
        this.image.height = this.image.width = (this.lineWidth * leftValue) / rightValue;
    }
}
