import { Injectable } from '@angular/core';
import { BrushCommand } from '@app/classes/brush-command';
import { Color } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const RGBA_NUMBER_OF_COMPONENTS = 4;
const IMAGE_SIZE_DIVIDER = 3;
const MOUSE_POSITION_OFFSET_DIVIDER = 10;
const IMAGES_PER_POINT = 5;
const MAX_EIGHT_BIT_NB = 255;
const BASE_SIZE = 250;
const MINIMUM_BRUSH_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    image: HTMLImageElement;
    imageId: number;
    pathData: Vec2[] = [];
    color: Color = { red: 0, green: 0, blue: 0, opacity: MAX_EIGHT_BIT_NB };
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.primaryColor = '0000000';
        this.image = new Image();
        this.lineWidth = MINIMUM_BRUSH_SIZE;
        this.image.src = '../../../assets/b1.png';

        this.toolAttributes = ['texture', 'lineWidth'];
    }
    setTexture(id: number): void {
        this.image.src = '../../../assets/b' + id + '.png';
    }
    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }
    onMouseDown(event: MouseEvent): void {
        this.isOut = false;
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.invoker.setIsAllowed(false);
            this.currentPos = this.getPositionFromMouse(event);
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.invoker.ClearRedo();
        }
    }
    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && !this.isOut) {
            this.currentPos = this.getPositionFromMouse(event);
            this.pathData.push(this.currentPos);
            const cmd = new BrushCommand(this.pathData, this, this.drawingService) as BrushCommand;
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
            this.pathData = [];
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
            this.pathData.push(this.currentPos);
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
            ctx.globalAlpha = this.color.opacity / MAX_EIGHT_BIT_NB;
            ctx.drawImage(image, x, y, this.lineWidth, this.lineWidth);
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
    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }
    changeColor(imageData: ImageData): void {
        this.color = this.hexToColor(this.primaryColor);
        for (let j = 0; j < imageData.data.length; j += RGBA_NUMBER_OF_COMPONENTS) {
            imageData.data[j] = this.color.red; // Invert Red
            imageData.data[j + 1] = this.color.green; // Invert Green
            imageData.data[j + 2] = this.color.blue; // Invert Blue
        }
    }

    makeBaseImage(): HTMLCanvasElement {
        const tempCanvas = document.createElement('canvas');

        this.image.height = BASE_SIZE;
        this.image.width = BASE_SIZE;

        tempCanvas.width = this.image.width / IMAGE_SIZE_DIVIDER;
        tempCanvas.height = this.image.height / IMAGE_SIZE_DIVIDER;

        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCtx.drawImage(this.image, 0, 0, this.image.width / IMAGE_SIZE_DIVIDER, this.image.height / IMAGE_SIZE_DIVIDER);

        const data = tempCtx.getImageData(0, 0, this.image.width, this.image.height);
        this.changeColor(data);
        tempCtx.putImageData(data, 0, 0);

        return tempCanvas;
    }
    distanceBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
    angleBetween2Points(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }
}
