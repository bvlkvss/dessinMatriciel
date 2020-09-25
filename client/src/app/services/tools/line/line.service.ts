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
  mouseDbClick: boolean = false;
  private pathData: Vec2[];
  constructor(drawingService: DrawingService) {
    super(drawingService);
    this.pathData = [];
  }

  onMouseDown(event: MouseEvent): void {
    
    this.mouseDown = event.button === MouseButton.Left;
    if(this.mouseDown){ 
      this.mouseDownSecond = true;
      this.mouseDownCoord = this.getPositionFromMouse(event);
      this.pathData.push(this.mouseDownCoord);
  
    }

  }
  onMouseOut(event: MouseEvent): void {

  }
  onMouseEnter(event: MouseEvent): void {

  }

  onMouseUp(event: MouseEvent): void {

    //this.drawLine(this.drawingService.previewCtx);
    
    this.mouseDownCoord = this.currentPos;
    this.pathData.push(this.currentPos);

  }
  
  onDblClick(): void {
    /*
    if (this.mouseDbClick) {
      this.drawLine(this.drawingService.previewCtx);
      console.log("db click");
    }
    this.mouseDbClick = true;

    this.drawLine(this.drawingService.previewCtx);
    //On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
    */
    this.drawLines(this.drawingService.baseCtx);
    this.mouseDown=false;
    this.clearPath();

  }


  onMouseMove(event: MouseEvent): void {
    if(this.mouseDown){
    this.currentPos = this.getPositionFromMouse(event);
    
  
    this.drawingService.clearCanvas(this.drawingService.previewCtx);
    // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
      this.drawLines(this.drawingService.previewCtx);
      this.drawLine(this.drawingService.previewCtx,this.pathData[this.pathData.length-1],this.currentPos)

    }

  }

   private drawLine(ctx: CanvasRenderingContext2D, startPoint:Vec2, endPoint:Vec2): void {
     ctx.lineCap = 'round';
     ctx.beginPath();
 
     ctx.moveTo(startPoint.x, startPoint.y);
     ctx.lineTo(endPoint.x, endPoint.y);
 
     ctx.stroke();
   }


   private drawLines(ctx: CanvasRenderingContext2D): void {

    for(let i=0; i<this.pathData.length-1;i++){
      this.drawLine(this.drawingService.previewCtx, this.pathData[i],this.pathData[i+1]);
    }



   }
   private clearPath(): void {
    this.pathData = [];
}
}

