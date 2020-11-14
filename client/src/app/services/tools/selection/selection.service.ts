import { Injectable } from '@angular/core';
import { Movable } from '@app/classes/movable';
import { SelectionCommand } from '@app/classes/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { RectangleService, RectangleStyle } from '@app/services/tools/rectangle/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
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
const HANDLE_LENGTH = 6;
const DEFAULT_HANDLE_INDEX = -1;

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Movable {
    rectangleService: RectangleService;
    ellipseService: EllipseService;
    mouseUpCoord: Vec2;
    mouseDownInsideSelection: boolean;

    selectionCommand: SelectionCommand;
    selectionActivated: boolean;
    selectionData: HTMLCanvasElement;
    currenthandle: number;
    width: number;
    height: number;
    selectionStyle: number;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);

        this.selectionStyle = 1;
        this.rectangleService = new RectangleService(drawingService, this.invoker);
        this.rectangleService.setStyle(RectangleStyle.Selection);
        this.rectangleService.lineDash = true;
        this.ellipseService = new EllipseService(drawingService, this.invoker);
        this.ellipseService.setStyle(0);
        this.ellipseService.secondaryColor = 'black';
        this.ellipseService.primaryColor = 'black';
        this.selectionActivated = false;
        this.toolAttributes = [];
        this.currenthandle = DEFAULT_HANDLE_INDEX;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.drawingService.previewCtx.shadowColor = 'white';
            this.drawingService.previewCtx.shadowOffsetX = 1;
            this.drawingService.previewCtx.shadowOffsetY = 1;
            this.mouseDownCoord = this.getPositionFromMouse(event);

            if (this.selectionActivated) {
                console.log('here');
                if (this.mouseDownOnHandle(this.mouseDownCoord) !== DEFAULT_HANDLE_INDEX) {
                    console.log('on handle');
                    this.currenthandle = this.mouseDownOnHandle(this.mouseDownCoord);
                    this.invoker.ClearRedo();
                    this.invoker.setIsAllowed(false);
                    return;
                } else if (this.IsinsideSelection()) {
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
    private IsinsideSelection(): boolean {
        return (
            this.mouseDownCoord.x >= this.selectionStartPoint.x &&
            this.mouseDownCoord.x <= this.selectionEndPoint.x &&
            this.mouseDownCoord.y >= this.selectionStartPoint.y &&
            this.mouseDownCoord.y <= this.selectionEndPoint.y
        );
    }

    private drawSelectionOnBase(): void {
        const x = this.signe.x < 0 ? this.selectionStartPoint.x : this.selectionEndPoint.x;
        const y = this.signe.y < 0 ? this.selectionStartPoint.y : this.selectionEndPoint.y;
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.translate(x + this.rectangleService.width / 2, y + this.rectangleService.height / 2);
        this.drawingService.baseCtx.rotate((this.degres * Math.PI) / 180);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        //this.drawingService.baseCtx.save();
        if (this.selectionStyle === 1) {
            this.clipImageWithEllipse();
        } else {
            this.drawingService.baseCtx.drawImage(
                this.selectionData,
                (this.signe.x * this.rectangleService.width) / 2,
                (this.signe.y * this.rectangleService.height) / 2,
                Math.abs(this.rectangleService.width),
                Math.abs(this.rectangleService.height),
            );
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
        //this.drawingService.baseCtx.restore();

        this.resetSelection();
        this.selectionActivated = false;
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
            } else {
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
                this.updateSelection();
                this.updateResizingHandles();
                this.selectionActivated = true;
                this.mouseDown = false;
                console.log(this.selectionActivated);
            }
        }
        this.rectangleService.mouseDown = false;
        this.rectangleService.toSquare = false;
        this.mouseDown = false;
        this.mouseDownInsideSelection = false;
    }

    updateSelection(): void {
        const x = this.signe.x < 0 ? this.selectionStartPoint.x : this.selectionEndPoint.x;
        const y = this.signe.y < 0 ? this.selectionStartPoint.y : this.selectionEndPoint.y;
        this.drawingService.previewCtx.save();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.translate(x + this.rectangleService.width / 2, y + this.rectangleService.height / 2);
        this.drawingService.previewCtx.rotate((this.degres * Math.PI) / 180);
        if (this.selectionStyle === 1) {
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.translate(x + this.rectangleService.width / 2, y + this.rectangleService.height / 2);
            this.drawingService.baseCtx.rotate((this.degres * Math.PI) / 180);
            this.clipImageWithEllipse();
            this.drawingService.baseCtx.restore();
        } else {
            this.drawingService.previewCtx.drawImage(
                this.selectionData,
                (this.signe.x * this.rectangleService.width) / 2,
                (this.signe.y * this.rectangleService.height) / 2,
                Math.abs(this.rectangleService.width),
                Math.abs(this.rectangleService.height),
            );
        }
        this.rectangleService.drawRectangle(
            this.drawingService.previewCtx,
            {
                x: -this.rectangleService.width / 2,
                y: -this.rectangleService.height / 2,
            } as Vec2,
            {
                x: this.rectangleService.width / 2,
                y: this.rectangleService.height / 2,
            } as Vec2,
            false,
        );
        this.SetHandlesCentreReference();
        this.updateResizingHandles();
        this.drawRotatedHandles();
        this.drawingService.previewCtx.restore();
    }

    onMouseMove(event: MouseEvent): void {
        this.currentPos = this.getPositionFromMouse(event);
        if (this.selectionActivated && this.mouseDown) {
            this.resizeSelection();
            const x = this.signe.x < 0 ? this.selectionStartPoint.x : this.selectionEndPoint.x;
            const y = this.signe.y < 0 ? this.selectionStartPoint.y : this.selectionEndPoint.y;
            this.drawingService.previewCtx.save();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.translate(x + this.rectangleService.width / 2, y + this.rectangleService.height / 2);
            this.drawingService.previewCtx.rotate((this.degres * Math.PI) / 180);
            this.ellipseService.setStyle(0);
            if (this.selectionStyle === 1)
                this.ellipseService.drawEllipse(
                    this.drawingService.previewCtx,
                    this.selectionStartPoint,
                    this.currentPos,
                    this.rectangleService.toSquare,
                    false,
                );
            this.updateResizingHandles();
            this.drawResizingHandles();
            this.drawingService.previewCtx.restore();
            this.redrawSelection();
            return;
        }
        if (this.mouseDownInsideSelection) {
            this.moveSelection(this.currentPos);

            // this.redrawSelection();
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

    redrawSelection(): void {
        if (this.firstSelectionMove) {
            this.selectionCommand = new SelectionCommand(this.selectionStartPoint, this, this.drawingService);
            this.selectionCommand.setEndPosErase(this.selectionEndPoint);
            this.eraseSelectionFromBase(this.selectionEndPoint);
        }
        const x = this.signe.x < 0 ? this.selectionStartPoint.x : this.selectionEndPoint.x;
        const y = this.signe.y < 0 ? this.selectionStartPoint.y : this.selectionEndPoint.y;
        this.drawingService.previewCtx.save();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.translate(x + this.rectangleService.width / 2, y + this.rectangleService.height / 2);
        this.drawingService.previewCtx.rotate((this.degres * Math.PI) / 180);
        this.drawingService.previewCtx.save();
        if (this.selectionStyle === 1)
            this.ellipseService.drawEllipse(
                this.drawingService.previewCtx,
                {
                    x: -this.rectangleService.width / 2,
                    y: -this.rectangleService.height / 2,
                } as Vec2,
                {
                    x: this.rectangleService.width / 2,
                    y: this.rectangleService.height / 2,
                } as Vec2,
                false,
                false,
            );
        this.drawingService.previewCtx.clip();
        this.drawingService.previewCtx.drawImage(
            this.selectionData,
            (this.signe.x * this.rectangleService.width) / 2,
            (this.signe.y * this.rectangleService.height) / 2,
            Math.abs(this.rectangleService.width),
            Math.abs(this.rectangleService.height),
        );
        this.drawingService.previewCtx.restore();
        this.width = this.selectionEndPoint.x - this.selectionStartPoint.x;
        this.height = this.selectionEndPoint.y - this.selectionStartPoint.y;
        this.SetHandlesCentreReference();
        this.updateResizingHandles();
        this.drawResizingHandles();
        this.rectangleService.drawRectangle(
            this.drawingService.previewCtx,
            {
                x: -this.rectangleService.width / 2,
                y: -this.rectangleService.height / 2,
            } as Vec2,
            {
                x: this.rectangleService.width / 2,
                y: this.rectangleService.height / 2,
            } as Vec2,
            false,
        );
        if (this.selectionStyle === 1) {
            this.ellipseService.secondaryColor = 'black';
            this.ellipseService.setStyle(0);
            this.ellipseService.drawEllipse(
                this.drawingService.previewCtx,
                {
                    x: -this.rectangleService.width / 2,
                    y: -this.rectangleService.height / 2,
                } as Vec2,
                {
                    x: this.rectangleService.width / 2,
                    y: this.rectangleService.height / 2,
                } as Vec2,
                false,
                false,
            );
        }
        this.drawingService.previewCtx.restore();
        // this.drawingService.previewCtx.restore();
    }

    mouseDownOnHandle(mousedownpos: Vec2): number {
        console.log('FUNCTION CALLED');
        for (let i = 0; i < this.resizingHandles.length; i++) {
            const temp = this.getRotatedHandlePos(this.resizingHandles[i]);
            if (
                mousedownpos.x >= temp.x &&
                mousedownpos.x <= temp.x + HANDLE_LENGTH &&
                mousedownpos.y >= temp.y &&
                mousedownpos.y <= temp.y + HANDLE_LENGTH
            ) {
                console.log('FOUND HANDLE', i + 1);
                return i + 1;
            }
        }
        // mouse not on any handle
        return DEFAULT_HANDLE_INDEX;
    }

    onKeyUp(event: KeyboardEvent): void {
        this.rectangleService.onKeyUp(event);
        if (this.selectionStyle === 1 && !event.shiftKey && this.mouseDown) {
            this.ellipseService.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.rectangleService.toSquare);
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

            if (this.selectionStyle === 1 && event.shiftKey && this.mouseDown) {
                this.ellipseService.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.rectangleService.toSquare);
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
        // this.selectionStyle=0;
        this.rectangleService.setStyle(RectangleStyle.Selection);
        this.rectangleService.lineDash = true;
        this.ellipseService.setStyle(0);
        this.selectionActivated = false;
        this.toolAttributes = [];
        this.firstSelectionMove = true;
    }

    selectAllCanvas(): void {
        this.selectionStyle = 0;
        this.selectionStartPoint = { x: 0, y: 0 };
        this.rectangleService.width = this.drawingService.canvas.width;
        this.rectangleService.height = this.drawingService.canvas.height;
        this.width = this.drawingService.canvas.width;
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
                x: -this.rectangleService.width / 2,
                y: -this.rectangleService.height / 2,
            } as Vec2,
            {
                x: this.rectangleService.width / 2,
                y: this.rectangleService.height / 2,
            } as Vec2,
            false,
            false,
        );
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.clip();
        this.drawingService.baseCtx.drawImage(
            this.selectionData,
            (this.signe.x * this.rectangleService.width) / 2,
            (this.signe.y * this.rectangleService.height) / 2,
            Math.abs(this.rectangleService.width),
            Math.abs(this.rectangleService.height),
        );
        this.drawingService.baseCtx.restore();
        this.ellipseService.secondaryColor = 'black';
    }

    resizeSelection(): void {
        switch (this.currenthandle) {
            case HANDLES.one:
                this.selectionStartPoint = this.currentPos;
                break;
            case HANDLES.two:
                this.selectionStartPoint.y = this.currentPos.y;
                break;
            case HANDLES.three:
                this.selectionStartPoint.y = this.currentPos.y;
                this.selectionEndPoint.x = this.currentPos.x;
                break;
            case HANDLES.four:
                this.selectionStartPoint.x = this.currentPos.x;
                break;
            case HANDLES.five:
                this.selectionEndPoint.x = this.currentPos.x;
                break;
                this.rectangleService.drawRectangle(this.drawingService.previewCtx, this.selectionStartPoint, this.selectionEndPoint, false);
                this.selectionEndPoint.y = this.currentPos.y;
                break;
            case HANDLES.seven:
                this.selectionEndPoint.y = this.currentPos.y;
                break;
            case HANDLES.eight:
                this.selectionEndPoint = this.currentPos;
                break;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.rectangleService.drawRectangle(this.drawingService.previewCtx, this.selectionStartPoint, this.selectionEndPoint, false);
        this.redrawSelection();
    }

    eraseSelectionFromBase(endPos: Vec2): void {
        console.log('called');
        if (endPos) {
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
}
