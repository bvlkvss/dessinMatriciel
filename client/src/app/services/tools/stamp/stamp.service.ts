import { Injectable } from '@angular/core';
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
const DEFAULT_DEGREE_STEP = 15;
const DEFAULT_IMAGE_SIZE = 100;
const MAX_DEGREE_VALUE = 360;
@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
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

    onClick(event: MouseEvent): void {
        const centerPos = this.getPositionFromMouse(event);
        this.rotateStamp(this.drawingService.baseCtx, centerPos);
    }

    getStampObs(): Subject<boolean> {
        return this.stampObs;
    }
    /* tslint:disable:no-any*/
    updateDegree(event: any, alt: boolean): void {
        if (event.wheelDelta > 0) {
            if (alt) {
                ++this.degres;
            } else {
                this.degres += DEFAULT_DEGREE_STEP;
            }
        } else {
            if (alt) {
                --this.degres;
            } else {
                this.degres -= DEFAULT_DEGREE_STEP;
            }
        }
        this.degres %= MAX_DEGREE_VALUE;
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
