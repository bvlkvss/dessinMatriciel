import { Injectable } from '@angular/core';
import { DrawingService } from '../drawing/drawing.service'
@Injectable({
    providedIn: 'root',
})

export class ExportService {
    constructor(private drawingService: DrawingService){}

    setFilter(inputFilter:string, inputType:string):void{
        let image = this.createImageToExport(inputType);
        switch (inputFilter){
            case "Flou":
                image.style.filter = 'blur(5px)';
                break;
    
            case "Noir et Blanc":
                image.style.filter = 'grayscale(100%)';
                break;

            case "Lumineux":
                image.style.filter = 'brightness(200%)';
                break;
            
            case "Contraste":
                image.style.filter = 'contrast(200%)';
                break;
                
            case "Inversement des couleurs":
                image.style.filter = 'hue-rotate(90deg)';
                break;
        }
    }
    
    private createImageToExport(type:string):HTMLImageElement {
        let canvas = this.drawingService.canvas;
        let image = new Image(canvas.width, canvas.height);
        image.src = canvas.toDataURL('image/'+type);
        return image;
    }
    


}
