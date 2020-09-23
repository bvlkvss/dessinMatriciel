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
const IMAGE_SIZE_DIVIDER = 3;
const MOUSE_POSITION_OFFSET_DIVIDER = 6;
const IMAGES_PER_POINT = 4;

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
    private color: Color = this.primaryColor;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.image = new Image();
        this.image.src = '../../../assets/b4.png';
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
        ctx.beginPath();
        const dist = this.distanceBetween2Points(this.mouseDownCoord, this.currentPos);
        const angle = this.angleBetween2Points(this.mouseDownCoord, this.currentPos);
        let i = 0;
        const image = this.makeBaseImage();
        do {
            const x = this.mouseDownCoord.x + Math.sin(angle) * i - this.image.width / MOUSE_POSITION_OFFSET_DIVIDER;
            const y = this.mouseDownCoord.y + Math.cos(angle) * i - this.image.height / MOUSE_POSITION_OFFSET_DIVIDER;
            ctx.drawImage(image, x, y, image.width, image.height);
            i += IMAGES_PER_POINT;
        } while (i < dist);
        this.mouseDownCoord = this.currentPos;
        ctx.closePath();
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawLine(this.drawingService.baseCtx);
        }
        this.isOut = true;
    }

    setColor(color: Color): void {
        this.color = color;
    }

    getColor(): Color {
        return this.color;
    }

    changeColor(imageData: ImageData): void {
        for (let j = 0; j < imageData.data.length; j += BYTE_SIZE) {
            imageData.data[j] = this.color.red; // Invert Red
            imageData.data[j + 1] = this.color.green; // Invert Green
            imageData.data[j + 2] = this.color.blue; // Invert Blue
        }
    }

    makeBaseImage(): HTMLCanvasElement {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.image.width / IMAGE_SIZE_DIVIDER;
        tempCanvas.height = this.image.height / IMAGE_SIZE_DIVIDER;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(this.image, 0, 0, this.image.width / IMAGE_SIZE_DIVIDER, this.image.height / IMAGE_SIZE_DIVIDER);
            const data = tempCtx.getImageData(0, 0, this.image.width, this.image.height);
            this.changeColor(data);
            tempCtx.putImageData(data, 0, 0);
        }
        return tempCanvas;
    }

    private angleBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }
    private distanceBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
}
