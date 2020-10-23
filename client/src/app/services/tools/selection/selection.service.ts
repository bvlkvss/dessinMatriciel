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
    selectionWidth:number;
    selectionHeight:number;
    selectionData: HTMLCanvasElement;
    currenthandle: number;
    firstSelectionMove: boolean

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
            console.log("on rect");
            this.mouseDownInsideSelection=true;
            this.mouseDown=false;
            console.log("start point on offset", this.selectionStartPoint);
            console.log("mousedownon offset", this.mouseDownCoord);
            this.offsetX= this.mouseDownCoord.x-this.selectionStartPoint.x;
            this.offsetY=this.mouseDownCoord.y-this.selectionStartPoint.y;
            console.log("offsetX", this.offsetX);
            return;
          }
        else{
          this.drawingService.clearCanvas(this.drawingService.previewCtx);
          this.drawingService.baseCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
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
      let width =this.selectionEndPoint.x-this.selectionStartPoint.x;
      let height = this.selectionEndPoint.y-this.selectionStartPoint.y;
      const tempCtx = temp.getContext('2d') as CanvasRenderingContext2D;
      tempCtx.canvas.height=height;
      tempCtx.canvas.width=width;
      tempCtx.drawImage(this.drawingService.baseCtx.canvas,this.selectionStartPoint.x,this.selectionStartPoint.y,width,height,0,0,width,height);
      console.log("ctx height", tempCtx.canvas.height);
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
    //this.rectangleService.onMouseUp(event);
        /*
      1 2 3
      4   5
      6 7 8
    */
   console.log("start point before on mouse up", this.selectionStartPoint);

   this.rectangleService.mouseDown = false;
   this.mouseDownInsideSelection=false;

    
    if(this.mouseDown){
      
      
      
      this.mouseUpCoord=this.getPositionFromMouse(event);
      console.log("mouse up coord", this.mouseUpCoord);
      if(!this.selectionActivated){
        console.log("mouseup width", this.rectangleService.width);
        console.log("mouseup height", this.rectangleService.height);
        
        this.selectionEndPoint=this.mouseUpCoord;
        /*{
        x:this.selectionStartPoint.x+this.rectangleService.width,
        y:this.selectionStartPoint.y=this.rectangleService.height

      };*/
      
    }
    console.log("end point on mouse up", this.selectionEndPoint);
    
    let height = Math.abs(this.selectionEndPoint.y-this.selectionStartPoint.y);
    let width =Math.abs(this.selectionEndPoint.x-this.selectionStartPoint.x);
    /*
    this.drawingService.baseCtx.beginPath();
    this.drawingService.baseCtx.fillStyle="white";
    this.drawingService.baseCtx.rect(this.selectionStartPoint.x,this.selectionStartPoint.y,width,height);
    this.drawingService.baseCtx.fill();
    this.drawingService.baseCtx.closePath();
    */
   if (this.selectionEndPoint.y<this.selectionStartPoint.y){
     
     this.selectionEndPoint.y+=height;
     this.selectionStartPoint.y-=height;
     
    }
    if (this.selectionEndPoint.x<this.selectionStartPoint.x){
      
      this.selectionEndPoint.x+=width;
      this.selectionStartPoint.x-=width;
      
      
    }
    this.saveSelection();
    this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
    //this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,this.rectangleService.toSquare);
    console.log("start point after up", this.selectionStartPoint);
    console.log("end point after up ", this.selectionEndPoint);
    this.updateResizingHandles();
    this.drawResizingHandles();
  }
  this.selectionActivated=true;
  this.mouseDown=false;
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
    return;
  }
    
  if (this.mouseDownInsideSelection){
      

      this.drawingService.clearCanvas(this.drawingService.previewCtx);

    if(this.firstSelectionMove){
      let height = this.selectionEndPoint.y-this.selectionStartPoint.y;

      let width =Math.abs(this.selectionEndPoint.x-this.selectionStartPoint.x);
      this.drawingService.baseCtx.beginPath();
      this.drawingService.baseCtx.fillStyle="white";
      this.drawingService.baseCtx.rect(this.selectionStartPoint.x,this.selectionStartPoint.y,width,height);
      this.drawingService.baseCtx.fill();
      this.drawingService.baseCtx.closePath();
      this.firstSelectionMove=false;


    }

      this.selectionStartPoint={x:this.currentPos.x-this.offsetX,y:this.currentPos.y-this.offsetY};
      console.log("selection start point on move",this,this.selectionStartPoint);
      this.selectionEndPoint= {x: this.selectionStartPoint.x+Math.abs(this.rectangleService.width),y:this.selectionStartPoint.y+Math.abs(this.rectangleService.height)};
      this.rectangleService.drawRectangle(this.drawingService.previewCtx,this.selectionStartPoint,this.selectionEndPoint,false);
      this.drawingService.previewCtx.drawImage(this.selectionData, this.selectionStartPoint.x, this.selectionStartPoint.y);
      this.updateResizingHandles();
      this.drawResizingHandles();
      console.log(this.selectionData.height);


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


    for(let i=0;i<this.resizingHandles.length;i++){

      if(mousedownpos.x>=this.resizingHandles[i].x && mousedownpos.x<=this.resizingHandles[i].x+6
        && mousedownpos.y>=this.resizingHandles[i].y && mousedownpos.y<=this.resizingHandles[i].y+6){
          console.log("mouse down on handle: ",i+1);
          return i+1;
        }

    }
    //mouse not on any handle
    return -1;

  }

  onKeyUp(event: KeyboardEvent): void {
      this.rectangleService.onKeyUp(event);
  


  }

  onKeyDown(event: KeyboardEvent): void {
    
    if(event.key== "Escape"){
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.selectionActivated=false;
      
    }
    else{
    this.rectangleService.onKeyDown(event);
    }
  }


  resetSelection(): void{

    this.resizingHandles = [];
    this.rectangleService = new RectangleService(this.drawingService);
    this.selectionStyle=1;
    this.rectangleService.setStyle(0);
    this.rectangleService.lineDash=true;
    this.ellipseService.setStyle(0);
    this.selectionActivated=false;
    this.toolAttributes = [];
    this.firstSelectionMove=true;
  
  }
}
