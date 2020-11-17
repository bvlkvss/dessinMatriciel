import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagicWandSelection } from './MagicWandSelection';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const RGBA_NUMBER_OF_COMPONENTS = 4;
//const MAX_8BIT_NBR = 255;

@Injectable({
    providedIn: 'root',
})
export class MagicWandService extends Tool {
    private magicWandCanvas: HTMLCanvasElement;
    private magicWandCtx: CanvasRenderingContext2D;
    private selectionPixels: number[];
    selectionMinWidth: number;
    selectionMinHeight: number;
    startingColor: Color;
    nonContiguousSelectionDataArray: MagicWandSelection[];
    contiguousMagicSelectionObj: MagicWandSelection;
    isContiguousSelection: boolean;
    isNonContiguousSelection: boolean;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.magicWandCanvas = document.createElement('canvas');

        this.magicWandCtx = this.magicWandCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectionPixels = [];
        this.nonContiguousSelectionDataArray = [];
        this.toolAttributes = [];
        this.isContiguousSelection = false;
        this.isNonContiguousSelection = false;
    }

    /*onMouseDown(event: MouseEvent): void {
        this.isContiguousSelection = event.button === MouseButton.Left;
        this.isNonContiguousSelection = event.button === MouseButton.Right;
        if (this.isContiguousSelection) {
            this.magicWandCanvas.width = this.drawingService.canvas.width;
            this.magicWandCanvas.height = this.drawingService.canvas.height;
            this.currentPos = this.getPositionFromMouse(event);
            let modifiedPixels = this.getContiguousPixels(this.currentPos);
            this.saveSelection(modifiedPixels);
            this.drawContour(this.magicWandCanvas);

            this.contiguousMagicSelectionObj = this.createSelectionData();
            this.contiguousMagicSelectionObj.updateResizingHandles();
            this.contiguousMagicSelectionObj.drawResizingHandles();
        } else if (this.isNonContiguousSelection) {
            this.magicWandCanvas.width = this.drawingService.canvas.width;
            this.magicWandCanvas.height = this.drawingService.canvas.height;
            this.currentPos = this.getPositionFromMouse(event);
            this.getNonContiguousPixels(this.currentPos);
        }
    }*/

    onClick(event: MouseEvent) {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.currentPos = this.getPositionFromMouse(event);
        let modifiedPixels = this.getContiguousPixels(this.currentPos);
        this.saveSelection(modifiedPixels);
        this.drawContour(this.magicWandCanvas);

        this.contiguousMagicSelectionObj = this.createSelectionData();
        this.contiguousMagicSelectionObj.updateResizingHandles();
        this.contiguousMagicSelectionObj.drawResizingHandles();
        this.isContiguousSelection = true;
    }

    onRightClick(event: MouseEvent) {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.currentPos = this.getPositionFromMouse(event);
        let modifiedPixels = this.getNonContiguousPixels(this.currentPos);
        this.saveSelection(modifiedPixels);
        this.drawContour(this.magicWandCanvas);

        this.contiguousMagicSelectionObj = this.createSelectionData();
        this.contiguousMagicSelectionObj.updateResizingHandles();
        this.contiguousMagicSelectionObj.drawResizingHandles();
        this.isNonContiguousSelection = true;
    }

    private createSelectionData(): MagicWandSelection {
        return new MagicWandSelection(
            this.drawingService,
            this.magicWandCanvas,
            this.selectionStartPoint,
            this.selectionEndPoint,
            this.selectionMinWidth,
            this.selectionMinHeight,
        );
    }

    /*private resetMagicWandCanvas() {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.magicWandCtx.clearRect(0, 0, this.magicWandCanvas.width, this.magicWandCanvas.height);
    }*/

    private drawContour(canvas: HTMLCanvasElement) {
        let context = this.drawingService.previewCtx;
        this.startingColor.red == 0 && this.startingColor.green == 0 && this.startingColor.blue == 0
            ? (context.shadowColor = 'red')
            : (context.shadowColor = 'black');

        // X offset loop
        for (var x = -2; x <= 2; x++) {
            // Y offset loop
            for (var y = -2; y <= 2; y++) {
                // Set shadow offset
                context.shadowOffsetX = x;
                context.shadowOffsetY = y;

                // Draw image with shadow
                context.drawImage(canvas, this.selectionStartPoint.x, this.selectionStartPoint.y, this.selectionMinWidth, this.selectionMinHeight);
            }
        }
    }

    private setFirstAndLastPosition(modifiedPixels: Vec2[]) {
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
    }

    /*private resetSelectionPixels() {
        this.selectionPixels = [];
    }*/

    private saveSelection(modifiedPixels: Vec2[]) {
        this.drawOnWandCanvas();
        this.cropWandCanvas(modifiedPixels);
    }

    private drawOnWandCanvas() {
        let baseImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        let imageData = this.magicWandCtx.getImageData(0, 0, this.magicWandCanvas.width, this.magicWandCanvas.height);
        for (let i = 0; i < this.selectionPixels.length; i++) {
            let position = this.selectionPixels[i];
            imageData.data[position] = baseImageData.data[position];
            imageData.data[position + 1] = baseImageData.data[position + 1];
            imageData.data[position + 2] = baseImageData.data[position + 2];
            imageData.data[position + 3] = baseImageData.data[position + 3];
        }
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    private cropWandCanvas(modifiedPixels: Vec2[]) {
        this.setSelectionProperties(modifiedPixels);
        let x = this.selectionStartPoint.x;
        let y = this.selectionStartPoint.y;

        let imageData = this.magicWandCtx.getImageData(x, y, this.selectionMinWidth, this.selectionMinHeight);
        this.magicWandCtx.canvas.width = this.selectionMinWidth;
        this.magicWandCtx.canvas.height = this.selectionMinHeight;
        this.magicWandCtx.clearRect(0, 0, this.selectionMinWidth, this.selectionMinHeight);
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    private setSelectionProperties(modifiedPixels: Vec2[]) {
        this.setFirstAndLastPosition(modifiedPixels);

        let minWidth = this.selectionEndPoint.x - this.selectionStartPoint.x;
        let minHeight = this.selectionEndPoint.y - this.selectionStartPoint.y;

        this.selectionMinHeight = minHeight;
        this.selectionMinWidth = minWidth;
        console.log('minWidth: ' + this.selectionMinWidth);
    }

    private getPositionFromPixel(pixel: number, width:number):Vec2{
        let x = pixel/RGBA_NUMBER_OF_COMPONENTS % width;
        let y = Math.floor((pixel / 4) / width)
        return {x:x, y:y};
    }

    private getNonContiguousPixels(position: Vec2):Vec2[]{
        this.startingColor = this.getActualColor(position);
        let canvas = this.drawingService.baseCtx.canvas;
        let imageData = this.drawingService.baseCtx.getImageData(0, 0, canvas.width, canvas.height);
        let modifiedPixels = [];
        for (let i = 0; i < imageData.data.length; i += RGBA_NUMBER_OF_COMPONENTS) {
            if (this.areColorsMatching(this.startingColor, imageData, i)) {
                this.selectionPixels.push(i);
                modifiedPixels.push(this.getPositionFromPixel(i, canvas.width));
            }
        }
        return modifiedPixels;
    }

    private getContiguousPixels(position: Vec2): Vec2[] {
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
                this.selectionPixels.push(pixelPosition);
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
