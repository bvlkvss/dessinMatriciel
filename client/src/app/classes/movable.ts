import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { RectangleService, RectangleStyle } from '@app/services/tools/rectangle/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionCommand } from './selection-command';

const HANDLE_LENGTH = 6;
const HANDLE_OFFSET = HANDLE_LENGTH / 2;
const MOVEMENT_OFFSET = 3;
const INIT_MOVE_DELAY = 500;
const CONTINUOUS_MOVE_DELAY = 100;
const DEFAULT_DEGREE_STEP = 15;
const PI_DEGREE = 180;
const DEFAULT_VECTOR_START = 10;
export const DEFAULT_HANDLE_INDEX = -1;
enum FLIPCASES {
    vertical = 1,
    horizental = 2,
    diagonal = 3,
}
enum HANDLES {
    one = 1,
    two = 2,
    three = 3,
    four = 4,
    five = 5,
    six = 6,
    seven = 7,
    eight = 8,
}
// tslint:disable:no-empty cause it an abstract class
export abstract class Movable extends Tool {
    ellipseService: EllipseService;
    rectangleService: RectangleService;
    currenthandle: number;
    moveDelayActive: boolean;
    continuousMove: boolean;
    selectionStartPoint: Vec2;
    selectionEndPoint: Vec2;
    firstSelectionMove: boolean;
    offsetX: number;
    offsetY: number;
    keysDown: { [key: string]: boolean };
    width: number;
    height: number;
    resizingHandles: Vec2[];
    degres: number = 0;
    flipedV: boolean = false;
    flipedH: boolean = false;
    flipCase: number = 0;
    selectionData: HTMLCanvasElement;
    selectionCommand: SelectionCommand;
    selectionStyle: number;
    selectionActivated: boolean;
    mouseDownInsideSelection: boolean;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.resizingHandles = [];
        this.keysDown = {};
        this.moveDelayActive = false;
        this.continuousMove = false;
        this.firstSelectionMove = true;
        this.currenthandle = DEFAULT_HANDLE_INDEX;
        this.rectangleService = new RectangleService(drawingService, this.invoker);
        this.rectangleService.setStyle(RectangleStyle.Selection);
        this.rectangleService.lineDash = true;
        this.selectionStyle = 1;
        this.ellipseService = new EllipseService(drawingService, this.invoker);
        this.ellipseService.setStyle(0);
        this.ellipseService.secondaryColor = 'black';
        this.ellipseService.primaryColor = 'black';
        this.selectionActivated = false;
    }

    eraseSelectionFromBase(endPos: Vec2): void {}
    clipImageWithEllipse(): void {}
    resetSelection(): void {}

    protected drawSelectionOnBase(): void {
        const centre = {
            x: (this.selectionStartPoint.x + this.selectionEndPoint.x) / 2,
            y: (this.selectionStartPoint.y + this.selectionEndPoint.y) / 2,
        };
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.translate(centre.x, centre.y);
        this.drawingService.baseCtx.rotate((this.degres * Math.PI) / PI_DEGREE);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.selectionStyle === 1) {
            this.clipImageWithEllipse();
        } else {
            this.drawingService.baseCtx.drawImage(this.selectionData, -this.width / 2, -this.height / 2, this.width, this.height);
        }
        if (this.selectionCommand) {
            this.selectionCommand.setStartPos(this.selectionStartPoint);
            this.selectionCommand.setEndPos(this.selectionEndPoint);
            this.selectionCommand.setSelectionStyle(this.selectionStyle);
            this.selectionCommand.setSize(this.width, this.height);
            this.selectionCommand.setCanvas(this.selectionData);
            this.invoker.addToUndo(this.selectionCommand);
            this.invoker.setIsAllowed(true);
        }
        this.drawingService.baseCtx.restore();
        this.resetSelection();
        this.selectionActivated = false;
    }

    updateSelectionNodes(): number {
        let i = 0;
        if (this.selectionEndPoint.y < this.selectionStartPoint.y) {
            this.selectionEndPoint.y = this.selectionStartPoint.y;
            this.selectionStartPoint.y -= Math.abs(this.height);
            i++;
        }
        if (this.selectionEndPoint.x < this.selectionStartPoint.x) {
            this.selectionEndPoint.x = this.selectionStartPoint.x;
            this.selectionStartPoint.x -= Math.abs(this.width);
            i += 2;
        }
        return i;
    }

    checkFlip(): number {
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

    getRotatedGeniric(point: Vec2, centre: Vec2, angle: number): Vec2 {
        return {
            x: (point.x - centre.x) * Math.cos(angle) - (point.y - centre.y) * Math.sin(angle) + centre.x,
            y: (point.x - centre.x) * Math.sin(angle) + (point.y - centre.y) * Math.cos(angle) + centre.y,
        };
    }

    getUnrotatedPos(element: Vec2): Vec2 {
        const tempX = element.x - (this.selectionStartPoint.x + this.width / 2);
        const tempY = element.y - (this.selectionStartPoint.y + this.height / 2);
        const rotatedX = tempX * Math.cos((this.degres * Math.PI) / PI_DEGREE) + tempY * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        const rotatedY = tempY * Math.cos((this.degres * Math.PI) / PI_DEGREE) - tempX * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        return { x: rotatedX + this.selectionStartPoint.x + this.width / 2, y: rotatedY + this.selectionStartPoint.y + this.height / 2 } as Vec2;
    }

    getRotatedPos(element: Vec2): Vec2 {
        const tempX = element.x - (this.selectionStartPoint.x + this.width / 2);
        const tempY = element.y - (this.selectionStartPoint.y + this.height / 2);
        const rotatedX = tempX * Math.cos((this.degres * Math.PI) / PI_DEGREE) - tempY * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        const rotatedY = tempY * Math.cos((this.degres * Math.PI) / PI_DEGREE) + tempX * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        return {
            x: rotatedX + this.selectionStartPoint.x + this.width / 2,
            y: rotatedY + this.selectionStartPoint.y + this.height / 2,
        } as Vec2;
    }

    flipSelection(): void {
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

    flipData(translateVec: Vec2, scale: Vec2): void {
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

    moveSelection(endpoint: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.selectionStartPoint = { x: endpoint.x - this.offsetX, y: endpoint.y - this.offsetY };
        this.selectionEndPoint = {
            x: this.selectionStartPoint.x + this.width,
            y: this.selectionStartPoint.y + this.height,
        };
    }

    async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async moveSelectionWithKeys(): Promise<void> {
        this.offsetX = 0;
        this.offsetY = 0;

        if (!this.moveDelayActive) {
            this.moveDelayActive = true;
            if (this.keysDown.ArrowRight) {
                this.selectionStartPoint.x += MOVEMENT_OFFSET;
            }
            if (this.keysDown.ArrowLeft) {
                this.selectionStartPoint.x -= MOVEMENT_OFFSET;
            }
            if (this.keysDown.ArrowUp) {
                this.selectionStartPoint.y -= MOVEMENT_OFFSET;
            }

            if (this.keysDown.ArrowDown) {
                this.selectionStartPoint.y += MOVEMENT_OFFSET;
            }

            this.moveSelection(this.selectionStartPoint);
            if (!this.continuousMove) {
                await this.delay(INIT_MOVE_DELAY);
                this.continuousMove = true;
            } else await this.delay(CONTINUOUS_MOVE_DELAY);
            this.moveDelayActive = false;
        }
    }

    updateResizingHandles(): void {
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

    drawResizingHandles(): void {
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

    resizeSelection(): void {
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
                console.log(this.currentPos);
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
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.rectangleService.drawRectangle(this.drawingService.previewCtx, this.selectionStartPoint, this.selectionEndPoint, false);
        this.redrawSelection();
    }

    private handleNewPos(handleToMove: Vec2, direction: Vec2): Vec2 {
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

    adjustRectangle(start: Vec2, end: Vec2, startOrEnd: number): void {
        const oldCenter = {
            x: (this.selectionStartPoint.x + this.selectionEndPoint.x) / 2,
            y: (this.selectionStartPoint.y + this.selectionEndPoint.y) / 2,
        };
        const rotatedStart = startOrEnd === 0 ? start : this.getRotatedGeniric(start, oldCenter, (this.degres * Math.PI) / PI_DEGREE);
        const rotatedEnd = startOrEnd === 1 ? end : this.getRotatedGeniric(end, oldCenter, (this.degres * Math.PI) / PI_DEGREE);
        const newCenter = { x: (rotatedStart.x + rotatedEnd.x) / 2, y: (rotatedEnd.y + rotatedStart.y) / 2 };
        const newStart = this.getRotatedGeniric(rotatedStart, newCenter, -((this.degres * Math.PI) / PI_DEGREE));
        const newEnd = this.getRotatedGeniric(rotatedEnd, newCenter, -((this.degres * Math.PI) / PI_DEGREE));
        this.selectionStartPoint = newStart;
        this.selectionEndPoint = newEnd;
    }

    updateDegree(event: WheelEvent, alt: boolean): void {
        if (event.deltaY < 0) {
            if (alt) {
                ++this.degres;
            } else {
                this.degres += DEFAULT_DEGREE_STEP;
            }
        } else if (event.deltaY > 0) {
            if (alt) {
                --this.degres;
            } else {
                this.degres -= DEFAULT_DEGREE_STEP;
            }
        }
    }

    redrawSelection(redrawAfterRotate: boolean = false): void {
        if (this.firstSelectionMove) {
            this.selectionCommand = new SelectionCommand(this.selectionStartPoint, this, this.drawingService);
            this.selectionCommand.setEndPosErase(this.selectionEndPoint);
            this.eraseSelectionFromBase(this.selectionEndPoint);
        }
        this.width = this.selectionEndPoint.x - this.selectionStartPoint.x;
        this.height = this.selectionEndPoint.y - this.selectionStartPoint.y;

        if (this.rectangleService.toSquare) {
            if (this.currenthandle === HANDLES.one || this.currenthandle === HANDLES.four || this.currenthandle === HANDLES.six) {
                this.selectionStartPoint.x += this.width - Math.min(this.width, this.height);
            }
            if (this.currenthandle === HANDLES.one || this.currenthandle === HANDLES.two || this.currenthandle === HANDLES.three) {
                this.selectionStartPoint.y += this.height - Math.min(this.width, this.height);
            }
            this.width = Math.min(this.width, this.height);
            this.height = this.width;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.save();
        const posx = -this.width / 2;
        const posy = -this.height / 2;
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.translate(this.selectionStartPoint.x + this.width / 2, this.selectionStartPoint.y + this.height / 2);
        this.drawingService.previewCtx.rotate((this.degres * Math.PI) / PI_DEGREE);
        if (this.selectionStyle === 1) {
            this.ellipseService.drawEllipse(
                this.drawingService.previewCtx,
                {
                    x: -this.width / 2,
                    y: -this.height / 2,
                } as Vec2,
                {
                    x: this.width / 2,
                    y: this.height / 2,
                } as Vec2,
                false,
                false,
            );
            this.drawingService.previewCtx.clip();
        }

        if (!redrawAfterRotate) {
            this.flipSelection();
        }
        this.drawingService.previewCtx.drawImage(this.selectionData, posx, posy, this.width, this.height);
        this.rectangleService.drawRectangle(
            this.drawingService.previewCtx,
            {
                x: -posx,
                y: -posy,
            } as Vec2,
            {
                x: posx,
                y: posy,
            } as Vec2,
            false,
        );
        this.drawingService.previewCtx.restore();
        this.drawingService.previewCtx.restore();
        this.updateResizingHandles();
        this.drawResizingHandles();
    }

    mouseDownOnHandle(mousedownpos: Vec2): number {
        for (let i = 0; i < this.resizingHandles.length; i++) {
            if (
                this.getUnrotatedPos(mousedownpos).x >= this.resizingHandles[i].x &&
                this.getUnrotatedPos(mousedownpos).x <= this.resizingHandles[i].x + HANDLE_LENGTH &&
                this.getUnrotatedPos(mousedownpos).y >= this.resizingHandles[i].y &&
                this.getUnrotatedPos(mousedownpos).y <= this.resizingHandles[i].y + HANDLE_LENGTH
            ) {
                console.log('handle = ', i + 1);
                return i + 1;
            }
        }
        // mouse not on any handle
        return DEFAULT_HANDLE_INDEX;
    }
}
