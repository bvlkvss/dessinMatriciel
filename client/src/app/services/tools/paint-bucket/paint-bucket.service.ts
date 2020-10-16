import { Injectable } from '@angular/core';
import { Color } from '../../../classes/color';
import { Tool } from '../../../classes/tool';
import { Vec2 } from '../../../classes/vec2';
import { DrawingService } from '../../drawing/drawing.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const RGBA_NUMBER_OF_COMPONENTS = 4;

@Injectable({
    providedIn: 'root',
})
export class PaintBucketService extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.toolAttributes = [];
    }

    onMouseDown(event: MouseEvent): void {
        this.isOut = false;
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && !this.isOut) {
            this.currentPos = this.getPositionFromMouse(event);
            let newImageData:ImageData = this.fillNonContiguousArea(this.mouseDownCoord);
            this.drawingService.baseCtx.putImageData(newImageData,0,0);
        }
        this.mouseDown = false;
    }

    onMouseEnter(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
        this.isOut = false;
    }

    private fillNonContiguousArea(position:Vec2):ImageData{
        let startingColor:Color = this.getActualColor(position);
        let canvas:HTMLCanvasElement = this.drawingService.canvas;
        let ctx:CanvasRenderingContext2D = this.drawingService.baseCtx;
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        for (let i = 0; i<imageData.data.length; i+=4){
            if(this.areColorsMatching(startingColor, imageData, i)){
                this.fillPixel(imageData, i);
            }
        }
        return imageData;
    }

   /* private fillContiguousArea(position:Vec2):ImageData{
        let startingColor:Color = this.getActualColor(position);
        let pixelStack = [position];
        let newPosition:Vec2
        let pixelPosition:number
        let canvas:HTMLCanvasElement = this.drawingService.canvas;
        let ctx:CanvasRenderingContext2D = this.drawingService.baseCtx;
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        while(pixelStack.length){
           newPosition = pixelStack.pop() as Vec2;
           pixelPosition = (newPosition.y*canvas.width + newPosition.x) *  RGBA_NUMBER_OF_COMPONENTS;

           while(newPosition.y-- >= 0 && this.areColorsMatching(startingColor, imageData, pixelPosition)){
               pixelPosition -= canvas.width * RGBA_NUMBER_OF_COMPONENTS;
           } 
           pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
           ++newPosition.y;
           let isLeftReached = false;
           let isRightReached = false;
           while(newPosition.y++ < canvas.height-1 && this.areColorsMatching(startingColor, imageData, pixelPosition)){
            this.fillPixel(imageData, pixelPosition);
            if(newPosition.x > 0){
                if(this.areColorsMatching(startingColor, imageData, pixelPosition-RGBA_NUMBER_OF_COMPONENTS)){
                    if(!isLeftReached){
                        pixelStack.push({x:newPosition.x-1, y:newPosition.y });
                        isLeftReached = true;
                    }
                }
                else if(isLeftReached){
                    isLeftReached = false;
                }
            }
            if(newPosition.x < canvas.width-1){
                if(this.areColorsMatching(startingColor, imageData, pixelPosition+RGBA_NUMBER_OF_COMPONENTS)){
                    if(!isRightReached){
                        pixelStack.push({x:newPosition.x+1, y:newPosition.y });
                        isRightReached = true;
                    }
                }
                else if(isLeftReached){
                    isRightReached = false;
                }
            }
            pixelPosition += canvas.width*4;
           }
        }
        return imageData;
    }
*/
    private areColorsMatching(color:Color, imageData:ImageData, position:number):boolean{
        let pixelRed = imageData.data[position];
        let pixelGreen = imageData.data[position+1];
        let pixelBlue = imageData.data[position+2];
        return (pixelRed === color.red && pixelGreen === color.green && pixelBlue === color.blue);
    }

    private fillPixel(imageData:ImageData, position:number):void{
        let color:Color = this.hexToColor(this.primaryColor);
        imageData.data[position] = color.red;
        imageData.data[position+1] = color.green;
        imageData.data[position+2] = color.blue;
    }

    private getActualColor(position: Vec2): Color {
        let imageData = this.drawingService.baseCtx.getImageData(position.x, position.y, 1, 1);
        return this.getColorFromData(imageData);
    }

    private getColorFromData(imageData: ImageData): Color {
        let redData: number = 0;
        let greenData: number = 0;
        let blueData: number = 0;
        let opacityData: number = 0;
        for (let j = 0; j < imageData.data.length; j += RGBA_NUMBER_OF_COMPONENTS) {
            redData = imageData.data[j];
            // Invert Red
            greenData = imageData.data[j + 1]; // Invert Green
            blueData = imageData.data[j + 2]; // Invert Blue
            opacityData = imageData.data[j + 3];
        }
        return { red: redData, green: greenData, blue: blueData, opacity: opacityData };
    }
}
