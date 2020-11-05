import { Injectable } from '@angular/core';
import { PolygonCommand } from '@app/classes/polygon-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum polygonStyle {
    Empty = 0,
    Filled_contour = 1,
    Filled = 2,
}

const MINIMUM_NUMBER_OF_SIDES = 3;
const PREVIEW_CIRCLE_LINE_WIDTH = 3;
const PREVIEW_CIRCLE_LINE_DASH_MIN = 5;
const PREVIEW_CIRCLE_LINE_DASH_MAX = 15;

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Tool {
    isOut: boolean = false;
    numberSides: number = 3;
    currentPos: Vec2;
    startPos: Vec2;
    polygonStyle: polygonStyle;

    widthPolygon: number = 0;
    heightPolygon: number = 0;
    incertitude: number = 0;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toolAttributes = ['strokeWidth', 'polygonStyle'];
        this.polygonStyle = 2;
        this.lineWidth = 1;
        this.primaryColor = '#000000';
        this.secondaryColor = '#000000';
    }

    setNumberSides(newNumberSides: number): void {
        this.numberSides = newNumberSides;
    }

    setStyle(id: number): void {
        this.polygonStyle = id;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }
    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }
    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) {
            this.isOut = true;

            this.mouseOutCoord = this.getPositionFromMouse(event);
            if (this.mouseOutCoord.x > this.drawingService.previewCtx.canvas.width) {
                this.mouseOutCoord.x = this.drawingService.canvas.width;
            } else if (this.mouseOutCoord.x < 0) {
                this.mouseOutCoord.x = 0;
            }
            if (this.mouseOutCoord.y > this.drawingService.previewCtx.canvas.height) {
                this.mouseOutCoord.y = this.drawingService.canvas.height;
            } else if (this.mouseOutCoord.y < 0) {
                this.mouseOutCoord.y = 0;
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.mouseOutCoord);
        }
    }

    // va calibrer la taille du polygon pour eviter davoir un dessin qui sort du canvas
    calibratePolygon(widthP: number): void {
        if (this.mouseDownCoord.x - Math.abs(this.widthPolygon) - widthP <= 0) {
            this.widthPolygon = this.mouseDownCoord.x - widthP;
        } else if (this.mouseDownCoord.x + Math.abs(this.widthPolygon) + widthP >= this.drawingService.previewCtx.canvas.width) {
            this.widthPolygon = Math.abs(this.drawingService.previewCtx.canvas.width - this.mouseDownCoord.x) - widthP;
        }
        if (this.mouseDownCoord.y - Math.abs(this.heightPolygon) - widthP <= 0) {
            this.heightPolygon = this.mouseDownCoord.y - widthP;
        } else if (this.mouseDownCoord.y + Math.abs(this.heightPolygon) + widthP >= this.drawingService.previewCtx.canvas.height) {
            this.heightPolygon = Math.abs(this.drawingService.previewCtx.canvas.height - this.mouseDownCoord.y) - widthP;
        }
    }

    onMouseEnter(event: MouseEvent): void {
        this.isOut = false;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            let mousePosition = this.getPositionFromMouse(event);
            if (this.isOut) mousePosition = this.mouseOutCoord;
            this.drawPolygon(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, false);
            const cmd = new PolygonCommand(this.mouseDownCoord, mousePosition, this.polygonStyle, this, this.drawingService) as PolygonCommand;
            console.log(cmd);
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos);
        }
    }

    drawPolygon(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, preview: boolean = true): void {
        this.widthPolygon = currentPos.x - startPos.x;
        this.heightPolygon = currentPos.y - startPos.y;

        // incertitude pour perimetre contenant le dessin
        ctx.beginPath();
        ctx.setLineDash([0, 0]);

        ctx.fillStyle = this.primaryColor;
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = this.lineWidth;

        this.calibratePolygon(this.lineWidth);

        // polygone regulier donc width et height doivent avoir la meme valeur absolue
        if (Math.abs(this.widthPolygon) > Math.abs(this.heightPolygon)) {
            this.widthPolygon = this.heightPolygon * Math.sign(this.heightPolygon) * Math.sign(this.widthPolygon);
        } else {
            this.heightPolygon = this.widthPolygon * Math.sign(this.widthPolygon) * Math.sign(this.heightPolygon);
        }

        ctx.moveTo(startPos.x + this.widthPolygon, startPos.y); // emplacement depart

        switch (this.polygonStyle) {
            case 0:
                /* tslint:disable-next-line:no-shadowed-variable */
                for (let i = 0; i <= this.numberSides; i += 1) {
                    if (this.numberSides === i) {
                        ctx.closePath();
                    } else
                        ctx.lineTo(
                            startPos.x + this.widthPolygon * Math.cos((i * 2 * Math.PI) / this.numberSides),
                            startPos.y + this.heightPolygon * Math.sin((i * 2 * Math.PI) / this.numberSides),
                        );
                }
                ctx.stroke();
                if (this.numberSides === MINIMUM_NUMBER_OF_SIDES) this.incertitude = this.lineWidth;
                else this.incertitude = this.lineWidth / 2;
                break;

            case 1:
                /* tslint:disable-next-line:no-shadowed-variable */
                for (let i = 0; i <= this.numberSides; i += 1) {
                    if (this.numberSides === i) {
                        ctx.closePath();
                    } else
                        ctx.lineTo(
                            startPos.x + this.widthPolygon * Math.cos((i * 2 * Math.PI) / this.numberSides),
                            startPos.y + this.heightPolygon * Math.sin((i * 2 * Math.PI) / this.numberSides),
                        );
                }
                ctx.stroke();
                ctx.fill();

                if (this.numberSides === MINIMUM_NUMBER_OF_SIDES) this.incertitude = this.lineWidth;
                else this.incertitude = this.lineWidth / 2;

                break;

            case 2:
                for (let i = 0; i <= this.numberSides; i += 1) {
                    ctx.lineTo(
                        startPos.x + this.widthPolygon * Math.cos((i * 2 * Math.PI) / this.numberSides),
                        startPos.y + this.heightPolygon * Math.sin((i * 2 * Math.PI) / this.numberSides),
                    );
                }
                ctx.fill();
                this.incertitude = 0;
                break;
        }
        ctx.closePath();

        // perimetre circulaire du cercle
        if (preview) {
            ctx.beginPath();
            ctx.setLineDash([PREVIEW_CIRCLE_LINE_DASH_MIN, PREVIEW_CIRCLE_LINE_DASH_MAX]);
            ctx.lineWidth = PREVIEW_CIRCLE_LINE_WIDTH;
            ctx.strokeStyle = 'grey';
            ctx.ellipse(
                startPos.x,
                startPos.y,
                Math.abs(this.widthPolygon) + this.incertitude + ctx.lineWidth,
                Math.abs(this.heightPolygon) + this.incertitude + ctx.lineWidth,
                0,
                0,
                2 * Math.PI,
                false,
            );
            ctx.stroke();
            ctx.closePath();
        }
    }
}
