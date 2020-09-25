import { Injectable } from '@angular/core';
//import { Color } from '@app/classes/color';
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
@Injectable({
  providedIn: 'root'
})
export class LineService extends Tool {
  mouseDownSecond: boolean = false;
  keyOnEscape: boolean = false;
  withPoint: boolean = true;
  private pathData: Vec2[];
  constructor(drawingService: DrawingService) {
    super(drawingService);
    this.pathData = [];
  }




  onMouseOut(event: MouseEvent): void {

  }
  onMouseEnter(event: MouseEvent): void {

  }


  onClick(event: MouseEvent): void {
    this.mouseDown = event.button === MouseButton.Left;
    if (this.mouseDown) {
      this.keyOnEscape = false;
      this.mouseDownSecond = true;
      this.mouseDownCoord = this.getPositionFromMouse(event);
      this.pathData.push(this.mouseDownCoord);



    }

  }
  onDblClick(event: MouseEvent): void {
    // because click is triggred twice when calling doubleClick
    this.pathData.pop();

    if (this.distanceBetween2Points(this.pathData[this.pathData.length - 1], this.pathData[this.pathData.length - 2]) <= 20) {
      console.log("Ok");
      this.pathData.pop();
      this.pathData.pop();

    }
    this.drawLines(this.drawingService.baseCtx);
    this.mouseDown = false;

    this.clearPath();

  }


  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      console.log("move");
      this.currentPos = this.getPositionFromMouse(event);
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
      this.drawLines(this.drawingService.previewCtx);
      if (!this.keyOnEscape) {
        this.keyOnEscape = false;
        this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.currentPos);
      }
    }

  }
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.keyOnEscape = true;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.mouseDown = false;
      this.drawLines(this.drawingService.baseCtx);
      this.clearPath();

    }
    else if (event.key === "Backspace") {
      if (this.pathData.length > 1)
        this.pathData.pop();


    }
  }
  private drawLine(ctx: CanvasRenderingContext2D, startPoint: Vec2, endPoint: Vec2): void {
    ctx.lineCap = 'round';
    ctx.beginPath();

    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);

    ctx.stroke();

  }


  private drawLines(ctx: CanvasRenderingContext2D): void {

    for (let i = 0; i < this.pathData.length - 1; i++) {
      this.drawLine(ctx, this.pathData[i], this.pathData[i + 1]);
      if (this.withPoint) {
        ctx.beginPath();
        ctx.arc(this.pathData[i + 1].x, this.pathData[i + 1].y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }
    }

  }
  private distanceBetween2Points(point1: Vec2, point2: Vec2): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }
  private clearPath(): void {
    this.pathData = [];
  }
}

