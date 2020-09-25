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
  mouseDownSecond: boolean = false;
  keyOnEscape: boolean = false;
  private allignementPoint: Vec2;
  onMouseDoubleClick: boolean = false;
  withPoint: boolean = true;
  private diameter: number = 2;
  private pathData: Vec2[];
  toAllign: boolean = false;

  constructor(drawingService: DrawingService) {
    super(drawingService);
    this.pathData = [];
  }

  onMouseOut(event: MouseEvent): void { }
  onMouseEnter(event: MouseEvent): void { }

  onClick(event: MouseEvent): void {
    this.onMouseDoubleClick = false;
    this.mouseDown = event.button === MouseButton.Left;
    if (this.mouseDown && !this.toAllign) {
      this.keyOnEscape = false;
      this.mouseDownSecond = true;
      this.mouseDownCoord = this.getPositionFromMouse(event);
      this.pathData.push(this.mouseDownCoord);
    }
  }
  onDblClick(event: MouseEvent): void {
    // because click is triggred twice when calling doubleClick
    //this.pathData.pop();
    this.onMouseDoubleClick = true;

    if (this.distanceBetween2Points(this.pathData[this.pathData.length - 1], this.pathData[this.pathData.length - 2]) <= 20) {
      this.pathData[this.pathData.length - 2] = this.pathData[this.pathData.length - 1];
      // this.pathData.pop();
    }
    this.drawingService.clearCanvas(this.drawingService.previewCtx);
    if (this.toAllign) {
      this.toAllign = false;
      this.pathData.push(this.allignementPoint);
      console.log(this.allignementPoint);
    }
    this.drawLines(this.drawingService.baseCtx);
    this.mouseDown = false;

    this.clearPath();
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      console.log('move');
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
    } else if (event.shiftKey && !this.onMouseDoubleClick) {
      this.toAllign = true;
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawLines(this.drawingService.previewCtx);
      this.allignementPoint = this.findNewPointForAngle(this.pathData[this.pathData.length - 1], this.currentPos);
      console.log(this.allignementPoint);
      this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.allignementPoint);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey && !this.onMouseDoubleClick) {
      this.toAllign = false;

      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawLines(this.drawingService.previewCtx);
      this.drawLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.currentPos);
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
        if (i === this.pathData.length - 2 && this.onMouseDoubleClick) continue;
        ctx.beginPath();
        ctx.arc(this.pathData[i + 1].x, this.pathData[i + 1].y, this.diameter, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }
    }
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
   this.withPoint = !this.withPoint;
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
