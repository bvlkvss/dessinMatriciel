import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Drawings } from '@common/classes/drawings';
import { Observable } from 'rxjs';

const SERVER_URL = 'http://localhost:3000/api/drawings';

@Injectable({ providedIn: 'root' })
export class SavingService {
    loading: boolean;

    constructor(private http: HttpClient, private drawingService: DrawingService) {
        this.loading = false;
    }
    /* tslint:disable:no-any*/
    addDrawing(image: HTMLImageElement, dessin: Drawings): Observable<any> {
        this.loading = true;
        dessin.imageData = this.createImageToExport(image);
        return this.http.post<string>(SERVER_URL, dessin);
    }

    private createImageToExport(image: HTMLImageElement): string {
        const canvas = this.drawingService.previewCtx.canvas;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/');
    }

    createBaseImage(): HTMLImageElement {
        const canvas = this.drawingService.canvas;
        const image = new Image(canvas.width, canvas.height);
        image.src = canvas.toDataURL();
        return image;
    }
}
