import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { PolygonCommand } from '@app/classes/polygon-command';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export enum polygonStyle {
    Empty = 0,
    Filled_contour = 1,
    Filled = 2,
}

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Tool {
    isOut: boolean;
    numberSides: number;
    currentPos: Vec2;
    startPos: Vec2;
    polygonStyle: polygonStyle;
    widthPolygon: number;
    heightPolygon: number;
    incertitude: number;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toolAttributes = ['strokeWidth', 'polygonStyle'];
        this.polygonStyle = 2;
        this.widthPolygon = 0;
        this.isOut = false;
        this.numberSides = Const.MINIMUM_NUMBER_OF_SIDES;
        this.heightPolygon = 0;
        this.incertitude = 0;
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

    onMouseEnter(event: MouseEvent): void {
        this.isOut = false;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            let mousePosition = this.getPositionFromMouse(event);
            if (this.isOut) mousePosition = this.mouseOutCoord;
            this.drawPolygon(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition);
            const cmd = new PolygonCommand(this.mouseDownCoord, mousePosition, this.polygonStyle, this, this.drawingService) as PolygonCommand;
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos);
        }
    }

    drawPolygon(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2): void {
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
        Math.abs(this.widthPolygon) > Math.abs(this.heightPolygon)
            ? (this.widthPolygon = this.heightPolygon * Math.sign(this.heightPolygon) * Math.sign(this.widthPolygon))
            : (this.heightPolygon = this.widthPolygon * Math.sign(this.widthPolygon) * Math.sign(this.heightPolygon));

        ctx.moveTo(startPos.x + this.widthPolygon, startPos.y); // emplacement depart

        switch (this.polygonStyle) {
            case 0:
                this.drawPolygonContour(ctx, startPos);
                ctx.stroke();
                this.numberSides === Const.MINIMUM_NUMBER_OF_SIDES ? (this.incertitude = this.lineWidth) : (this.incertitude = this.lineWidth / 2);
                break;

            case 1:
                this.drawPolygonContour(ctx, startPos);
                ctx.stroke();
                ctx.fill();

                this.numberSides === Const.MINIMUM_NUMBER_OF_SIDES ? (this.incertitude = this.lineWidth) : (this.incertitude = this.lineWidth / 2);

                break;

            case 2:
                this.drawPolygonContour(ctx, startPos);
                ctx.fill();
                this.incertitude = 0;
                break;
        }

        this.drawPerimeterOnPreview(startPos);
    }

    private drawPolygonContour(ctx: CanvasRenderingContext2D, startPos: Vec2): void {
        for (let i = 0; i <= this.numberSides; i++) {
            if (this.numberSides === i) {
                ctx.closePath();
            } else
                ctx.lineTo(
                    startPos.x + this.widthPolygon * Math.cos((i * 2 * Math.PI) / this.numberSides),
                    startPos.y + this.heightPolygon * Math.sin((i * 2 * Math.PI) / this.numberSides),
                );
        }
    }
    private drawPerimeterOnPreview(startPos: Vec2): void {
        const ctx = this.drawingService.previewCtx;
        ctx.beginPath();
        ctx.setLineDash([Const.PREVIEW_CIRCLE_LINE_DASH_MIN, Const.PREVIEW_CIRCLE_LINE_DASH_MAX]);
        ctx.lineWidth = Const.PREVIEW_CIRCLE_LINE_WIDTH;
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

    private calibratePolygon(widthP: number): void {
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
}
