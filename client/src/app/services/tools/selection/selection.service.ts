import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
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
export class SelectionService extends Tool {
    rectangleService: RectangleService;
    ellipseService: EllipseService;
    selectionStyle: number;
    private resizingHandles: Vec2[];
    mouseUpCoord: Vec2;
    mouseDownInsideSelection : boolean;
    offsetX: number;
    offsetY: number;
    selectionActivated:boolean;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.resizingHandles = [];
        this.selectionStyle=1;
        this.rectangleService = new RectangleService(drawingService);
        this.rectangleService.setStyle(0);
        this.rectangleService.lineDash=true;
        this.ellipseService = new EllipseService(drawingService);
        this.ellipseService.setStyle(0);
        this.selectionActivated=false;

    }

    onMouseDown(event: MouseEvent): void {
      /*
      switch(this.selectionStyle){

        case 1:
          this.rectangleService.onMouseDown(event);



      }*/
      this.drawingService.clearCanvas(this.drawingService.previewCtx);

      this.mouseDown = event.button === MouseButton.Left;
      if (this.mouseDown) {
        this.mouseDownCoord = this.getPositionFromMouse(event);

        
        if (this.selectionActivated &&this.mouseDownCoord.x>=this.rectangleService.mouseDownCoord.x&&this.mouseDownCoord.x<=this.mouseUpCoord.x
          &&this.mouseDownCoord.y>=this.rectangleService.mouseDownCoord.y 
          &&  this.mouseDownCoord.y<=this.mouseUpCoord.y
          ){
            this.mouseDownInsideSelection=true;
            this.mouseDown=false;
            this.offsetX= this.mouseDownCoord.x-this.rectangleService.mouseDownCoord.x;
            this.offsetY=this.mouseDownCoord.y-this.rectangleService.mouseDownCoord.y;
            return;
          }
        
        
          this.rectangleService.onMouseDown(event);
          

      }
    
    }
    onMouseOut(event: MouseEvent): void {
      switch(this.selectionStyle){

        case 1:
          this.rectangleService.onMouseOut(event);



      }     
  }



  onMouseEnter(event: MouseEvent): void {
      this.rectangleService.isOut = false;
  }

  onMouseUp(event: MouseEvent): void {
    //this.rectangleService.onMouseUp(event);
        /*
      1 2 3
      4   5
      6 7 8
    */

   this.rectangleService.mouseDown = false;
   this.mouseDownInsideSelection=false;


    if(this.mouseDown){
    this.updateResizingHandles();
    this.drawResizingHandles();
    this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.rectangleService.mouseDownCoord,this.rectangleService.currentPos,this.rectangleService.toSquare);
    }
    this.mouseUpCoord=this.getPositionFromMouse(event);
    this.selectionActivated=true;

  }

  onMouseMove(event: MouseEvent): void {
    
    this.currentPos = this.getPositionFromMouse(event);

    
    if (this.mouseDownInsideSelection){

      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      
      this.rectangleService.drawRectangle(this.drawingService.previewCtx,{x:this.currentPos.x-this.offsetX ,y:this.currentPos.y-this.offsetY},{x:this.currentPos.x-this.offsetX+this.rectangleService.width, y:this.currentPos.y-this.offsetY+this.rectangleService.height},false);
      


    }
    else{
      this.rectangleService.onMouseMove(event);
    }
  }
  drawResizingHandles(){
    this.drawingService.previewCtx.beginPath();
    this.drawingService.previewCtx.fillStyle = '#ffffff';
    this.drawingService.previewCtx.strokeStyle="blue";
    this.drawingService.previewCtx.lineWidth=2;
    this.drawingService.previewCtx.setLineDash([0,0]);
    for ( let handle of this.resizingHandles){
        this.drawingService.previewCtx.rect(handle.x,handle.y,6,6);
    }
    this.drawingService.previewCtx.stroke();
    this.drawingService.previewCtx.fill();
    this.drawingService.previewCtx.closePath();
  }

  updateResizingHandles(){
    this.resizingHandles=[];
    let width = this.rectangleService.currentPos.x - this.rectangleService.mouseDownCoord.x;
    let height = this.rectangleService.currentPos.y - this.rectangleService.mouseDownCoord.y;
    
    /*
      1 2 3
      4   5
      6 7 8
    */
  
    //1
    this.resizingHandles.push({x:this.rectangleService.mouseDownCoord.x-3, y:this.rectangleService.mouseDownCoord.y-3});
    //2
    this.resizingHandles.push({x:this.rectangleService.mouseDownCoord.x+width/2 -3,y:this.rectangleService.mouseDownCoord.y-3})
    //3
    this.resizingHandles.push({x:this.rectangleService.mouseDownCoord.x+width-3,y:this.rectangleService.mouseDownCoord.y-3})
    //4
    this.resizingHandles.push({x:this.rectangleService.mouseDownCoord.x-3,y:this.rectangleService.mouseDownCoord.y+height/2-3})
    //5
    this.resizingHandles.push({x:this.rectangleService.currentPos.x-3,y:this.rectangleService.mouseDownCoord.y-3+height/2})
    //6
    this.resizingHandles.push({x:this.rectangleService.mouseDownCoord.x-3,y:this.rectangleService.mouseDownCoord.y-3+height})
    //7
    this.resizingHandles.push({x:this.rectangleService.mouseDownCoord.x+width/2-3,y:this.rectangleService.currentPos.y-3})
    //8
    this.resizingHandles.push({x:this.rectangleService.currentPos.x-3,y:this.rectangleService.currentPos.y-3})

  }

  onKeyUp(event: KeyboardEvent): void {
      this.rectangleService.onKeyUp(event);
  


  }

  onKeyDown(event: KeyboardEvent): void {
    switch(event.key){
      case 'r':
        this.selectionStyle=2;
        console.log("r detected");
        break;
        
        }
}
}
