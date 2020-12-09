import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Const } from '@app/classes/constants';
import { PaintBucketCommand } from '@app/classes/paint-bucker-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PaintBucketService extends Tool {
    tolerance: number;
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.tolerance = Const.MIN_TOLERANCE;
        this.toolAttributes = ['tolerance'];
    }

    onRightClick(event: MouseEvent): void {
        this.invoker.setIsAllowed(false);
        const mousePosition = this.getPositionFromMouse(event);
        const newImgData = this.fillNonContiguousArea(mousePosition);
        this.drawingService.baseCtx.putImageData(newImgData, 0, 0);
        this.invoker.setIsAllowed(true);
        const cmd = new PaintBucketCommand(newImgData, this.drawingService);
        this.invoker.addToUndo(cmd);
    }

    onClick(event: MouseEvent): void {
        this.invoker.setIsAllowed(false);
        const mousePosition = this.getPositionFromMouse(event);
        const newImgData = this.fillContiguousArea(mousePosition);
        this.drawingService.baseCtx.putImageData(newImgData, 0, 0);
        const cmd = new PaintBucketCommand(newImgData, this.drawingService);
        this.invoker.setIsAllowed(true);
        this.invoker.addToUndo(cmd);
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setTolerance(tolerance: number): void {
        if (tolerance >= Const.MIN_TOLERANCE && tolerance <= Const.MAX_TOLERANCE) this.tolerance = tolerance;
    }

    private fillNonContiguousArea(position: Vec2): ImageData {
        const startingColor: Color = this.getActualColor(position);
        const tolerance = this.toleranceToRGBAValue();
        const canvas: HTMLCanvasElement = this.drawingService.canvas;
        const ctx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += Const.RGBA_NUMBER_OF_COMPONENTS) {
            if (this.areColorsMatching(startingColor, imageData, i, tolerance)) {
                this.fillPixel(imageData, i);
            }
        }
        return imageData;
    }

    private fillContiguousArea(position: Vec2): ImageData {
        const startingColor: Color = this.getActualColor(position);
        const pixelStack = [position];
        const canvas: HTMLCanvasElement = this.drawingService.canvas;
        const ctx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const tolerance = this.toleranceToRGBAValue();
        let newPosition: Vec2;
        let pixelPosition: number;

        const startingPixelPosition: number = (position.y * canvas.width + position.x) * Const.RGBA_NUMBER_OF_COMPONENTS;
        const isColorTheSame: boolean = this.areColorsMatching(this.hexToColor(this.primaryColor), imageData, startingPixelPosition, tolerance);

        if (isColorTheSame) {
            return imageData;
        }
        while (pixelStack.length) {
            newPosition = pixelStack.pop() as Vec2;
            pixelPosition = (newPosition.y * canvas.width + newPosition.x) * Const.RGBA_NUMBER_OF_COMPONENTS;

            while (newPosition.y-- >= 0 && this.areColorsMatching(startingColor, imageData, pixelPosition, tolerance)) {
                pixelPosition -= canvas.width * Const.RGBA_NUMBER_OF_COMPONENTS;
            }
            pixelPosition += canvas.width * Const.RGBA_NUMBER_OF_COMPONENTS;
            ++newPosition.y;

            while (newPosition.y++ < canvas.height - 1 && this.areColorsMatching(startingColor, imageData, pixelPosition, tolerance)) {
                this.fillPixel(imageData, pixelPosition);
                if (newPosition.x > 0 && this.areColorsMatching(startingColor, imageData, pixelPosition - Const.RGBA_NUMBER_OF_COMPONENTS, tolerance))
                    pixelStack.push({ x: newPosition.x - 1, y: newPosition.y });

                if (
                    newPosition.x < canvas.width - 1 &&
                    this.areColorsMatching(startingColor, imageData, pixelPosition + Const.RGBA_NUMBER_OF_COMPONENTS, tolerance)
                )
                    pixelStack.push({ x: newPosition.x + 1, y: newPosition.y });

                pixelPosition += canvas.width * Const.RGBA_NUMBER_OF_COMPONENTS;
            }
        }
        return imageData;
    }

    private toleranceToRGBAValue(): number {
        return (this.tolerance / Const.MAX_TOLERANCE) * Const.MAX_8BIT_NBR;
    }
}
