import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
const MIN_SIZE = 250;
const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 800;
@Injectable({
    providedIn: 'root',
})
export class ResizingService {
    currentResizer: string;
    resizing: boolean = false;
    hasBeenResized: boolean = false;
    resizedWidth: number;
    resizedHeight: number;
    oldResolution: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    constructor(private drawingService: DrawingService) { }

    initResizing(event: MouseEvent): void {
        if (event.button === 0) {
            const target = event.target as HTMLDivElement;
            event.preventDefault();
            this.currentResizer = target.className;
            this.resizedWidth = this.drawingService.canvas.width;
            this.resizedHeight = this.drawingService.canvas.height;
            this.resizing = true;
            this.hasBeenResized = true;
        }
    }
    resizeFromRight(event: MouseEvent, div: HTMLDivElement, preview: HTMLCanvasElement): void {
        if (event.pageX - div.getBoundingClientRect().left >= MIN_SIZE) {
            this.resizedWidth = event.pageX - div.getBoundingClientRect().left;
            preview.width = this.resizedWidth;
        } else {
            this.resizedWidth = MIN_SIZE;
            preview.width = this.resizedWidth;
        }
    }
    resizeFromBottom(event: MouseEvent, div: HTMLDivElement, preview: HTMLCanvasElement): void {
        if (event.pageY - div.getBoundingClientRect().top >= MIN_SIZE) {
            this.resizedHeight = event.pageY - div.getBoundingClientRect().top;
            preview.height = this.resizedHeight;
        } else {
            this.resizedHeight = MIN_SIZE;
        }
    }
    resizeFromBottomRight(event: MouseEvent, div: HTMLDivElement, preview: HTMLCanvasElement): void {
        if (event.pageX - div.getBoundingClientRect().left >= MIN_SIZE && event.pageY - div.getBoundingClientRect().top >= MIN_SIZE) {
            this.resizedWidth = event.pageX - div.getBoundingClientRect().left;
            this.resizedHeight = event.pageY - div.getBoundingClientRect().top;
            preview.width = this.resizedWidth;
            preview.height = this.resizedHeight;
        } else {
            this.resizedWidth = MIN_SIZE;
            this.resizedHeight = MIN_SIZE;
            preview.width = this.resizedWidth;
            preview.height = this.resizedHeight;
        }
    }

    resize(event: MouseEvent, preview: HTMLCanvasElement): void {
        const t = document.querySelector('#canvas-container') as HTMLDivElement;
        if (this.resizing && event.button === 0) {
            switch (this.currentResizer) {
                case 'resizer right':
                    this.resizeFromRight(event, t, preview);
                    break;
                case 'resizer bottom':
                    this.resizeFromBottom(event, t, preview);
                    break;
                case 'resizer bottom-right':
                    this.resizeFromBottomRight(event, t, preview);
                    break;
            }
            t.style.width = this.resizedWidth + 'px';
            t.style.height = this.resizedHeight + 'px';
        }
    }
    stopResize(event: MouseEvent, base: HTMLCanvasElement): void {
        const temp = this.saveCanvas();
        if (this.resizing) {
            this.oldResolution.x = base.width;
            this.oldResolution.y = base.height;
            base.width = this.resizedWidth;
            base.height = this.resizedHeight;
            this.resizing = false;
        }
        this.drawCanvas(temp);
    }
    saveCanvas(): HTMLCanvasElement {
        const temp = document.createElement('canvas');
        temp.width = this.resizedWidth;
        temp.height = this.resizedHeight;
        const tempCtx = temp.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(this.drawingService.canvas, 0, 0, this.resizedWidth, this.resizedHeight, 0, 0, temp.width, temp.height);
        }
        return temp;
    }

    drawCanvas(save: HTMLCanvasElement): void {
        if (this.hasBeenResized) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
        }
        this.drawingService.baseCtx.drawImage(save, 0, 0);
    }
}
