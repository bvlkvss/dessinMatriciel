import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum RectangleStyle {
    Empty = 0,
    Filled_contour = 1,
    Filled = 2,
}

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    toSquare: boolean = false;
    isOut: boolean = false;
    currentPos: Vec2;
    rectangleStyle: RectangleStyle;
    outlineWidth: number;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.rectangleStyle = 1;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    onMouseOut(event: MouseEvent): void {
        this.isOut = true;
        this.mouseOutCoord = this.getPositionFromMouse(event);
    }

    onMouseEnter(event: MouseEvent): void {
        this.isOut = false;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            let mousePosition = this.getPositionFromMouse(event);
            if (this.isOut) mousePosition = this.mouseOutCoord;

            this.drawRectangle(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey && this.mouseDown) {
            this.toSquare = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
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
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    private drawRectangle(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean): void {
        ctx.beginPath();
        let width = currentPos.x - startPos.x;
        let height = currentPos.y - startPos.y;
        if (toSquare) {
            if (Math.abs(width) > Math.abs(height)) {
                height = width * Math.sign(height) * Math.sign(width);
            } else {
                width = height * Math.sign(width) * Math.sign(height);
            }
            if (width + this.mouseDownCoord.x > ctx.canvas.width && width > 0) {
                width = ctx.canvas.width - this.mouseDownCoord.x;
                height = width * Math.sign(height) * Math.sign(width);
            }

            if (height + this.mouseDownCoord.y > ctx.canvas.height && height > 0) {
                height = ctx.canvas.height - this.mouseDownCoord.y;
                width = height * Math.sign(width) * Math.sign(height);
            }

            if (Math.abs(width) > startPos.x && width < 0) {
                width = -startPos.x;
                height = width * Math.sign(height) * Math.sign(width);
            }
            if (Math.abs(height) > startPos.y && height < 0) {
                height = -startPos.y;
                width = height * Math.sign(width) * Math.sign(height);
            }
        }
        ctx.fillStyle = this.primaryColor;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = this.outlineWidth;
        ctx.rect(startPos.x, startPos.y, width, height);

        switch (this.rectangleStyle) {
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
    }
}
