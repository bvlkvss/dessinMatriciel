import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const BYTE_SIZE = 4;
const IMAGE_SIZE_DIVIDER = 2;
//const MOUSE_POSITION_OFFSET_DIVIDER = 6;
const IMAGES_PER_POINT = 8;
const DEFAULT_BRUSH_SIZE = 20;

// TODO : Déplacer ça dans un fichier séparé accessible par tous

// Ceci est une implémentation de base de l'outil Crayon pour aider à débuter le projet
// L'implémentation ici ne couvre pas tous les critères d'accepetation du projet
// Vous êtes encouragés de modifier et compléter le code.
// N'oubliez pas de regarder les tests dans le fichier spec.ts aussi!

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    private image: HTMLImageElement;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.image = new Image();
        this.image.src = '../../../assets/b2.svg';
        this.image.width = DEFAULT_BRUSH_SIZE;
        this.image.height = DEFAULT_BRUSH_SIZE;
    }

    onMouseDown(event: MouseEvent): void {
        this.isOut = false;
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    getImage(): HTMLImageElement {
        return this.image;
    }
    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && !this.isOut) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawLine(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
    }
    onMouseEnter(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
        this.isOut = false;
    }
    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && !this.isOut) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.baseCtx);
        }
    }
    private drawLine(ctx: CanvasRenderingContext2D): void {
        const dist = this.distanceBetween2Points(this.mouseDownCoord, this.currentPos);
        const angle = this.angleBetween2Points(this.mouseDownCoord, this.currentPos);
        let i = 0;
        do {
            const x = this.mouseDownCoord.x + Math.sin(angle) * i - this.image.width / IMAGE_SIZE_DIVIDER;
            const y = this.mouseDownCoord.y + Math.cos(angle) * i - this.image.height / IMAGE_SIZE_DIVIDER;
            ctx.drawImage(this.image, x, y, this.image.width, this.image.height);
            i += IMAGES_PER_POINT;
        } while (i < dist);
        this.mouseDownCoord = this.currentPos;
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawLine(this.drawingService.baseCtx);
        }
        this.isOut = true;
    }

    changeColor(imagedata: ImageData, color: Color): void {
        for (let j = 0; j < imagedata.data.length; j += BYTE_SIZE) {
            imagedata.data[j] = color.red; // Invert Red
            imagedata.data[j + 1] = color.green; // Invert Green
            imagedata.data[j + 2] = color.blue; // Invert Blue
        }
    }
    private angleBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }
    private distanceBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
}
