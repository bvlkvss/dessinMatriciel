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
  currentPos:Vec2;
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
      if (this.isOut)
        mousePosition = this.mouseOutCoord;

      this.filledRectangle(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare);

    }
    this.drawingService.clearCanvas(this.drawingService.previewCtx);

    this.mouseDown = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      this.currentPos = this.getPositionFromMouse(event);

      // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.filledRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
    }
  }

  onShiftKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {

      this.toSquare = false;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.filledRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
      if(!this.mouseDown){
        //if shift key is still down while mouse is up, the shift event clears the preview
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
      }

    }

  }

  onShiftKeyDown(event: KeyboardEvent): void {
    if (event.shiftKey) {

      this.toSquare = true;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.filledRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
    }
  }

  private filledRectangle(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean): void {

    ctx.beginPath();
    let width = currentPos.x - startPos.x;
    let height = currentPos.y - startPos.y;
    console.log("height before is",height);
    console.log("width before is", width);
    if (toSquare) {


      if (Math.abs(width)>Math.abs(height)) {
      console.log("height after is",height);
      console.log("width after is", width);
        height = width*Math.sign(height)*Math.sign(width);

      }
      else {
        width = height*Math.sign(width)*Math.sign(height);
      }
    console.log("height after change is",height);
    console.log("width after change is", width);
    }

    ctx.rect(startPos.x, startPos.y, width, height);
    ctx.fillStyle = "green";
    ctx.strokeStyle = "red";
    ctx.fill();
    ctx.stroke();
  }




}
