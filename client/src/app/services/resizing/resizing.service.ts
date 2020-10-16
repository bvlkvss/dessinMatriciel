import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
const MIN_SIZE = 250;
const PROPORTION_SIZE = 0.95;
@Injectable({
    providedIn: 'root',
})
export class ResizingService {
    currentResizer: string;
    resizing: boolean = false;
    hasBeenResized: boolean = false;
    isMaximazed: boolean = false;
    resizedWidth: number;
    resizedHeight: number;
    constructor(private drawingService: DrawingService) {}

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
        const calculatedWidth = event.pageX - div.getBoundingClientRect().left;
        const winWidht = window.innerWidth || document.body.clientWidth;
        if (calculatedWidth >= winWidht * PROPORTION_SIZE) {
            this.isMaximazed = true;
            return;
        }
        if (calculatedWidth >= MIN_SIZE) {
            this.resizedWidth = calculatedWidth;
            preview.width = this.resizedWidth;
        } else {
            this.resizedWidth = MIN_SIZE;
            preview.width = this.resizedWidth;
        }

        this.isMaximazed = false;
    }

    resizeFromBottom(event: MouseEvent, div: HTMLDivElement, preview: HTMLCanvasElement): void {
        const calculatedHeight = event.pageY - div.getBoundingClientRect().top;
        const winHeight = window.innerHeight || document.body.clientHeight;
        if (calculatedHeight >= winHeight * PROPORTION_SIZE) {
            this.isMaximazed = true;
            return;
        }
        if (calculatedHeight >= MIN_SIZE) {
            this.resizedHeight = calculatedHeight;
            preview.height = this.resizedHeight;
        } else {
            this.resizedHeight = MIN_SIZE;
        }

        this.isMaximazed = false;
    }

    resizeFromBottomRight(event: MouseEvent, div: HTMLDivElement, preview: HTMLCanvasElement): void {
        const calculatedWidth = event.pageX - div.getBoundingClientRect().left;
        const calculatedHeight = event.pageY - div.getBoundingClientRect().top;
        const size = {
            width: window.innerWidth || document.body.clientWidth,
            height: window.innerHeight || document.body.clientHeight,
        };
        if (calculatedWidth >= size.width * PROPORTION_SIZE || calculatedHeight >= size.height * PROPORTION_SIZE) {
            this.isMaximazed = true;
            return;
        }
        if (calculatedWidth >= MIN_SIZE && calculatedHeight >= MIN_SIZE) {
            this.resizedWidth = calculatedWidth;
            this.resizedHeight = calculatedHeight;
            preview.width = this.resizedWidth;
            preview.height = this.resizedHeight;
        } else if (calculatedWidth >= MIN_SIZE) {
            this.resizeFromRight(event, div, preview);
        } else if (calculatedHeight >= MIN_SIZE) {
            this.resizeFromBottom(event, div, preview);
        }

        this.isMaximazed = false;
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
            base.width = this.resizedWidth;
            base.height = this.resizedHeight;
            this.resizing = false;
        }

        this.drawCanvas(temp);
    }

    saveCanvas(): HTMLCanvasElement {
        const temp = document.createElement('canvas') as HTMLCanvasElement;
        temp.width = this.resizedWidth;
        temp.height = this.resizedHeight;
        const tempCtx = temp.getContext('2d') as CanvasRenderingContext2D;
        tempCtx.drawImage(this.drawingService.baseCtx.canvas, 0, 0, this.resizedWidth, this.resizedHeight, 0, 0, temp.width, temp.height);
        console.log(temp.height);
        return temp;
    }

    drawCanvas(save: HTMLCanvasElement): void {
        if (this.hasBeenResized) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
        }

        this.drawingService.baseCtx.drawImage(save, 0, 0);
    }
}
