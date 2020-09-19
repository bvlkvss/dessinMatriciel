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
  providedIn: 'root'
})

export class EllipseService extends Tool {
  toSquare: boolean = false;
  isOut: boolean = false;
  currentPos: Vec2;
  constructor(drawingService: DrawingService) {
    super(drawingService);

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

      this.drawRectangle(this.drawingService.previewCtx, this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare);
    }
    this.drawingService.clearCanvas(this.drawingService.previewCtx);

    this.mouseDown = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      this.currentPos = this.getPositionFromMouse(event);

      // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawRectangle(this.drawingService.previewCtx, this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);

    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey && this.mouseDown) {
      this.toSquare = false;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawRectangle(this.drawingService.previewCtx, this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
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
      this.drawRectangle(this.drawingService.previewCtx, this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
    }
  }

  private drawRectangle(previewCtx: CanvasRenderingContext2D, baseCtx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean): void {
    previewCtx.beginPath();
    baseCtx.beginPath();
    let width = currentPos.x - startPos.x;
    let height = currentPos.y - startPos.y;
    if (toSquare) {
      if (Math.abs(width) > Math.abs(height)) {
        height = width * Math.sign(height) * Math.sign(width);
      } else {
        width = height * Math.sign(width) * Math.sign(height);
      }
    }
    previewCtx.strokeStyle = 'red';


    //previewCtx.stroke();
    this.drawEllipse(previewCtx, width / 2, height / 2);
    previewCtx.stroke();
    previewCtx.fill();
    previewCtx.rect(startPos.x, startPos.y, width, height);
    previewCtx.stroke();

  }

  private drawEllipse(ctx: CanvasRenderingContext2D, radiusX: number, radiusY: number) {



    let centerx = 0;
    let centery = 0;


      centerx = this.mouseDownCoord.x + radiusX;

    

    


      centery = this.mouseDownCoord.y + radiusY;
    
   


    console.log("center x is:",centerx);
    console.log("center y is:",centery);
    ctx.ellipse(centerx, centery, Math.abs(radiusX), Math.abs(radiusY), 0, 0, 2 * Math.PI);

  }


}
