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

export enum keyboardKey {



}



@Injectable({
  providedIn: 'root'
})
export class RectangleService extends Tool {

  toSquare: boolean = false;
  isOut: boolean = false;
  constructor(drawingService: DrawingService) {
    super(drawingService);
  }


  onShiftKeyDown(event: KeyboardEvent): void {

    if (event.shiftKey) {
      this.toSquare = true;
    }
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
      if (this.isOut)
        mousePosition = this.mouseOutCoord;

      this.fillRectangle(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare);

    }
    this.drawingService.clearCanvas(this.drawingService.previewCtx);

    this.mouseDown = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      const mousePosition = this.getPositionFromMouse(event);

      // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.fillRectangle(this.drawingService.previewCtx, this.mouseDownCoord, mousePosition, this.toSquare);
    }
  }

  onShiftKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {

      this.toSquare = false;
    }

  }

  private fillRectangle(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean): void {

    ctx.beginPath();
    let width = currentPos.x - startPos.x;
    let height = currentPos.y - startPos.y;
    if (toSquare) {

      if (width > height) {

        height = width;

      }
      else {
        width = height;
      }
    }

    ctx.rect(startPos.x, startPos.y, width, height);
    ctx.fillStyle = "green";
    ctx.strokeStyle = "red";
    ctx.fill();
    ctx.stroke();
  }




}
