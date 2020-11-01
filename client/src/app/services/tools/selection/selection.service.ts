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
    selectionStartPoint: Vec2;
    selectionEndPoint: Vec2;
    selectionData: HTMLCanvasElement;
    currenthandle: number;
    firstSelectionMove: boolean;
    width: number;
    height:number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.resizingHandles = [];
        this.selectionStyle=1;
        this.rectangleService = new RectangleService(drawingService);
        this.rectangleService.setStyle(0);
        this.rectangleService.lineDash=true;
        this.ellipseService = new EllipseService(drawingService);
        this.ellipseService.setStyle(0);
        this.ellipseService.secondaryColor="black";
        this.ellipseService.primaryColor="black";
        this.selectionActivated=false;
        this.toolAttributes = [];
        this.firstSelectionMove=true;

    }

    onMouseDown(event: MouseEvent): void {

      this.drawingService.clearCanvas(this.drawingService.previewCtx);

      this.mouseDown = event.button === MouseButton.Left;
      if (this.mouseDown) {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        
        
        if (this.selectionActivated){
        
        if(this.mouseDownOnHandle(this.mouseDownCoord)!=-1){
          this.currenthandle=this.mouseDownOnHandle(this.mouseDownCoord);
          return;
        }
        else if(this.mouseDownCoord.x>=this.selectionStartPoint.x&&this.mouseDownCoord.x<=this.selectionEndPoint.x
          &&this.mouseDownCoord.y>=this.selectionStartPoint.y 
          &&  this.mouseDownCoord.y<=this.selectionEndPoint.y
          ){
            this.mouseDownInsideSelection=true;
            this.mouseDown=false;
            this.offsetX= this.mouseDownCoord.x-this.selectionStartPoint.x;
            this.offsetY=this.mouseDownCoord.y-this.selectionStartPoint.y;
            return;
          }
        else{
          this.drawingService.clearCanvas(this.drawingService.previewCtx);
          this.drawingService.baseCtx.save();
          if (this.selectionStyle===1){
            this.ellipseService.secondaryColor='rgba(255,255,255,0)'

            this.ellipseService.drawEllipse(this.drawingService.baseCtx,this.selectionStartPoint,this.selectionEndPoint,false,false);
            this.drawingService.baseCtx.save();
            this.drawingService.baseCtx.clip();
            this.drawingService.baseCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
            this.drawingService.baseCtx.restore();
            this.ellipseService.secondaryColor="black";
          }
            else{
          this.drawingService.baseCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
            }
          this.drawingService.baseCtx.restore();

          this.resetSelection();
          this.selectionActivated=false;
          

        }
        }
          this.selectionStartPoint=this.getPositionFromMouse(event);
          this.rectangleService.onMouseDown(event);
          

      }
    
    }
    saveSelection(): void{
      const temp = document.createElement('canvas') as HTMLCanvasElement;
      let width= Math.abs(this.rectangleService.width);
      let height= Math.abs(this.rectangleService.height);
      const tempCtx = temp.getContext('2d') as CanvasRenderingContext2D;
      tempCtx.canvas.height=height;
      tempCtx.canvas.width=width;
      tempCtx.drawImage(this.drawingService.baseCtx.canvas,this.selectionStartPoint.x,this.selectionStartPoint.y,width,height,0,0,width,height);
     this.selectionData=temp;
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
        /*
      1 2 3
      4   5
      6 7 8
    */

   
   this.mouseUpCoord=this.getPositionFromMouse(event);
    if(this.mouseDown && this.mouseUpCoord.x!=this.selectionStartPoint.x &&this.mouseUpCoord.y!=this.selectionStartPoint.y){
      
      
      
      if(!this.selectionActivated){
        if(!this.rectangleService.isOut){
        this.selectionEndPoint=this.mouseUpCoord;
        }
        else{
          this.selectionEndPoint=this.rectangleService.mouseOutCoord;
        }
      }   
      this.width=Math.abs(this.rectangleService.width);
      this.height=Math.abs(this.rectangleService.height);
      if (this.selectionEndPoint.y<this.selectionStartPoint.y){
        
        this.selectionEndPoint.y=this.selectionStartPoint.y;
        this.selectionStartPoint.y-=this.height;
        
      }
      if (this.selectionEndPoint.x<this.selectionStartPoint.x){
        this.selectionEndPoint.x=this.selectionStartPoint.x;
        this.selectionStartPoint.x-=this.width;     
        
      }


      this.saveSelection();
      if (this.selectionStyle===1){
        this.drawingService.baseCtx.save();
        this.ellipseService.drawEllipse(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,this.rectangleService.toSquare,false);
        this.drawingService.baseCtx.restore();
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.clip();
        this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
        this.drawingService.previewCtx.restore();
      }
      else{
        this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
        
      }     
      this.updateResizingHandles();
      this.drawResizingHandles();
      this.selectionActivated=true;
      this.mouseDown=false;
    }
    this.rectangleService.mouseDown = false;
    this.rectangleService.toSquare = false;
    this.mouseDown=false;
  
    this.mouseDownInsideSelection=false;
  }
  
  onMouseMove(event: MouseEvent): void {
    
    this.currentPos = this.getPositionFromMouse(event);
    
    if(this.selectionActivated&&this.mouseDown){

    switch(this.currenthandle){
      case 1:
        this.selectionStartPoint=this.currentPos;
        break;
      case 2:
        this.selectionStartPoint.y=this.currentPos.y;
        break;
      case 3:
        this.selectionStartPoint.y=this.currentPos.y;
        this.selectionEndPoint.x=this.currentPos.x;
        break;
      case 4:
        this.selectionStartPoint.x=this.currentPos.x;
        break;
      case 5:
        this.selectionEndPoint.x=this.currentPos.x;
        break;
      case 6:
        this.selectionStartPoint.x=this.currentPos.x;
        this.selectionEndPoint.y=this.currentPos.y;
        break;
      case 7:
        this.selectionEndPoint.y=this.currentPos.y;
        break;
      case 8:
        this.selectionEndPoint=this.currentPos;
        break;
    }
  
    this.saveSelection();
    this.drawingService.clearCanvas(this.drawingService.previewCtx);
    this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false);
    if(this.selectionStyle===1){
      this.ellipseService.drawEllipse(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false,false);
    }
    this.updateResizingHandles();
    this.drawResizingHandles();
    return;
  }
    
  if (this.mouseDownInsideSelection){

    this.moveSelection(this.currentPos);

    }
    else if(this.mouseDown){
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.rectangleService.onMouseMove(event);
      if(this.selectionStyle==1)
       this.ellipseService.drawEllipse(this.drawingService.previewCtx,this.selectionStartPoint,this.currentPos,this.rectangleService.toSquare,false);
      
    }
  }



  drawResizingHandles(){
    this.drawingService.previewCtx.beginPath();
    this.drawingService.previewCtx.fillStyle = '#ffffff';
    this.drawingService.previewCtx.strokeStyle="blue";
    this.drawingService.previewCtx.lineWidth=2;
    this.drawingService.previewCtx.setLineDash([0,0]);
    //this.drawingService.previewCtx.shadowOffsetY = 1;
    //this.drawingService.previewCtx.shadowOffsetX = 1;
    for ( let handle of this.resizingHandles){
        this.drawingService.previewCtx.rect(handle.x,handle.y,6,6);
    }
    this.drawingService.previewCtx.stroke();
    this.drawingService.previewCtx.fill();
    this.drawingService.previewCtx.closePath();
  }

  updateResizingHandles(){
    this.resizingHandles=[];
    let width = Math.abs(this.rectangleService.width);
    let height = Math.abs(this.rectangleService.height);
    
    /*
      1 2 3
      4   5
      6 7 8
    */
  
    //1
    this.resizingHandles.push({x:this.selectionStartPoint.x-3, y:this.selectionStartPoint.y-3});
    //2
    this.resizingHandles.push({x:this.selectionStartPoint.x+width/2 -3,y:this.selectionStartPoint.y-3})
    //3
    this.resizingHandles.push({x:this.selectionStartPoint.x+width-3,y:this.selectionStartPoint.y-3})
    //4
    this.resizingHandles.push({x:this.selectionStartPoint.x-3,y:this.selectionStartPoint.y+height/2-3})
    //5
    this.resizingHandles.push({x:this.selectionStartPoint.x+width-3,y:this.selectionStartPoint.y-3+height/2})
    //6
    this.resizingHandles.push({x:this.selectionStartPoint.x-3,y:this.selectionStartPoint.y-3+height})
    //7
    this.resizingHandles.push({x:this.selectionStartPoint.x+width/2-3,y:this.selectionStartPoint.y+height-3})
    //8
    this.resizingHandles.push({x:this.selectionStartPoint.x+width-3,y:this.selectionStartPoint.y+height-3})

  }

  mouseDownOnHandle(mousedownpos: Vec2){
    /*
      1 2 3
      4   5
      6 7 8
    */

    for(let i=0;i<this.resizingHandles.length;i++){

      if(mousedownpos.x>=this.resizingHandles[i].x && mousedownpos.x<=this.resizingHandles[i].x+6
        && mousedownpos.y>=this.resizingHandles[i].y && mousedownpos.y<=this.resizingHandles[i].y+6){
          return i+1;
        }

    }
    //mouse not on any handle
    return -1;

  }

  onKeyUp(event: KeyboardEvent): void {
    
      this.rectangleService.onKeyUp(event);
      if(this.selectionStyle===1 && !event.shiftKey && this.mouseDown){
        this.ellipseService.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.rectangleService.toSquare);          
      }

      this.mouseDownInsideSelection=false;

  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'a') {
    this.selectAllCanvas();
    }
    else if(event.key== "Escape"){
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.selectionActivated=false;
      
    }
    else{
    this.rectangleService.onKeyDown(event);
    if(this.selectionStyle===1 && event.shiftKey && this.mouseDown){
      this.ellipseService.drawEllipse(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.rectangleService.toSquare);    
    }

    if(event.key==="ArrowRight"){
      this.offsetX=0;
      this.offsetY=0;
      this.selectionStartPoint.x+=3;
      this.moveSelection(this.selectionStartPoint);
    }
    if(event.key==="ArrowLeft"){
      this.offsetX=0;
      this.offsetY=0;
      this.selectionStartPoint.x-=3;
      this.moveSelection(this.selectionStartPoint);
    }
    if(event.key==="ArrowUp"){
      this.offsetX=0;
      this.offsetY=0;
      this.selectionStartPoint.y-=3;
      this.moveSelection(this.selectionStartPoint);
    }

    if(event.key==="ArrowDown"){
      this.offsetX=0;
      this.offsetY=0;
      console.log("arrow up");
      this.selectionStartPoint.y+=3;
      this.moveSelection(this.selectionStartPoint);
    }

    }
  }


  resetSelection(): void{

    this.resizingHandles = [];
    this.rectangleService = new RectangleService(this.drawingService);
    //this.selectionStyle=0;
    this.rectangleService.setStyle(0);
    this.rectangleService.lineDash=true;
    this.ellipseService.setStyle(0);
    this.selectionActivated=false;
    this.toolAttributes = [];
    this.firstSelectionMove=true;
  
  }

 moveSelection(endpoint: Vec2): void{
  this.drawingService.clearCanvas(this.drawingService.previewCtx);


  if(this.firstSelectionMove){
    this.eraseSelectionFromBase();
  }
    this.selectionStartPoint={x:endpoint.x-this.offsetX,y:endpoint.y-this.offsetY};
    this.selectionEndPoint= {x: this.selectionStartPoint.x+Math.abs(this.rectangleService.width),y:this.selectionStartPoint.y+Math.abs(this.rectangleService.height)};
      //this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false);
      //break;
      this.drawingService.previewCtx.save();
        if (this.selectionStyle===1)  
          this.ellipseService.drawEllipse(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false,false);
        
      
      this.drawingService.previewCtx.clip();
      console.log("moving selection");
      this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
      this.drawingService.previewCtx.restore();
      
    this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false);
    if (this.selectionStyle===1){
      this.ellipseService.secondaryColor="black";
      console.log("drwing ellipse")
      this.ellipseService.setStyle(0);
      this.ellipseService.drawEllipse(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false,false);


    }
    //this.updateResizingHandles();
    //this.drawResizingHandles();
    


}



eraseSelectionFromBase(): void{
  console.log("whiteout");
  this.drawingService.baseCtx.beginPath();
  this.drawingService.baseCtx.fillStyle="white";
  switch(this.selectionStyle){
  case 0:
    this.drawingService.baseCtx.rect(this.selectionStartPoint.x,this.selectionStartPoint.y,this.width,this.height);
    break;
  case 1:
    this.ellipseService.setStyle(2);
    this.ellipseService.primaryColor="white";
    let toCircle=false;
    if(this.height===this.width)
        toCircle=true;
    this.ellipseService.drawEllipse(this.drawingService.baseCtx,this.selectionStartPoint,this.selectionEndPoint,toCircle,false);
    break;
}
this.drawingService.baseCtx.fill();
this.drawingService.baseCtx.closePath();
this.firstSelectionMove=false;

}


selectAllCanvas(): void{

  console.log("ctrl a");
  this.selectionStartPoint={x:0,y:0};
  console.log("canvas width", this.drawingService.canvas.width);
  console.log("canvas height", this.drawingService.canvas.height);
  this.rectangleService.width=this.drawingService.canvas.width;
  this.rectangleService.height=this.drawingService.canvas.height;
  this.width=this.drawingService.canvas.width-2;
  this.height=this.drawingService.canvas.height-2;

  this.selectionEndPoint={x:this.drawingService.canvas.width-2,y:this.drawingService.canvas.height-2};

  this.saveSelection();
  
  this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
  this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false);
  this.selectionActivated=true;
}
}
