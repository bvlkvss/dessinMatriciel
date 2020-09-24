import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

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
export class EllipseService extends Tool {
    toSquare: boolean = false;
    isOut: boolean = false;
    currentPos: Vec2;
    outlineWidth: number;
    ellipseStyle: number;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.outlineWidth = 0;
        this.ellipseStyle=0;
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

            this.drawEllipse(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare, false);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.mouseDown = false;
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
            this.drawEllipse(this.drawingService.previewCtx,this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    private drawEllipse(
        ctx: CanvasRenderingContext2D,
        startPos: Vec2,
        currentPos: Vec2,
        toSquare: boolean,
        preview: boolean = true,
    ): void {

        
        let width = currentPos.x - startPos.x;
        let height = currentPos.y - startPos.y;

        if (width !== 0 && height !== 0) {
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
                    console.log("in");
                    width = -startPos.x;
                    height = width * Math.sign(height) * Math.sign(width);
                }
                if (Math.abs(height) > startPos.y && height < 0) {
                    console.log("in");
                    height = -startPos.y;
                    width = height * Math.sign(width) * Math.sign(height);
                }
            }

            const centerx = this.mouseDownCoord.x + width / 2;

            const centery = this.mouseDownCoord.y + height / 2;

            const radiusX = Math.abs(Math.abs(width / 2) - this.outlineWidth / 2);
            const radiusY = Math.abs(Math.abs(height / 2) - this.outlineWidth / 2);

            

            ctx.setLineDash([0, 0]);
            ctx.lineWidth = 0;
            ctx.strokeStyle = 'red';
            ctx.beginPath();
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

            // tslint:disable-next-line:no-magic-numbers
            
            if(preview){
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = 'grey';
            ctx.rect(startPos.x, startPos.y, width, height);
            ctx.stroke();
            ctx.closePath();

        }
    }
}
}
