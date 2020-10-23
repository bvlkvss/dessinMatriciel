import { Injectable } from '@angular/core';
import { Tool } from "@app/classes/tool";
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

export enum MouseButton{
  Left=0,
  Middle=1,
  Right=2,
  Back=3,
  Forward=4
}

export enum polygonStyle{
  Empty = 0,
  Filled_contour = 1,
  Filled = 2,
}

@Injectable({
  providedIn: 'root',
})

export class PolygonService extends Tool {
  toSquare: boolean = false;  
  isOut: boolean = false;
  numberSides:number = 9;
  currentPos: Vec2;
  polygonStyle: polygonStyle;
  constructor(drawingService: DrawingService) {
      super(drawingService);
      this.toolAttributes = ['strokeWidth', 'polygonStyle'];
      this.polygonStyle = 2;
      this.lineWidth = 1;
      this.primaryColor = '#000000';
      this.secondaryColor = '#000000';
  }

  setStyle(id: number): void {
      this.polygonStyle = id;
  }

  onMouseDown(event: MouseEvent): void {
      this.mouseDown = event.button === MouseButton.Left;
      if (this.mouseDown) {
          this.mouseDownCoord = this.getPositionFromMouse(event);
      }
  }

  setLineWidth(width: number): void {
      this.lineWidth = width;
  }

  setPrimaryColor(color: string): void {
      this.primaryColor = color;
  }
  setSecondaryColor(color: string): void {
      this.secondaryColor = color;
  }
  onMouseOut(event: MouseEvent): void {
      if (this.mouseDown) {
          this.isOut = true;

          this.mouseOutCoord = this.getPositionFromMouse(event);
          if (this.mouseOutCoord.x > this.drawingService.previewCtx.canvas.width ) {
              this.mouseOutCoord.x = this.drawingService.canvas.width;
          } else if (this.mouseOutCoord.x < 0) {
              this.mouseOutCoord.x = 0;
          }
           if (this.mouseOutCoord.y > this.drawingService.previewCtx.canvas.height) {
              this.mouseOutCoord.y = this.drawingService.canvas.height;
          } else if (this.mouseOutCoord.y < 0) {
              this.mouseOutCoord.y = 0;
          }
          this.drawingService.clearCanvas(this.drawingService.previewCtx);
          this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.mouseOutCoord, this.toSquare);
      }
  }

  onMouseEnter(event: MouseEvent): void {
      this.isOut = false;
  }

  onMouseUp(event: MouseEvent): void {
      if (this.mouseDown) {
          let mousePosition = this.getPositionFromMouse(event);
          if (this.isOut) mousePosition = this.mouseOutCoord;
            this.drawPolygon(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare);
      }
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.mouseDown = false;
      this.toSquare = false;
  }

  onMouseMove(event: MouseEvent): void {
      if (this.mouseDown) {
          this.currentPos = this.getPositionFromMouse(event);

          // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
          this.drawingService.clearCanvas(this.drawingService.previewCtx);
          this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
      }
  }

  onKeyUp(event: KeyboardEvent): void {
      if (!event.shiftKey && this.mouseDown) {
          this.toSquare = false; //false
          this.drawingService.clearCanvas(this.drawingService.previewCtx);
          this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);

      }
  }

  onKeyDown(event: KeyboardEvent): void {
      if (event.shiftKey && this.mouseDown) {
          this.toSquare = true;
          this.drawingService.clearCanvas(this.drawingService.previewCtx);
          this.drawPolygon(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);

      }
  }

  private drawPolygon(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare:boolean): void {
      let width = currentPos.x - startPos.x;
      let height = currentPos.y - startPos.y;

      //toSquare always true
          if (Math.abs(width) > Math.abs(height)) {
              width = height * Math.sign(height) * Math.sign(width);
          } else {
              height = width * Math.sign(width) * Math.sign(height);
          } 


      //controle de la taille du polygone
    //   let sizePolygon;   
    //   if(width<height){
    //         sizePolygon = height;
    //   }else{
    //         sizePolygon = width;
    //   }
      //const centerx = this.mouseDownCoord.x + width / 2;
      //const centerx = startPos.x +width/ 2;
      //const centery = startPos.y +width/ 2;
      //const centery = this.mouseDownCoord.y + height / 2;

      ctx.beginPath();
     
      ctx.setLineDash([0, 0]);

      ctx.fillStyle = this.secondaryColor;
      ctx.strokeStyle = this.primaryColor;
      ctx.lineWidth = this.lineWidth;

      //ctx.moveTo(centerx + width*Math.cos(0), centery+height*Math.sin(0) ); // emplacement depart
      switch (this.polygonStyle) {
          case 0:
              for (var i = 0; i <= this.numberSides;i += 1) {

                if(this.numberSides==i){
                    ctx.closePath();
                }else 
                ctx.lineTo (startPos.x + width * Math.cos(i * 2 * Math.PI / this.numberSides), startPos.y + height * Math.sin(i * 2 * Math.PI / this.numberSides));
            }  
              ctx.stroke();
              break;             
              case 1:
              for (var i = 0; i <= this.numberSides;i += 1) {
                if(this.numberSides==i){
                    ctx.closePath();
                }else
                ctx.lineTo (currentPos.x + width * Math.cos(i * 2 * Math.PI / this.numberSides), currentPos.y + height * Math.sin(i * 2 * Math.PI / this.numberSides));
            }    
              ctx.stroke();
              ctx.fill();
              break;
          case 2:
              for (var i = 0; i <= this.numberSides;i += 1) {
                ctx.lineTo (currentPos.x + width * Math.cos(i * 2 * Math.PI / this.numberSides), currentPos.y + height * Math.sin(i * 2 * Math.PI / this.numberSides));
              }  
              ctx.fill();
              break;
      }

      ctx.closePath();
  }


  
}