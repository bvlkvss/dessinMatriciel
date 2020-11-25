import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {HttpClient} from  '@angular/common/http';

export interface EmailData {
    image:HTMLImageElement,
    email:string,
}

@Injectable({
    providedIn: 'root',
})

export class ExportService {
    emailData:EmailData;
    constructor(private drawingService: DrawingService, private http:HttpClient) {}

    sendEmailDataToServer(emailData:EmailData){
        
    }

    setFilter(image: HTMLImageElement, inputFilter: string): void {
        image.style.filter = inputFilter;
    }

    createEmailData(image:HTMLImageElement, email:string){
        this.emailData ={image, email}; 
    }

    createBaseImage(): HTMLImageElement {
        const canvas = this.drawingService.canvas;
        const image = new Image(canvas.width, canvas.height);
        image.src = canvas.toDataURL();
        return image;
    }

    exportImage(image: HTMLImageElement, name: string, filter: string, type: string): void {
        const src = this.createImageToExport(image, filter, type);
        const link = document.createElement('a');
        link.download = name;
        link.href = src;
        link.click();
    }

    private createImageToExport(image: HTMLImageElement, filter: string, type: string): string {
        const canvas = this.drawingService.previewCtx.canvas;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.filter = filter;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/' + type, 1.0);
        this.drawingService.clearCanvas(ctx);
        return dataUrl; 
    }
}
