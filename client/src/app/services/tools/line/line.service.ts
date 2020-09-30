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
  providedIn: 'root',
})
export class LineService extends Tool {
  keyOnEscape: boolean = false;
  private allignementPoint: Vec2;
  isDoubleClicked: boolean = false;
  withJunction: boolean = true;
  private pathData: Vec2[];
  toAllign: boolean = false;
  junctionWidth: number = 1;;
  constructor(drawingService: DrawingService) {
    super(drawingService);
    this.pathData = [];
    this.toolAttributes = ["lineWidth", "junctionWidth", "junction"];
    this.lineWidth = 1;

  }

  onMouseOut(event: MouseEvent): void { }
  onMouseEnter(event: MouseEvent): void { }
  setPrimaryColor(color: string): void {
    this.primaryColor = color;
  }

  setJunctionState(isChecked: boolean): void {
    this.withJunction = isChecked;
  }
  setLineWidth(width: number): void {
    this.lineWidth = width;
  }
  setJunctionWidth(width: number): void {
    this.junctionWidth = width;
  }
  onClick(event: MouseEvent): void {
    this.isDoubleClicked = false;
    this.mouseDown = event.button === MouseButton.Left;
    if (this.mouseDown && !this.toAllign) {
      this.keyOnEscape = false;
      this.mouseDownCoord = this.getPositionFromMouse(event);
      this.pathData.push(this.mouseDownCoord);
    }
  }
  onDblClick(event: MouseEvent): void {
    //  click is triggred twice when calling doubleClick so, it push twice the last point
    let lastPoint: Vec2 = this.pathData[this.pathData.length - 1];
    this.isDoubleClicked = true;


    // check if the distance  between the new point and last one is less than 20  
    if (this.distanceBetween2Points(lastPoint, this.pathData[this.pathData.length - 3]) <= 20) {
      this.pathData.pop();
      this.pathData[this.pathData.length - 2] = lastPoint;

    }
    // if distance is more than 20, we need to push back the last point
    else
      this.pathData.push(lastPoint);
    this.drawingService.clearCanvas(this.drawingService.previewCtx);

    this.drawLines(this.drawingService.baseCtx);
    if (this.toAllign) {
      this.toAllign = false;
      this.drawLine(this.drawingService.baseCtx, this.pathData[this.pathData.length - 1], this.allignementPoint);
    }
    console.log(this.pathData[this.pathData.length - 1]);
    console.log(this.pathData[this.pathData.length - 2]);
    console.log(this.pathData[this.pathData.length - 3]);

    this.mouseDown = false;

    this.clearPath();
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      this.currentPos = this.getPositionFromMouse(event);
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
      this.drawLines(this.drawingService.previewCtx);
      if (!this.keyOnEscape) {
        this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.currentPos);
      }
    }
  }
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.keyOnEscape = true;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.mouseDown = false;
      this.drawLines(this.drawingService.baseCtx);
      this.clearPath();
    } else if (event.key === 'Backspace') {
      if (this.pathData.length > 1) this.pathData.pop();

    }
    else if (event.shiftKey && !this.isDoubleClicked) {
      this.toAllign = true;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawLines(this.drawingService.previewCtx);
      this.allignementPoint = this.findNewPointForAngle(this.pathData[this.pathData.length - 1], this.currentPos);
      this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.allignementPoint);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey && !this.isDoubleClicked) {
      this.toAllign = false;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawLines(this.drawingService.previewCtx);
      this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.currentPos);
    }
  }
  private drawLine(ctx: CanvasRenderingContext2D, startPoint: Vec2, endPoint: Vec2): void {
    if (startPoint && endPoint) {
      ctx.fillStyle = this.primaryColor;
      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  }

  private drawLines(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.pathData.length - 1; i++) {
      this.drawLine(ctx, this.pathData[i], this.pathData[i + 1]);
      if (this.withJunction) {
        if (i === (this.pathData.length - 3) && this.isDoubleClicked) break;
        this.drawJunction(ctx, this.pathData[i + 1]);
      }
    }
  }

  private drawJunction(ctx: CanvasRenderingContext2D, centerPoint: Vec2) {

    ctx.beginPath();
    ctx.arc(centerPoint.x, centerPoint.y, this.junctionWidth, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
  private findNewPointForAngle(beginPoint: Vec2, endPoint: Vec2): Vec2 {
    let currentAngle: number = this.angleBetween2Points(beginPoint, endPoint);
    let distance: number = this.distanceBetween2Points(beginPoint, endPoint);
    let closestAngle: number = (Math.round(currentAngle / ((Math.PI * 45) / 180)) * Math.PI * 45) / 180;
    let xDistance: number = distance * Math.cos(closestAngle);
    let yDistance: number = distance * Math.sin(closestAngle);
    return { x: beginPoint.x + xDistance, y: beginPoint.y - yDistance };
  }
  /* private setJunction(): void {
   this.withJunction = !this.withJunction;
 }*/
  /* private setDiameter(diameter:number): void {
 this.diameter = diameter;
}*/
  private angleBetween2Points(lastPoint: Vec2, currentPoint: Vec2): number {
    //moitie droite
    //adjacent
    let adjacent = this.distanceBetween2Points(lastPoint, { x: currentPoint.x, y: lastPoint.y });
    //hypothenus
    let hypothenus = this.distanceBetween2Points(lastPoint, currentPoint);

    let angle = Math.acos(adjacent / hypothenus);
    if (lastPoint.x < currentPoint.x) {
      //cadran 1
      //cadran 4
      if (lastPoint.y < currentPoint.y) {
        //2pi - l'angle
        angle = 2 * Math.PI - angle;
      }
    }
    //moitie gauche
    else {
      //cadran 2
      if (lastPoint.y > currentPoint.y) {
        //pi - l'angle
        angle = Math.PI - angle;
      }
      //cadran 3
      else {
        //pi + la'angle
        angle = Math.PI + angle;
      }
    }

    return angle;
  }
  private distanceBetween2Points(point1: Vec2, point2: Vec2): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }
  private clearPath(): void {
    this.pathData = [];
  }
}
