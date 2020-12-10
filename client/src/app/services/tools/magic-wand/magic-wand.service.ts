import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Const } from '@app/classes/constants';
import { DEFAULT_HANDLE_INDEX } from '@app/classes/resizable';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { MagicWandSelection } from './magic-wand-selection';
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
    magicSelectionObj: MagicWandSelection;
    isMagicSelectionActivated: boolean;
    invoker: UndoRedoService;
    deactivateAfterClick: boolean;
    canResize: boolean;
    constructor(drawingService: DrawingService, invoker: UndoRedoService) {
        super(drawingService);
        this.magicWandCanvas = document.createElement('canvas');
        this.magicWandCtx = this.magicWandCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectionPixels = [];
        this.nonContiguousSelectionDataArray = [];
        this.toolAttributes = ['typeSelection'];
        this.isMagicSelectionActivated = false;
        this.invoker = invoker;
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isMagicSelectionActivated) {
            this.mouseDown = event.button === MouseButton.Left;
            if (this.mouseDown) {
                this.mouseDownCoord = this.getPositionFromMouse(event);
                const obj = this.magicSelectionObj;
                if (obj.mouseDownOnHandle(this.mouseDownCoord) !== DEFAULT_HANDLE_INDEX) {
                    obj.currenthandle = obj.mouseDownOnHandle(this.mouseDownCoord);
                    this.canResize = true;
                    this.invoker.ClearRedo();
                    this.invoker.setIsAllowed(false);
                    return;
                } else if (
                    obj.getUnrotatedPos(this.mouseDownCoord).x >= obj.selectionStartPoint.x &&
                    obj.getUnrotatedPos(this.mouseDownCoord).x <= obj.selectionEndPoint.x &&
                    obj.getUnrotatedPos(this.mouseDownCoord).y >= obj.selectionStartPoint.y &&
                    obj.getUnrotatedPos(this.mouseDownCoord).y <= obj.selectionEndPoint.y
                ) {
                    this.invoker.ClearRedo();
                    this.invoker.setIsAllowed(false);
                    obj.mouseDownInsideSelection = true;
                    obj.offsetX = this.mouseDownCoord.x - obj.selectionStartPoint.x;
                    obj.offsetY = this.mouseDownCoord.y - obj.selectionStartPoint.y;
                    return;
                } else {
                    obj.drawSelectionOnBase();
                    obj.degres = 0;
                    this.clearSelection();
                    this.canResize = false;
                    this.deactivateAfterClick = true;
                }
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const obj = this.magicSelectionObj;
            obj.updateSelectionNodes();
            obj.width = Math.abs(obj.width);
            obj.height = Math.abs(obj.height);
            obj.updateResizingHandles();
            obj.rectangleService.mouseDown = false;
            obj.rectangleService.toSquare = false;
            obj.mouseDownInsideSelection = false;
            obj.flipedH = false;
            obj.flipedV = false;
            obj.currenthandle = DEFAULT_HANDLE_INDEX;
            this.mouseDown = false;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.isMagicSelectionActivated && this.mouseDown) {
            const obj = this.magicSelectionObj;
            obj.currentPos = this.getPositionFromMouse(event);
            if (obj.mouseDownInsideSelection) {
                obj.moveSelection(obj.currentPos);
                obj.redrawSelection();
            } else if (this.canResize) {
                obj.resizeSelection();
            }
        }
    }

    onClick(event: MouseEvent): void {
        if (!this.isMagicSelectionActivated) {
            this.magicWandCanvas.width = this.drawingService.canvas.width;
            this.magicWandCanvas.height = this.drawingService.canvas.height;
            this.currentPos = this.getPositionFromMouse(event);
            const modifiedPixels = this.getContiguousPixels(this.currentPos);
            this.saveSelection(modifiedPixels);
            this.drawContour(this.magicWandCanvas);

            this.magicSelectionObj = this.createSelectionObj();
            this.magicSelectionObj.createEnglobingBox();
            this.magicSelectionObj.updateResizingHandles();
            this.magicSelectionObj.drawResizingHandles();
            this.isMagicSelectionActivated = true;
        }
        if (this.deactivateAfterClick) {
            this.isMagicSelectionActivated = false;
            this.deactivateAfterClick = false;
        }
    }

    onRightClick(event: MouseEvent): void {
        if (!this.isMagicSelectionActivated) {
            this.magicWandCanvas.width = this.drawingService.canvas.width;
            this.magicWandCanvas.height = this.drawingService.canvas.height;
            this.currentPos = this.getPositionFromMouse(event);
            const modifiedPixels = this.getNonContiguousPixels(this.currentPos);
            this.saveSelection(modifiedPixels);
            this.drawContour(this.magicWandCanvas);
            this.magicSelectionObj = this.createSelectionObj();
            this.magicSelectionObj.createEnglobingBox();
            this.magicSelectionObj.updateResizingHandles();
            this.magicSelectionObj.drawResizingHandles();
            this.isMagicSelectionActivated = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        const obj = this.magicSelectionObj;
        if (obj) {
            if (!event.shiftKey && obj.currenthandle !== DEFAULT_HANDLE_INDEX) {
                obj.rectangleService.toSquare = false;
                obj.resizeSelection();
            }
            obj.keysDown[event.key] = event.type === 'keydown';
            obj.mouseDownInsideSelection = false;
            obj.continuousMove = !event.key.includes('Arrow');
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        const obj = this.magicSelectionObj;
        if (event.key === 'Escape') {
            obj.drawSelectionOnBase();
            this.clearSelection();
        } else if (obj) {
            if (obj.currenthandle !== DEFAULT_HANDLE_INDEX && event.shiftKey && this.mouseDown) {
                obj.rectangleService.toSquare = true;
                obj.resizeSelection();
            }

            obj.keysDown[event.key] = event.type === 'keydown';

            if (event.key.includes('Arrow')) {
                event.preventDefault();
                event.stopPropagation();
                obj.moveSelectionWithKeys();
                obj.redrawSelection();
            }
        }
    }

    clearSelection(): void {
        this.resetMagicWandCanvas();
        this.selectionPixels = [];
        this.magicSelectionObj.isActive = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        Tool.shouldAlign = true;
    }

    private createSelectionObj(): MagicWandSelection {
        return new MagicWandSelection(
            this.drawingService,
            this.invoker,
            this.magicWandCanvas,
            this.selectionStartPoint,
            this.selectionEndPoint,
            this.selectionMinWidth,
            this.selectionMinHeight,
            this.selectionPixels,
            true,
        );
    }

    private resetMagicWandCanvas(): void {
        this.magicWandCanvas.width = this.drawingService.canvas.width;
        this.magicWandCanvas.height = this.drawingService.canvas.height;
        this.drawingService.clearCanvas(this.magicWandCtx);
    }

    private drawContour(canvas: HTMLCanvasElement): void {
        const context = this.drawingService.previewCtx;
        this.startingColor.red === 0 && this.startingColor.green === 0 && this.startingColor.blue === 0
            ? (context.shadowColor = 'red')
            : (context.shadowColor = 'black');

        for (let x = -Const.OFFSET_FOR_SHADOW; x <= Const.OFFSET_FOR_SHADOW; x++) {
            for (let y = -Const.OFFSET_FOR_SHADOW; y <= Const.OFFSET_FOR_SHADOW; y++) {
                context.shadowOffsetX = x;
                context.shadowOffsetY = y;
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

        // we use these functions instead of Math.min and Math.max because we get a max call stack error when array is too big
        const minX = this.getMin(xArray);
        const minY = this.getMin(yArray);
        const maxX = this.getMax(xArray);
        const maxY = this.getMax(yArray);

        this.selectionStartPoint = { x: minX, y: minY };
        this.selectionEndPoint = { x: maxX, y: maxY };
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

    private getNonContiguousPixels(position: Vec2): Vec2[] {
        this.startingColor = this.getActualColor(position);
        const canvas = this.drawingService.baseCtx.canvas;
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, canvas.width, canvas.height);
        const modifiedPixels = [];
        for (let i = 0; i < imageData.data.length; i += Const.RGBA_NUMBER_OF_COMPONENTS) {
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
        const tempColor = this.primaryColor;
        this.primaryColor = '#000000';
        const startingPixelPosition: number = (position.y * canvas.width + position.x) * Const.RGBA_NUMBER_OF_COMPONENTS;
        const isColorTheSame: boolean = this.areColorsMatching(this.hexToColor(this.primaryColor), imageData, startingPixelPosition);

        if (isColorTheSame) this.primaryColor = '#ffffff';

        while (pixelStack.length) {
            newPosition = pixelStack.pop() as Vec2;
            pixelPosition = (newPosition.y * canvas.width + newPosition.x) * Const.RGBA_NUMBER_OF_COMPONENTS;

            while (newPosition.y-- >= 0 && this.areColorsMatching(this.startingColor, imageData, pixelPosition)) {
                pixelPosition -= canvas.width * Const.RGBA_NUMBER_OF_COMPONENTS;
            }
            pixelPosition += canvas.width * Const.RGBA_NUMBER_OF_COMPONENTS;
            ++newPosition.y;
            while (newPosition.y++ < canvas.height - 1 && this.areColorsMatching(this.startingColor, imageData, pixelPosition)) {
                this.fillPixel(imageData, pixelPosition);
                this.selectionPixels.push(pixelPosition);
                modifiedPixels.push({ x: newPosition.x, y: newPosition.y });
                if (newPosition.x > 0 && this.areColorsMatching(this.startingColor, imageData, pixelPosition - Const.RGBA_NUMBER_OF_COMPONENTS))
                    pixelStack.push({ x: newPosition.x - 1, y: newPosition.y });

                if (
                    newPosition.x < canvas.width - 1 &&
                    this.areColorsMatching(this.startingColor, imageData, pixelPosition + Const.RGBA_NUMBER_OF_COMPONENTS)
                )
                    pixelStack.push({ x: newPosition.x + 1, y: newPosition.y });
                pixelPosition += canvas.width * Const.RGBA_NUMBER_OF_COMPONENTS;
            }
        }
        this.primaryColor = tempColor;
        return modifiedPixels;
    }
}
