import { Injectable } from '@angular/core';
import { Movable } from '@app/classes/movable';
import { DEFAULT_HANDLE_INDEX } from '@app/classes/resizable';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService, RectangleStyle } from '@app/services/tools/rectangle/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Movable {
    mouseUpCoord: Vec2;
    selectionActivated: boolean;
    selectionCanvas: HTMLCanvasElement;
    width: number;
    height: number;
    selectionStyle: number;
    hFlip: boolean;
    vFlip: boolean;
    hScale: number;
    vScale: number;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService, invoker);
        this.selectionActivated = false;
        this.toolAttributes = ['typeSelection'];
        this.hFlip = false;
        this.vFlip = false;
        this.hScale = 1;
        this.vScale = 1;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.drawingService.previewCtx.shadowColor = 'white';
            this.drawingService.previewCtx.shadowOffsetX = 1;
            this.drawingService.previewCtx.shadowOffsetY = 1;
            this.mouseDownCoord = this.getPositionFromMouse(event);
            if (this.selectionActivated) {
                const mouseDownUnrotated = this.getUnrotatedPos(this.mouseDownCoord);
                if (this.mouseDownOnHandle(this.mouseDownCoord) !== DEFAULT_HANDLE_INDEX) {
                    this.currenthandle = this.mouseDownOnHandle(this.mouseDownCoord);
                    this.invoker.ClearRedo();
                    this.invoker.setIsAllowed(false);
                    return;
                } else if (
                    mouseDownUnrotated.x >= this.selectionStartPoint.x &&
                    mouseDownUnrotated.x <= this.selectionEndPoint.x &&
                    mouseDownUnrotated.y >= this.selectionStartPoint.y &&
                    mouseDownUnrotated.y <= this.selectionEndPoint.y
                ) {
                    this.invoker.ClearRedo();
                    this.invoker.setIsAllowed(false);
                    this.mouseDownInsideSelection = true;
                    this.mouseDown = false;
                    this.offsetX = this.mouseDownCoord.x - this.selectionStartPoint.x;
                    this.offsetY = this.mouseDownCoord.y - this.selectionStartPoint.y;
                    return;
                } else {
                    this.drawSelectionOnBase();
                    this.degres = 0;
                }
            }
            this.selectionStartPoint = this.getPositionFromMouse(event);
            this.rectangleService.onMouseDown(event, true);
        }
    }

    saveSelection(): void {
        const temp = document.createElement('canvas') as HTMLCanvasElement;
        const width = Math.abs(this.rectangleService.width);
        const height = Math.abs(this.rectangleService.height);
        const tempCtx = temp.getContext('2d') as CanvasRenderingContext2D;
        tempCtx.canvas.height = height;
        tempCtx.canvas.width = width;
        tempCtx.drawImage(
            this.drawingService.baseCtx.canvas,
            this.selectionStartPoint.x,
            this.selectionStartPoint.y,
            width,
            height,
            0,
            0,
            width,
            height,
        );
        this.selectionData = temp;
    }

    onMouseOut(event: MouseEvent): void {
        this.rectangleService.onMouseOut(event);
        if (this.mouseDown) {
            if (this.selectionStyle === 1 && !this.selectionActivated)
                this.ellipseService.drawEllipse(
                    this.drawingService.previewCtx,
                    this.selectionStartPoint,
                    this.rectangleService.mouseOutCoord,
                    this.rectangleService.toSquare,
                    false,
                );
            this.isOut = true;
        }
    }

    onMouseEnter(event: MouseEvent): void {
        if (!this.selectionActivated) this.rectangleService.isOut = false;
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseUpCoord = this.getPositionFromMouse(event);
        if (this.mouseDown && this.mouseUpCoord.x !== this.selectionStartPoint.x && this.mouseUpCoord.y !== this.selectionStartPoint.y) {
            if (!this.selectionActivated && this.rectangleService.isOut) {
                this.selectionEndPoint = this.rectangleService.mouseOutCoord;
            } else if (!this.selectionActivated) {
                this.selectionEndPoint = {
                    x: this.selectionStartPoint.x + this.rectangleService.width,
                    y: this.selectionStartPoint.y + this.rectangleService.height,
                };
            }
            this.width = Math.abs(this.rectangleService.width);
            this.height = Math.abs(this.rectangleService.height);
            this.updateSelectionNodes();
            if (!this.selectionActivated) {
                this.saveSelection();
                if (this.selectionStyle === 0) {
                    this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
                }
                this.rectangleService.drawRectangle(
                    this.drawingService.previewCtx,
                    this.selectionStartPoint,
                    this.selectionEndPoint,
                    this.rectangleService.toSquare,
                );
                this.updateResizingHandles();
                this.drawResizingHandles();
                this.selectionActivated = true;
                this.mouseDown = false;
            }
        }
        this.width = Math.abs(this.width);
        this.height = Math.abs(this.height);
        this.updateSelectionNodes();
        this.updateResizingHandles();
        this.rectangleService.mouseDown = false;
        this.rectangleService.toSquare = false;
        this.mouseDown = false;
        this.mouseDownInsideSelection = false;
        this.flipedH = false;
        this.flipedV = false;
        this.currenthandle = DEFAULT_HANDLE_INDEX;
    }

    onMouseMove(event: MouseEvent): void {
        this.currentPos = this.getPositionFromMouse(event);
        if (this.selectionActivated && this.mouseDown) {
            this.resizeSelection();
            return;
        }

        if (this.mouseDownInsideSelection) {
            this.moveSelection(this.currentPos);
            if (this.selectionStyle === 1) {
                this.ellipseService.secondaryColor = 'black';
                this.ellipseService.setStyle(0);
            }
            this.redrawSelection();
        } else if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleService.onMouseMove(event);
            if (this.selectionStyle === 1)
                this.ellipseService.drawEllipse(
                    this.drawingService.previewCtx,
                    this.selectionStartPoint,
                    this.currentPos,
                    this.rectangleService.toSquare,
                    false,
                );
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.rectangleService.onKeyUp(event);
        if (!event.shiftKey && this.currenthandle !== DEFAULT_HANDLE_INDEX) {
            this.rectangleService.toSquare = false;
            this.resizeSelection();
        }
        if (this.selectionStyle === 1 && !event.shiftKey && this.mouseDown) {
            this.redrawSelection(false, false);
        }
        this.keysDown[event.key] = event.type === 'keydown';
        this.mouseDownInsideSelection = false;
        this.continuousMove = !event.key.includes('Arrow');
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'a') {
            this.selectAllCanvas();
        } else if (event.key === 'Escape') {
            this.drawSelectionOnBase();
        } else {
            this.rectangleService.onKeyDown(event);
            if (this.currenthandle !== DEFAULT_HANDLE_INDEX && event.shiftKey && this.mouseDown) {
                this.rectangleService.toSquare = true;
                this.resizeSelection();
            }
            if (this.selectionStyle === 1 && event.shiftKey && this.mouseDown) {
                this.redrawSelection(false, true);
            }

            this.keysDown[event.key] = event.type === 'keydown';

            if (event.key.includes('Arrow')) {
                event.preventDefault();
                event.stopPropagation();

                this.moveSelectionWithKeys();
                this.redrawSelection();
                if (this.selectionStyle === 1) {
                    this.ellipseService.secondaryColor = 'black';
                    this.ellipseService.setStyle(0);
                    this.ellipseService.drawEllipse(this.drawingService.previewCtx, this.selectionStartPoint, this.selectionEndPoint, false, false);
                }
            }
        }
    }

    resetSelection(): void {
        this.resizingHandles = [];
        this.rectangleService = new RectangleService(this.drawingService, this.invoker);
        this.rectangleService.setStyle(RectangleStyle.Selection);
        this.rectangleService.lineDash = true;
        this.ellipseService.setStyle(0);
        this.selectionActivated = false;
        this.firstSelectionMove = true;
        this.degres = 0;
        Tool.shouldAlign = true;
    }

    selectAllCanvas(): void {
        this.selectionStyle = 0;
        this.selectionStartPoint = { x: 0, y: 0 };
        this.rectangleService.width = this.drawingService.canvas.width;
        this.rectangleService.height = this.drawingService.canvas.height;
        this.width = this.drawingService.canvas.width;
        this.height = this.drawingService.canvas.height;
        this.selectionEndPoint = { x: this.drawingService.canvas.width - 2, y: this.drawingService.canvas.height - 2 };
        this.saveSelection();
        this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
        this.rectangleService.drawRectangle(this.drawingService.previewCtx, this.selectionStartPoint, this.selectionEndPoint, false);
        this.updateResizingHandles();
        this.drawResizingHandles();
        this.selectionActivated = true;
    }

    clipImageWithEllipse(): void {
        this.ellipseService.secondaryColor = 'rgba(255,255,255,0)';
        this.ellipseService.drawEllipse(
            this.drawingService.baseCtx,
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
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.clip();
        this.drawingService.baseCtx.drawImage(this.selectionData, -this.width / 2, -this.height / 2, this.width, this.height);
        this.drawingService.baseCtx.restore();
        this.ellipseService.secondaryColor = 'black';
    }

    eraseSelectionFromBase(endPos: Vec2): void {
        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.fillStyle = 'white';
        switch (this.selectionStyle) {
            case 0:
                this.drawingService.baseCtx.rect(this.selectionStartPoint.x, this.selectionStartPoint.y, this.width, this.height);
                break;
            case 1:
                this.ellipseService.setStyle(2);
                this.ellipseService.primaryColor = 'white';
                let toCircle = false;
                if (this.height === this.width) toCircle = true;
                this.ellipseService.drawEllipse(this.drawingService.baseCtx, this.selectionStartPoint, endPos, toCircle, false);
                break;
        }

        this.drawingService.baseCtx.fill();
        this.drawingService.baseCtx.closePath();
        this.firstSelectionMove = false;
    }
}
