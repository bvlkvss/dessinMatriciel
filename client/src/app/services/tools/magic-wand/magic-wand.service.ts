import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PaintBucketService } from '../paint-bucket/paint-bucket.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const RGBA_NUMBER_OF_COMPONENTS = 4;
//const MAX_8BIT_NBR = 255;
const MIN_TOLERANCE = 0;
//const MAX_TOLERANCE = 100;

@Injectable({
    providedIn: 'root',
})
export class MagicWandService extends PaintBucketService {
    tolerance: number;
    magicWandCanvas: HTMLCanvasElement;
    magicWandCtx: CanvasRenderingContext2D;
    selectionData: number[];
    currentPos: Vec2;
    selectionStartPoint: Vec2;
    selectionEndPoint: Vec2;
    selectionMinWidth: number;
    selectionMinHeight: number;
    startingColor:Color;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService, invoker);
        this.tolerance = MIN_TOLERANCE;
        this.magicWandCanvas = document.createElement('canvas');

        this.magicWandCtx = this.magicWandCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectionData = [];
    }

    onRightClick(event: MouseEvent): void {}

    onClick(event: MouseEvent): void {
        console.log('CALLED');
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        console.log('CALLING GETPOSFROMMOUSE');
        this.currentPos = this.getPositionFromMouse(event);
        console.log('CURRENT: ' + this.currentPos.x + ' ' + this.currentPos.y);
        let modifiedPixels = this.getContiguousPixels(this.currentPos);
        console.log('CALLING DRAWSELECTIONWAND');
        this.saveSelection(modifiedPixels);
        console.log('CALLING PREVIEW');
        this.drawingService.baseCtx.drawImage(this.magicWandCanvas, 200, 200);
        this.getContour();
    }

    getContour() {
        let context = this.drawingService.previewCtx;
        (this.startingColor.red == 0 && this.startingColor.green == 0 && this.startingColor.blue == 0) ? context.shadowColor = 'red' : context.shadowColor = 'black';
        
        // X offset loop
        for (var x = -2; x <= 2; x++) {
            // Y offset loop
            for (var y = -2; y <= 2; y++) {
                // Set shadow offset
                context.shadowOffsetX = x;
                context.shadowOffsetY = y;

                // Draw image with shadow
                context.drawImage(
                    this.magicWandCanvas,
                    this.selectionStartPoint.x,
                    this.selectionStartPoint.y,
                    this.selectionMinWidth,
                    this.selectionMinHeight,
                );
            }
        }
    }

    setFirstAndLastPosition(modifiedPixels: Vec2[]) {
        let xArray = [];
        let yArray = [];
        for (let i = 0; i < modifiedPixels.length; i++) {
            let pos = modifiedPixels[i];
            xArray.push(pos.x);
            yArray.push(pos.y);
        }

        let minX = Math.min(...xArray);
        let minY = Math.min(...yArray);
        let maxX = Math.max(...xArray);
        let maxY = Math.max(...yArray);

        this.selectionStartPoint = { x: minX, y: minY };
        this.selectionEndPoint = { x: maxX, y: maxY };
        console.log('START: ' + this.selectionStartPoint);
    }

    resetSelectionData() {
        this.selectionData = [];
    }

    saveSelection(modifiedPixels: Vec2[]) {
        this.drawOnWandCanvas();
        this.cropWandCanvas(modifiedPixels);
    }

    drawOnWandCanvas() {
        let baseImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        let imageData = this.magicWandCtx.getImageData(0, 0, this.magicWandCanvas.width, this.magicWandCanvas.height);
        for (let i = 0; i < this.selectionData.length; i++) {
            let position = this.selectionData[i];
            imageData.data[position] = baseImageData.data[position];
            imageData.data[position + 1] = baseImageData.data[position + 1];
            imageData.data[position + 2] = baseImageData.data[position + 2];
            imageData.data[position + 3] = baseImageData.data[position + 3];
        }
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    cropWandCanvas(modifiedPixels: Vec2[]) {
        this.setSelectionProperties(modifiedPixels);
        let x = this.selectionStartPoint.x;
        let y = this.selectionStartPoint.y;
        console.log('x: ' + x + ' y: ' + y);
        console.log('width: ' + this.selectionMinWidth + ' height: ' + this.selectionMinHeight);

        let imageData = this.magicWandCtx.getImageData(x, y, this.selectionMinWidth, this.selectionMinHeight);
        this.magicWandCtx.canvas.width = this.selectionMinWidth;
        this.magicWandCtx.canvas.height = this.selectionMinHeight;
        this.magicWandCtx.clearRect(0, 0, this.selectionMinWidth, this.selectionMinHeight);
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    setSelectionProperties(modifiedPixels: Vec2[]) {
        this.setFirstAndLastPosition(modifiedPixels);

        let minWidth = this.selectionEndPoint.x - this.selectionStartPoint.x;
        let minHeight = this.selectionEndPoint.y - this.selectionStartPoint.y;

        this.selectionMinHeight = minHeight;
        this.selectionMinWidth = minWidth;
    }

    getContiguousPixels(position: Vec2): Vec2[] {
        this.startingColor = this.getActualColor(position);
        const pixelStack = [position];
        const canvas: HTMLCanvasElement = this.drawingService.canvas;
        const ctx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let newPosition: Vec2;
        let pixelPosition: number;
        let modifiedPixels = [];

        // so we do not have inifinite loop when primaryColor is the same as startingColor;
        this.primaryColor = '#000000';
        const startingPixelPosition: number = (position.y * canvas.width + position.x) * RGBA_NUMBER_OF_COMPONENTS;
        const isColorTheSame: boolean = this.areColorsMatching(this.hexToColor(this.primaryColor), imageData, startingPixelPosition);

        if (isColorTheSame) {
            this.primaryColor = '#ffffff';
        }

        while (pixelStack.length) {
            newPosition = pixelStack.pop() as Vec2;
            pixelPosition = (newPosition.y * canvas.width + newPosition.x) * RGBA_NUMBER_OF_COMPONENTS;

            while (newPosition.y-- >= 0 && this.areColorsMatching(this.startingColor, imageData, pixelPosition)) {
                pixelPosition -= canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
            pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            ++newPosition.y;
            let isLeftReached = false;
            let isRightReached = false;
            while (newPosition.y++ < canvas.height - 1 && this.areColorsMatching(this.startingColor, imageData, pixelPosition)) {
                this.fillPixel(imageData, pixelPosition);
                this.selectionData.push(pixelPosition);
                modifiedPixels.push({ x: newPosition.x, y: newPosition.y });
                if (newPosition.x > 0) {
                    if (this.areColorsMatching(this.startingColor, imageData, pixelPosition - RGBA_NUMBER_OF_COMPONENTS)) {
                        if (!isLeftReached) {
                            pixelStack.push({ x: newPosition.x - 1, y: newPosition.y });
                            isLeftReached = true;
                        }
                    } else if (isLeftReached) {
                        isLeftReached = false;
                    }
                }
                if (newPosition.x < canvas.width - 1) {
                    if (this.areColorsMatching(this.startingColor, imageData, pixelPosition + RGBA_NUMBER_OF_COMPONENTS)) {
                        if (!isRightReached) {
                            pixelStack.push({ x: newPosition.x + 1, y: newPosition.y });
                            isRightReached = true;
                        }
                    } else if (isLeftReached) {
                        isRightReached = false;
                    }
                }
                pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
        }
        return modifiedPixels;
    }
}
