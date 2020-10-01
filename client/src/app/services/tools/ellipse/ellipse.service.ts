import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
// tslint:disable:no-magic-numbers
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum RectangleStyle {
    Empty = 0,
    Filled_contour = 2,
    Filled = 1,
}
@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    toSquare: boolean = false;
    isOut: boolean = false;
    currentPos: Vec2;
    ellipseStyle: number;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.lineWidth = 1;
        this.ellipseStyle = 2;
        this.toolAttributes = ['ellipseStyle', 'lineWidth'];
    }
    setStyle(id: number): void {
        this.ellipseStyle = id;
    }
    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }
    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }
    setPrimaryColor(color: string): void {
        this.primaryColor = color;
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

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            let mousePosition = this.getPositionFromMouse(event);
            if (this.isOut) mousePosition = this.mouseOutCoord;

            this.drawEllipse(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare, false);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.mouseDown = false;
        this.toSquare = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey && this.mouseDown) {
            this.toSquare = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
            if (!this.mouseDown) {
                // if shift key is still down while mouse is up, the shift event clears the preview
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.shiftKey && this.mouseDown) {
            this.toSquare = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    // tslint:disable:cyclomatic-complexity
    private drawEllipse(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean, preview: boolean = true): void {
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

            const centerx = this.mouseDownCoord.x + width / 2;
            const centery = this.mouseDownCoord.y + height / 2;

            const radiusX = Math.abs(Math.abs(width / 2) - this.lineWidth / 2 - 1);
            const radiusY = Math.abs(Math.abs(height / 2) - this.lineWidth / 2 - 1);

            ctx.beginPath();
            ctx.setLineDash([0, 0]);
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.primaryColor;
            ctx.strokeStyle = this.secondaryColor;
            ctx.ellipse(centerx, centery, radiusX, radiusY, 0, 0, 2 * Math.PI);

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

            if (preview) {
                ctx.beginPath();
                ctx.setLineDash([5, 15]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'grey';
                ctx.rect(startPos.x, startPos.y, width, height);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}
