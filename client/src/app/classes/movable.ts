import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { MagicWandSelection } from '@app/services/tools/magic-wand/magic-wand-selection';
import { RectangleService, RectangleStyle } from '@app/services/tools/rectangle/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DEFAULT_HANDLE_INDEX, HANDLES, HANDLE_OFFSET, Resizable } from './resizable';
import { PI_DEGREE, Rotationable } from './rotationable';
import { SelectionCommand } from './selection-command';

const DEFAULT_MOVEMENT_OFFSET = 3;
const INIT_MOVE_DELAY = 500;
const CONTINUOUS_MOVE_DELAY = 100;

// tslint:disable:no-empty cause it an abstract class
export abstract class Movable extends Tool implements Rotationable, Resizable {
    static magnetismActivated: boolean = false;
    static magnetismAnchorPoint: number;
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
    magicSelectionObj: MagicWandSelection;
    deltaX: number;
    deltaY: number;
    tmpAlignmentPoint: Vec2;

    getRotatedGeniric: (point: Vec2, centre: Vec2, angle: number) => Vec2 = Rotationable.prototype.getRotatedGeniric;
    getUnrotatedPos: (element: Vec2) => Vec2 = Rotationable.prototype.getUnrotatedPos;
    getRotatedPos: (element: Vec2) => Vec2 = Rotationable.prototype.getRotatedPos;
    updateDegree: (event: WheelEvent) => void = Rotationable.prototype.updateDegree;
    checkFlip: () => number = Resizable.prototype.checkFlip;
    flipSelection: () => void = Resizable.prototype.flipSelection;
    flipData: (translateVec: Vec2, scale: Vec2) => void = Resizable.prototype.flipData;
    updateResizingHandles: () => void = Resizable.prototype.updateResizingHandles;
    resizeSelection: () => void = Resizable.prototype.resizeSelection;
    drawResizingHandles: () => void = Resizable.prototype.drawResizingHandles;
    handleNewPos: (handleToMove: Vec2, direction: Vec2) => Vec2 = Resizable.prototype.handleNewPos;
    mouseDownOnHandle: (mousedownpos: Vec2) => number = Resizable.prototype.mouseDownOnHandle;
    switchHandlesHorizontal: () => void = Resizable.prototype.switchHandlesHorizontal;
    switchHandlesVertical: () => void = Resizable.prototype.switchHandlesVertical;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.resizingHandles = [];
        this.keysDown = {};
        this.moveDelayActive = false;
        this.continuousMove = false;
        this.firstSelectionMove = true;
        Movable.magnetismAnchorPoint = 1;
        this.currenthandle = DEFAULT_HANDLE_INDEX;
        this.rectangleService = new RectangleService(drawingService, this.invoker);
        this.rectangleService.setStyle(RectangleStyle.Selection);
        this.rectangleService.lineDash = true;
        this.selectionStyle = 1;
        this.ellipseService = new EllipseService(drawingService, this.invoker);
        this.ellipseService.setStyle(0);
        this.ellipseService.secondaryColor = 'black';
        this.ellipseService.primaryColor = 'black';
        this.ellipseService.lineDash = true;
        this.selectionActivated = false;
        this.deltaY = 0;
        this.deltaX = 0;
        Tool.shouldAlign = true;
    }

    eraseSelectionFromBase(endPos: Vec2): void {}
    clipImageWithEllipse(): void {}
    resetSelection(): void {}
    eraseSelectionOnDelete(): void {}

    clearPreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    drawSelectionOnBase(): void {
        if (this.selectionActivated) {
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

    moveSelection(endpoint: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectionStartPoint = { x: endpoint.x - this.offsetX, y: endpoint.y - this.offsetY };

        if (Movable.magnetismActivated) {
            this.updateResizingHandles();
            switch (Movable.magnetismAnchorPoint) {
                case HANDLES.one:
                    this.tmpAlignmentPoint = this.getRotatedPos(this.selectionStartPoint);
                    break;
                case HANDLES.two:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.two);
                    break;
                case HANDLES.three:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.three);
                    break;
                case HANDLES.four:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.four);
                    break;
                case HANDLES.five:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.five);
                    break;
                case HANDLES.six:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.six);
                    break;
                case HANDLES.seven:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.seven);
                    break;
                case HANDLES.eight:
                    this.tmpAlignmentPoint = this.getRotatedAlignementPoint(HANDLES.eight);
                    break;
                case HANDLES.center:
                    this.tmpAlignmentPoint = {
                        x: this.getRotatedPos(this.resizingHandles[HANDLES.two - 1]).x + HANDLE_OFFSET,
                        y: this.getRotatedPos(this.resizingHandles[HANDLES.four - 1]).y + HANDLE_OFFSET,
                    };
                    break;
            }
            if (Tool.shouldAlign) {
                this.deltaX = this.selectionStartPoint.x - this.tmpAlignmentPoint.x;
                this.deltaY = this.selectionStartPoint.y - this.tmpAlignmentPoint.y;
                Tool.shouldAlign = false;
            }
            if (this.tmpAlignmentPoint.x % GridService.squareSize === 0 && this.tmpAlignmentPoint.y % GridService.squareSize === 0) {
                return;
            }
            this.tmpAlignmentPoint = {
                x: Math.round(this.tmpAlignmentPoint.x / GridService.squareSize) * GridService.squareSize,
                y: Math.round(this.tmpAlignmentPoint.y / GridService.squareSize) * GridService.squareSize,
            };
            this.selectionStartPoint.x = this.deltaX + this.tmpAlignmentPoint.x;
            this.selectionStartPoint.y = this.deltaY + this.tmpAlignmentPoint.y;
        }
        this.selectionEndPoint = {
            x: this.selectionStartPoint.x + this.width,
            y: this.selectionStartPoint.y + this.height,
        };
    }

    private getRotatedAlignementPoint(handle: number): Vec2 {
        return {
            x: this.getRotatedPos(this.resizingHandles[handle - 1]).x + HANDLE_OFFSET,
            y: this.getRotatedPos(this.resizingHandles[handle - 1]).y + HANDLE_OFFSET,
        };
    }

    async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async moveSelectionWithKeys(): Promise<void> {
        this.offsetX = 0;
        this.offsetY = 0;
        const movementOffset = Movable.magnetismActivated ? GridService.squareSize : DEFAULT_MOVEMENT_OFFSET;

        if (!this.moveDelayActive) {
            this.moveDelayActive = true;
            if (this.keysDown.ArrowRight) {
                this.selectionStartPoint.x += movementOffset;
                this.selectionEndPoint.x += movementOffset;
            }
            if (this.keysDown.ArrowLeft) {
                this.selectionStartPoint.x -= movementOffset;
                this.selectionEndPoint.x -= movementOffset;
            }
            if (this.keysDown.ArrowUp) {
                this.selectionStartPoint.y -= movementOffset;
                this.selectionEndPoint.y -= movementOffset;
            }
            if (this.keysDown.ArrowDown) {
                this.selectionStartPoint.y += movementOffset;
                this.selectionEndPoint.y += movementOffset;
            }

            this.moveSelection(this.selectionStartPoint);

            if (!this.continuousMove) {
                await this.delay(INIT_MOVE_DELAY);
                this.continuousMove = true;
            } else await this.delay(CONTINUOUS_MOVE_DELAY);
            this.moveDelayActive = false;
        }
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

    redrawSelection(redrawAfterRotate: boolean = false, toSquare: boolean = false): void {
        if (this.firstSelectionMove) {
            this.selectionCommand = new SelectionCommand(this.selectionStartPoint, this, this.drawingService);
            this.selectionCommand.setEndPosErase(this.selectionEndPoint);
            this.eraseSelectionFromBase(this.selectionEndPoint);
            this.invoker.setIsAllowed(false);
        }
        this.width = this.selectionEndPoint.x - this.selectionStartPoint.x;
        this.height = this.selectionEndPoint.y - this.selectionStartPoint.y;
        if (this.rectangleService.toSquare) {
            if (this.flipedH) {
                this.switchHandlesHorizontal();
            }

            if (this.flipedV) {
                this.switchHandlesVertical();
            }

            if (this.currenthandle === HANDLES.one || this.currenthandle === HANDLES.four || this.currenthandle === HANDLES.six) {
                this.selectionStartPoint.x += this.width - Math.min(this.width, this.height);
            }
            if (this.currenthandle === HANDLES.one || this.currenthandle === HANDLES.two || this.currenthandle === HANDLES.three) {
                this.selectionStartPoint.y += this.height - Math.min(this.width, this.height);
            }
            if (Math.abs(this.width) > Math.abs(this.height)) {
                this.width = this.height * Math.sign(this.height) * Math.sign(this.width);
            } else {
                this.height = this.width * Math.sign(this.width) * Math.sign(this.height);
            }
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.save();
        const posx = -this.width / 2;
        const posy = -this.height / 2;
        this.drawingService.previewCtx.translate(this.selectionStartPoint.x + this.width / 2, this.selectionStartPoint.y + this.height / 2);
        this.drawingService.previewCtx.rotate((this.degres * Math.PI) / PI_DEGREE);
        this.drawingService.previewCtx.save();
        if (this.selectionStyle === 1) {
            this.ellipseService.setStyle(0);
            this.ellipseService.drawEllipse(
                this.drawingService.previewCtx,
                {
                    x: -posx,
                    y: -posy,
                } as Vec2,
                {
                    x: posx,
                    y: posy,
                } as Vec2,
                toSquare,
                false,
            );
            this.drawingService.previewCtx.clip();
        }
        if (!redrawAfterRotate) {
            this.flipSelection();
        }
        this.drawingService.previewCtx.drawImage(this.selectionData, posx, posy, this.width, this.height);
        this.drawingService.previewCtx.restore();
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
        this.updateResizingHandles();
        this.drawResizingHandles();
    }
}
