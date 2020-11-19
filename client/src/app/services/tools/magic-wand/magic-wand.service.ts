import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagicWandSelection } from './magic-wand-selection';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const RGBA_NUMBER_OF_COMPONENTS = 4;

@Injectable({
    providedIn: 'root',
})
export class MagicWandService extends Tool {
    private magicWandCanvas: HTMLCanvasElement;
    private magicWandCtx: CanvasRenderingContext2D;
    private selectionPixels: number[];
    selectionStartPoint: Vec2;
    selectionEndPoint: Vec2;
    selectionMinWidth: number;
    selectionMinHeight: number;
    startingColor: Color;
    nonContiguousSelectionDataArray: MagicWandSelection[];
    contiguousMagicSelectionObj: MagicWandSelection;
    isSelectionActivated: boolean;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.magicWandCanvas = document.createElement('canvas');
        this.magicWandCtx = this.magicWandCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectionPixels = [];
        this.nonContiguousSelectionDataArray = [];
        this.toolAttributes = [];
        this.isSelectionActivated = false;
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isSelectionActivated) {
            this.mouseDown = event.button === MouseButton.Left;
        }
    }

    onClick(event: MouseEvent): void {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.currentPos = this.getPositionFromMouse(event);
        const modifiedPixels = this.getContiguousPixels(this.currentPos);
        this.saveSelection(modifiedPixels);
        this.drawContour(this.magicWandCanvas);

        this.contiguousMagicSelectionObj = this.createSelectionData();
        this.contiguousMagicSelectionObj.updateResizingHandles();
        this.contiguousMagicSelectionObj.drawResizingHandles();
        this.isSelectionActivated = true;
    }

    onRightClick(event: MouseEvent): void {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.currentPos = this.getPositionFromMouse(event);
        const modifiedPixels = this.getNonContiguousPixels(this.currentPos);
        this.saveSelection(modifiedPixels);
        this.drawContour(this.magicWandCanvas);

        this.contiguousMagicSelectionObj = this.createSelectionData();
        this.contiguousMagicSelectionObj.updateResizingHandles();
        this.contiguousMagicSelectionObj.drawResizingHandles();
        this.isSelectionActivated = true;
    }

    clearSelection(): void {
        this.resetMagicWandCanvas();
        this.resetSelectionPixels();
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

    private resetMagicWandCanvas(): void {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.magicWandCtx.clearRect(0, 0, this.magicWandCanvas.width, this.magicWandCanvas.height);
    }

    private drawContour(canvas: HTMLCanvasElement): void {
        const context = this.drawingService.previewCtx;
        this.startingColor.red === 0 && this.startingColor.green === 0 && this.startingColor.blue === 0
            ? (context.shadowColor = 'red')
            : (context.shadowColor = 'black');

        // X offset loop
        for (let x = -2; x <= 2; x++) {
            // Y offset loop
            for (let y = -2; y <= 2; y++) {
                // Set shadow offset
                context.shadowOffsetX = x;
                context.shadowOffsetY = y;

                // Draw image with shadow
                context.drawImage(canvas, this.selectionStartPoint.x, this.selectionStartPoint.y, this.selectionMinWidth, this.selectionMinHeight);
            }
        }
    }

    private setFirstAndLastPosition(modifiedPixels: Vec2[]): void {
        const xArray = [];
        const yArray = [];
        for (const modifiedPixel of modifiedPixels) {
            xArray.push(modifiedPixel.x);
            yArray.push(modifiedPixel.y);
        }

        const minX = Math.min(...xArray);
        const minY = Math.min(...yArray);
        const maxX = Math.max(...xArray);
        const maxY = Math.max(...yArray);

        this.selectionStartPoint = { x: minX, y: minY };
        this.selectionEndPoint = { x: maxX, y: maxY };
    }

    private resetSelectionPixels(): void {
        this.selectionPixels = [];
    }

    private saveSelection(modifiedPixels: Vec2[]): void {
        this.drawOnWandCanvas();
        this.cropWandCanvas(modifiedPixels);
    }

    private drawOnWandCanvas(): void {
        const baseImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const imageData = this.magicWandCtx.getImageData(0, 0, this.magicWandCanvas.width, this.magicWandCanvas.height);
        for (const selectionPixel of this.selectionPixels) {
            imageData.data[selectionPixel] = baseImageData.data[selectionPixel];
            imageData.data[selectionPixel + 1] = baseImageData.data[selectionPixel + 1];
            imageData.data[selectionPixel + 2] = baseImageData.data[selectionPixel + 2];
            // tslint:disable-next-line:no-magic-numbers
            imageData.data[selectionPixel + 3] = baseImageData.data[selectionPixel + 3];
        }
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    private cropWandCanvas(modifiedPixels: Vec2[]): void {
        this.setSelectionProperties(modifiedPixels);
        const x = this.selectionStartPoint.x;
        const y = this.selectionStartPoint.y;

        const imageData = this.magicWandCtx.getImageData(x, y, this.selectionMinWidth, this.selectionMinHeight);
        this.magicWandCtx.canvas.width = this.selectionMinWidth;
        this.magicWandCtx.canvas.height = this.selectionMinHeight;
        this.magicWandCtx.clearRect(0, 0, this.selectionMinWidth, this.selectionMinHeight);
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    private setSelectionProperties(modifiedPixels: Vec2[]): void {
        this.setFirstAndLastPosition(modifiedPixels);

        const minWidth = this.selectionEndPoint.x - this.selectionStartPoint.x;
        const minHeight = this.selectionEndPoint.y - this.selectionStartPoint.y;

        this.selectionMinHeight = minHeight;
        this.selectionMinWidth = minWidth;
    }

    private getPositionFromPixel(pixel: number, width: number): Vec2 {
        const x = (pixel / RGBA_NUMBER_OF_COMPONENTS) % width;
        const y = Math.floor(pixel / RGBA_NUMBER_OF_COMPONENTS / width);
        return { x, y };
    }

    private getNonContiguousPixels(position: Vec2): Vec2[] {
        this.startingColor = this.getActualColor(position);
        const canvas = this.drawingService.baseCtx.canvas;
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, canvas.width, canvas.height);
        const modifiedPixels = [];
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
        const modifiedPixels = [];

        // so we do not have inifinite loop when primaryColor is the same as startingColor;
        this.primaryColor = '#000000';
        const startingPixelPosition: number = (position.y * canvas.width + position.x) * RGBA_NUMBER_OF_COMPONENTS;
        const isColorTheSame: boolean = this.areColorsMatching(this.hexToColor(this.primaryColor), imageData, startingPixelPosition);

        if (isColorTheSame) this.primaryColor = '#ffffff';

        while (pixelStack.length) {
            newPosition = pixelStack.pop() as Vec2;
            pixelPosition = (newPosition.y * canvas.width + newPosition.x) * RGBA_NUMBER_OF_COMPONENTS;

            while (newPosition.y-- >= 0 && this.areColorsMatching(this.startingColor, imageData, pixelPosition)) {
                pixelPosition -= canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
            pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            ++newPosition.y;
            while (newPosition.y++ < canvas.height - 1 && this.areColorsMatching(this.startingColor, imageData, pixelPosition)) {
                this.fillPixel(imageData, pixelPosition);
                this.selectionPixels.push(pixelPosition);
                modifiedPixels.push({ x: newPosition.x, y: newPosition.y });
                if (newPosition.x > 0 && this.areColorsMatching(this.startingColor, imageData, pixelPosition - RGBA_NUMBER_OF_COMPONENTS))
                    pixelStack.push({ x: newPosition.x - 1, y: newPosition.y });

                if (
                    newPosition.x < canvas.width - 1 &&
                    this.areColorsMatching(this.startingColor, imageData, pixelPosition + RGBA_NUMBER_OF_COMPONENTS)
                )
                    pixelStack.push({ x: newPosition.x + 1, y: newPosition.y });

                pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
        }
        return modifiedPixels;
    }
}
