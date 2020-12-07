import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EmailData } from '@common/classes/email-data';
const SERVER_URL = 'http://localhost:3000/api/emails';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    emailData: EmailData;
    constructor(private drawingService: DrawingService, private http: HttpClient) {}

    async sendEmailRequest(): Promise<boolean> {
        return this.http
            .post<EmailData>(SERVER_URL, this.emailData)
            .toPromise()
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    async sendEmailDataToServer(image: HTMLImageElement, name: string, filter: string, type: string, email: string): Promise<boolean> {
        const imageStr = this.createImageToExport(image, filter, type);
        this.createEmailData(imageStr, email, name, type);
        const isNotError = await this.sendEmailRequest();
        return isNotError;
    }

    setFilter(image: HTMLImageElement, inputFilter: string): void {
        image.style.filter = inputFilter;
    }

    createEmailData(image: string, email: string, name: string, type: string): void {
        this.emailData = { image, email, name, type };
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
