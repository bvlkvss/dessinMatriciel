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
    Filled = 1,
    Filled_contour = 2,
}

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    toSquare: boolean = false;
    isOut: boolean = false;
    currentPos: Vec2;
    rectangleStyle: RectangleStyle;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.toolAttributes = ['strokeWidth', 'rectangleStyle'];
        this.rectangleStyle = 0;
        this.lineWidth = 1;
    }
    setStyle(id: number): void {
        this.rectangleStyle = id;
    }
    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }
    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }
    onMouseOut(event: MouseEvent): void {
        this.isOut = true;

        this.mouseOutCoord = this.getPositionFromMouse(event);

        if (this.mouseDown) {
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
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.mouseOutCoord, this.toSquare);
        }
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
        this.toSquare = false;
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
        let width = currentPos.x - startPos.x;
        let height = currentPos.y - startPos.y;
        if (toSquare) {
            if (Math.abs(width) > Math.abs(height)) {
                width = height * Math.sign(height) * Math.sign(width);
            } else {
                height = width * Math.sign(width) * Math.sign(height);
            }
        }
        ctx.beginPath();
        ctx.setLineDash([0, 0]);

        ctx.fillStyle = this.secondaryColor;
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = this.lineWidth;
        ctx.rect(startPos.x, startPos.y, width - (this.lineWidth / 2) * Math.sign(width), height - (this.lineWidth / 2) * Math.sign(height));

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

        ctx.closePath();
    }
}
