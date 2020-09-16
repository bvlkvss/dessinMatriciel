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

    onShiftKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey && this.mouseDown) {
            this.toSquare = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
            if (!this.mouseDown) {
                //if shift key is still down while mouse is up, the shift event clears the preview
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            }
        }
    }

    onShiftKeyDown(event: KeyboardEvent): void {
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
        console.log('height before is', height);
        console.log('width before is', width);
        if (toSquare) {
            if (Math.abs(width) > Math.abs(height)) {
                console.log('height after is', height);
                console.log('width after is', width);
                height = width * Math.sign(height) * Math.sign(width);
            } else {
                width = height * Math.sign(width) * Math.sign(height);
            }
        }
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'red';
        ctx.rect(startPos.x, startPos.y, width, height);

        console.log('rectangle style:', this.rectangleStyle);
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
