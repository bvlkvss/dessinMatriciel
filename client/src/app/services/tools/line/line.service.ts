import { Injectable } from '@angular/core';
//import { Color } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
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
  mouseDbClick: boolean = false;
  constructor(drawingService: DrawingService) {
    super(drawingService);
  }

  onMouseDown(event: MouseEvent): void {

    this.mouseDown = event.button === MouseButton.Left;
    if (!this.mouseDownSecond) {
      this.mouseDownSecond = true;
      this.mouseDownCoord = this.getPositionFromMouse(event);
    }


  }
  onMouseOut(event: MouseEvent): void {

  }
  onMouseEnter(event: MouseEvent): void {

  }

  onMouseUp(event: MouseEvent): void {

    // this.drawLine(this.drawingService.baseCtx);
    this.mouseDownCoord = this.currentPos;

  }
  onDblClick(): void {
    if (this.mouseDbClick) {
      //    this.drawLine(this.drawingService.previewCtx);
      console.log("db click");
    }
    this.mouseDbClick = true;

    // this.drawLine(this.drawingService.previewCtx);
    // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris


  }


  onMouseMove(event: MouseEvent): void {

    this.currentPos = this.getPositionFromMouse(event);
    this.drawingService.clearCanvas(this.drawingService.previewCtx);
    // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
    //  this.drawLine(this.drawingService.previewCtx);


  }

  /* private drawLine(ctx: CanvasRenderingContext2D): void {
     ctx.lineCap = 'round';
     ctx.beginPath();
 
     ctx.moveTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
     ctx.lineTo(this.currentPos.x, this.currentPos.y);
 
     ctx.stroke();
   }*/
}

