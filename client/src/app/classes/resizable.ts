import { Vec2 } from '@app/classes/vec2';
import { Movable } from './movable';
import { PI_DEGREE } from './rotationable';
import { Tool } from './tool';

export const HANDLE_LENGTH = 6;
export const HANDLE_OFFSET = HANDLE_LENGTH / 2;
const DEFAULT_VECTOR_START = 10;
export const DEFAULT_HANDLE_INDEX = -1;

enum FLIPCASES {
    vertical = 1,
    horizental = 2,
    diagonal = 3,
}
export enum HANDLES {
    one = 1,
    two = 2,
    three = 3,
    four = 4,
    five = 5,
    six = 6,
    seven = 7,
    eight = 8,
    center = 9,
}
export class Resizable {
    checkFlip(this: Movable): number {
        let i = 0;
        if (this.selectionEndPoint.x < this.selectionStartPoint.x && !this.flipedH) {
            i += 1;
            this.flipedH = true;
        } else if (this.selectionEndPoint.x > this.selectionStartPoint.x && this.flipedH) {
            i += 1;
            this.flipedH = false;
        }
        if (this.selectionEndPoint.y < this.selectionStartPoint.y && !this.flipedV) {
            i += 2;
            this.flipedV = true;
        } else if (this.selectionEndPoint.y > this.selectionStartPoint.y && this.flipedV) {
            i += 2;
            this.flipedV = false;
        }
        return i;
    }

    flipSelection(this: Movable): void {
        let scale: Vec2 = { x: 0, y: 0 };
        let translateVec: Vec2 = { x: 0, y: 0 };
        switch (this.checkFlip()) {
            case FLIPCASES.vertical:
                scale = { x: -1, y: 1 };
                translateVec = { x: this.selectionData.width, y: 0 };
                break;
            case FLIPCASES.horizental:
                scale = { x: 1, y: -1 };
                translateVec = { x: 0, y: this.selectionData.height };
                break;
            case FLIPCASES.diagonal:
                scale = { x: -1, y: -1 };
                translateVec = { x: this.selectionData.width, y: this.selectionData.height };
                break;
        }
        this.flipData(translateVec, scale);
    }

    flipData(this: Movable, translateVec: Vec2, scale: Vec2): void {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.selectionData.width;
        tempCanvas.height = this.selectionData.height;
        (tempCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(this.selectionData, 0, 0);
        (this.selectionData.getContext('2d') as CanvasRenderingContext2D).save();
        (this.selectionData.getContext('2d') as CanvasRenderingContext2D).translate(translateVec.x, translateVec.y);
        (this.selectionData.getContext('2d') as CanvasRenderingContext2D).scale(scale.x, scale.y);
        this.drawingService.clearCanvas(this.selectionData.getContext('2d') as CanvasRenderingContext2D);
        (this.selectionData.getContext('2d') as CanvasRenderingContext2D).drawImage(tempCanvas, 0, 0);
        (this.selectionData.getContext('2d') as CanvasRenderingContext2D).restore();
    }

    updateResizingHandles(this: Movable): void {
        this.resizingHandles = [];

        /*
  1 2 3
  4   5
  6 7 8
*/
        // 1
        this.resizingHandles.push({
            x: this.selectionStartPoint.x - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET,
        });
        // 2
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width / 2 - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET,
        });
        // 3
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET,
        });
        // 4
        this.resizingHandles.push({
            x: this.selectionStartPoint.x - HANDLE_OFFSET,
            y: this.selectionStartPoint.y + this.height / 2 - HANDLE_OFFSET,
        });
        // 5
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET + this.height / 2,
        });
        // 6
        this.resizingHandles.push({
            x: this.selectionStartPoint.x - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET + this.height,
        });
        // 7
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width / 2 - HANDLE_OFFSET,
            y: this.selectionStartPoint.y + this.height - HANDLE_OFFSET,
        });
        // 8
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width - HANDLE_OFFSET,
            y: this.selectionStartPoint.y + this.height - HANDLE_OFFSET,
        });
    }

    drawResizingHandles(this: Movable): void {
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.fillStyle = '#ffffff';
        this.drawingService.previewCtx.strokeStyle = 'blue';
        this.drawingService.previewCtx.lineWidth = 2;
        this.drawingService.previewCtx.setLineDash([0, 0]);
        for (const handle of this.resizingHandles) {
            this.drawingService.previewCtx.save();
            this.drawingService.previewCtx.translate(this.selectionStartPoint.x + this.width / 2, this.selectionStartPoint.y + this.height / 2);
            this.drawingService.previewCtx.rotate((this.degres * Math.PI) / PI_DEGREE);
            this.drawingService.previewCtx.rect(
                this.selectionStartPoint.x + this.width / 2 - 2 * HANDLE_OFFSET - handle.x,
                this.selectionStartPoint.y + this.height / 2 - 2 * HANDLE_OFFSET - handle.y,
                HANDLE_LENGTH,
                HANDLE_LENGTH,
            );
            this.drawingService.previewCtx.restore();
        }
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.fill();
        this.drawingService.previewCtx.closePath();
        this.drawingService.previewCtx.restore();
    }

    resizeSelection(this: Movable): void {
        let direction = {} as Vec2;
        let newStart = {} as Vec2;
        switch (this.currenthandle) {
            case HANDLES.one:
                this.adjustRectangle(this.currentPos, this.selectionEndPoint, 0);
                break;
            case HANDLES.two:
                direction = { x: this.selectionStartPoint.x, y: 10 };
                newStart = this.handleNewPos(this.selectionStartPoint, direction);
                this.adjustRectangle(newStart, this.selectionEndPoint, 0);
                break;
            case HANDLES.three:
                direction = { x: this.selectionStartPoint.x, y: this.selectionStartPoint.y + Math.abs(this.height) / 2 + DEFAULT_VECTOR_START };
                newStart = this.handleNewPos(this.selectionStartPoint, direction);
                this.adjustRectangle(newStart, this.selectionEndPoint, 0);
                direction = { x: this.selectionEndPoint.x - (Math.abs(this.width) / 2 + DEFAULT_VECTOR_START), y: this.selectionEndPoint.y };
                newStart = this.handleNewPos(this.selectionEndPoint, direction);
                this.adjustRectangle(this.selectionStartPoint, newStart, 1);
                break;
            case HANDLES.four:
                direction = { x: this.selectionEndPoint.x + this.width / 2 + DEFAULT_VECTOR_START, y: this.selectionStartPoint.y };
                newStart = this.handleNewPos(this.selectionStartPoint, direction);
                this.adjustRectangle(newStart, this.selectionEndPoint, 0);
                break;
            case HANDLES.five:
                direction = { x: this.selectionEndPoint.x - (Math.abs(this.width) / 2 + DEFAULT_VECTOR_START), y: this.selectionEndPoint.y };
                newStart = this.handleNewPos(this.selectionEndPoint, direction);
                this.adjustRectangle(this.selectionStartPoint, newStart, 1);
                break;
            case HANDLES.six:
                direction = { x: this.selectionStartPoint.x + Math.abs(this.width) / 2 + DEFAULT_VECTOR_START, y: this.selectionStartPoint.y };
                newStart = this.handleNewPos(this.selectionStartPoint, direction);
                this.adjustRectangle(newStart, this.selectionEndPoint, 0);
                direction = { x: this.selectionEndPoint.x, y: this.selectionEndPoint.y - (Math.abs(this.height) / 2 + DEFAULT_VECTOR_START) };
                newStart = this.handleNewPos(this.selectionEndPoint, direction);
                this.adjustRectangle(this.selectionStartPoint, newStart, 1);
                break;
            case HANDLES.seven:
                direction = { x: this.selectionEndPoint.x, y: this.selectionEndPoint.y - (Math.abs(this.height) / 2 + DEFAULT_VECTOR_START) };
                newStart = this.handleNewPos(this.selectionEndPoint, direction);
                this.adjustRectangle(this.selectionStartPoint, newStart, 1);
                break;
            case HANDLES.eight:
                this.adjustRectangle(this.selectionStartPoint, this.currentPos, 1);
                break;
        }
        this.redrawSelection();
        Tool.shouldAlign = true;
    }

    handleNewPos(this: Movable, handleToMove: Vec2, direction: Vec2): Vec2 {
        const handle1to2 = {
            x: this.getRotatedPos(direction).x - this.getRotatedPos(handleToMove).x,
            y: this.getRotatedPos(direction).y - this.getRotatedPos(handleToMove).y,
        } as Vec2;
        const handle1toCurrent = {
            x: this.currentPos.x - this.getRotatedPos(handleToMove).x,
            y: this.currentPos.y - this.getRotatedPos(handleToMove).y,
        } as Vec2;
        const handle1to2Norm = Math.sqrt(handle1to2.x * handle1to2.x + handle1to2.y * handle1to2.y);
        const scalProduct = (handle1toCurrent.x * handle1to2.x + handle1toCurrent.y * handle1to2.y) / (handle1to2Norm * handle1to2Norm);
        const projection1 = {
            x: scalProduct * handle1to2.x,
            y: scalProduct * handle1to2.y,
        } as Vec2;
        const newStart = {
            x: projection1.x + this.getRotatedPos(handleToMove).x,
            y: this.getRotatedPos(handleToMove).y + projection1.y,
        };
        return newStart;
    }

    switchHandlesHorizontal(this: Movable): void {
        this.updateSelectionNodes();
        this.updateResizingHandles();
        this.flipedH = false;
        this.width = Math.abs(this.width);
        switch (this.currenthandle) {
            case HANDLES.one:
                this.currenthandle = HANDLES.three;
                break;
            case HANDLES.three:
                this.currenthandle = HANDLES.one;
                break;
            case HANDLES.six:
                this.currenthandle = HANDLES.eight;
                break;
            case HANDLES.eight:
                this.currenthandle = HANDLES.six;
                break;
            case HANDLES.four:
                this.currenthandle = HANDLES.five;
                break;
            case HANDLES.five:
                this.currenthandle = HANDLES.four;
                break;
        }
    }
    switchHandlesVertical(this: Movable): void {
        this.updateSelectionNodes();
        this.updateResizingHandles();
        this.flipedV = false;
        this.width = Math.abs(this.height);
        switch (this.currenthandle) {
            case HANDLES.two:
                this.currenthandle = HANDLES.seven;
                break;
            case HANDLES.seven:
                this.currenthandle = HANDLES.two;
                break;
            case HANDLES.one:
                this.currenthandle = HANDLES.six;
                break;
            case HANDLES.six:
                this.currenthandle = HANDLES.one;
                break;
            case HANDLES.three:
                this.currenthandle = HANDLES.eight;
                break;
            case HANDLES.eight:
                this.currenthandle = HANDLES.three;
                break;
        }
    }

    mouseDownOnHandle(this: Movable, mousedownpos: Vec2): number {
        for (let i = 0; i < this.resizingHandles.length; i++) {
            if (
                this.getUnrotatedPos(mousedownpos).x >= this.resizingHandles[i].x &&
                this.getUnrotatedPos(mousedownpos).x <= this.resizingHandles[i].x + HANDLE_LENGTH &&
                this.getUnrotatedPos(mousedownpos).y >= this.resizingHandles[i].y &&
                this.getUnrotatedPos(mousedownpos).y <= this.resizingHandles[i].y + HANDLE_LENGTH
            ) {
                return i + 1;
            }
        }
        // mouse not on any handle
        return DEFAULT_HANDLE_INDEX;
    }
}
