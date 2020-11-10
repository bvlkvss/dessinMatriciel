/*import { Injectable } from '@angular/core';
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
const MAX_TOLERANCE = 100;

@Injectable({
    providedIn: 'root',
})
export class MagicWandService extends PaintBucketService {
    tolerance: number;
    magicWandCanvas: HTMLCanvasElement;
    magicWandCtx: CanvasRenderingContext2D;
    selectionData: number[];
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService, invoker);
        this.tolerance = MIN_TOLERANCE;
        this.magicWandCanvas = document.createElement('canvas');
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.magicWandCtx = this.magicWandCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectionData = [];
    }

    onRightClick(event: MouseEvent): void {}

    onClick(event: MouseEvent): void {}

    resetSelectionData(){
      this.selectionData = [];
    }

  
    drawSelectionOnWandCanvas():void {
        let imageData = this.magicWandCtx.getImageData(0, 0, this.magicWandCanvas.width, this.magicWandCanvas.height);
        for (let i = 0; i < this.selectionData.length; i++) {
            imageData.data[this.selectionData[i]] = this.selectionData[i];
        }
        this.magicWandCtx.putImageData(imageData, 0, 0);
    }

    //Implement
    drawDashOnSelectionContour() {

    }

    getContiguousPixels(position: Vec2): Vec2[] {
        const startingColor: Color = this.getActualColor(position);
        const pixelStack = [position];
        const canvas: HTMLCanvasElement = this.drawingService.canvas;
        const ctx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let newPosition: Vec2;
        let pixelPosition: number;
        let modifiedPixels = [];

        while (pixelStack.length) {
            newPosition = pixelStack.pop() as Vec2;
            pixelPosition = (newPosition.y * canvas.width + newPosition.x) * RGBA_NUMBER_OF_COMPONENTS;

            while (newPosition.y-- >= 0 && this.areColorsMatching(startingColor, imageData, pixelPosition)) {
                pixelPosition -= canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
            pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            ++newPosition.y;
            let isLeftReached = false;
            let isRightReached = false;
            while (newPosition.y++ < canvas.height - 1 && this.areColorsMatching(startingColor, imageData, pixelPosition)) {
                modifiedPixels.push({ x: newPosition.x, y: newPosition.y });
                this.selectionData.push(pixelPosition);
                if (newPosition.x > 0) {
                    if (this.areColorsMatching(startingColor, imageData, pixelPosition - RGBA_NUMBER_OF_COMPONENTS)) {
                        if (!isLeftReached) {
                            pixelStack.push({ x: newPosition.x - 1, y: newPosition.y });
                            isLeftReached = true;
                        }
                    } else if (isLeftReached) {
                        isLeftReached = false;
                    }
                }
                if (newPosition.x < canvas.width - 1) {
                    if (this.areColorsMatching(startingColor, imageData, pixelPosition + RGBA_NUMBER_OF_COMPONENTS)) {
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
*/