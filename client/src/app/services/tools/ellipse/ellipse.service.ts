import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { EllipseCommand } from '@app/classes/ellipse-command';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export enum EllipseStyle {
    Empty = 0,
    Filled_contour = 2,
    Filled = 1,
}
@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    toSquare: boolean;
    isOut: boolean;
    currentPos: Vec2;
    ellipseStyle: EllipseStyle;
    lineDash: boolean;
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toSquare = false;
        this.isOut = false;
        this.lineWidth = 1;
        this.ellipseStyle = 2;
        this.toolAttributes = ['ellipseStyle', 'strokeWidth'];
        this.lineDash = false;
    }

    onMouseDown(event: MouseEvent, isSelection: boolean = false): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            if (!isSelection) {
                this.invoker.setIsAllowed(false);
                this.invoker.ClearRedo();
            }
        }
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
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.mouseOutCoord, this.toSquare);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        this.isOut = false;
    }

    onMouseUp(event: MouseEvent, isSelection: boolean = false): void {
        if (this.mouseDown) {
            let mousePosition = this.getPositionFromMouse(event);
            if (this.isOut) mousePosition = this.mouseOutCoord;
            this.drawEllipse(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare, false);
            if (!isSelection) {
                const cmd = new EllipseCommand(this.mouseDownCoord, mousePosition, this.ellipseStyle, this, this.drawingService) as EllipseCommand;
                this.invoker.addToUndo(cmd);
                this.invoker.setIsAllowed(true);
            }
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.mouseDown = false;
        this.toSquare = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey && this.mouseDown) {
            this.toSquare = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.shiftKey && this.mouseDown) {
            this.toSquare = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    setStyle(style: number): void {
        this.ellipseStyle = style;
    }

    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    drawEllipse(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean, preview: boolean = true): void {
        let width = currentPos.x - startPos.x;
        let height = currentPos.y - startPos.y;

        if (width !== 0 && height !== 0) {
            if (toSquare) {
                if (Math.abs(width) > Math.abs(height)) {
                    width = height * Math.sign(height) * Math.sign(width);
                } else {
                    height = width * Math.sign(width) * Math.sign(height);
                }
            }

            const centerx = startPos.x + width / 2;
            const centery = startPos.y + height / 2;

            if (this.ellipseStyle === EllipseStyle.Filled_contour) {
                this.lineWidth = 0;
            }

            const radiusX = Math.abs(Math.abs(width / 2) - this.lineWidth / 2 - 1);
            const radiusY = Math.abs(Math.abs(height / 2) - this.lineWidth / 2 - 1);

            ctx.beginPath();
            if (!this.lineDash) ctx.setLineDash([0, 0]);
            else ctx.setLineDash([2, 2]);
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.primaryColor;
            ctx.strokeStyle = this.secondaryColor;
            ctx.ellipse(centerx, centery, radiusX, radiusY, 0, 0, 2 * Math.PI);

            if (Math.abs(width) > this.lineWidth * 2 && Math.abs(height) > this.lineWidth * 2) {
                switch (this.ellipseStyle) {
                    case 0:
                        ctx.stroke();
                        break;
                    case 1:
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 2:
                        ctx.fill();
                        break;
                }
                ctx.closePath();
            }

            if (preview) {
                ctx.beginPath();
                ctx.setLineDash([Const.LINE_DASH_SEGMENT_START, Const.LINE_DASH_SEGMENT_END]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'grey';
                ctx.rect(startPos.x, startPos.y, width, height);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}
