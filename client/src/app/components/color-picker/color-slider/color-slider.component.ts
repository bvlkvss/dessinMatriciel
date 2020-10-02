/****************************************************************************************
 * this code was inspired from :
 *
 *    Title: color-picker Component with Angular
 *    Author: Lukas Marx
 *    Date: 2018
 *    Availability: https://malcoded.com/posts/angular-color-picker/
 *
 ***************************************************************************************/

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Injectable, Output, ViewChild } from '@angular/core';
@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    @Output()
    color: EventEmitter<string> = new EventEmitter();

    private ctx: CanvasRenderingContext2D;
    private mousedown: boolean = false;
    selectedHeight: number;

    draw(): void {
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;
        this.ctx.clearRect(0, 0, width, height);
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        /*tslint:disable:no-magic-numbers*/
        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

        this.ctx.beginPath();
        this.ctx.rect(0, 0, width, height);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();

        if (this.selectedHeight) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 5;
            this.ctx.rect(0, this.selectedHeight - 5, width, 10);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    ngAfterViewInit(): void {
        this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.draw();
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(evt: MouseEvent): void {
        this.mousedown = false;
    }

    rgbToHex(rgb: number): string {
        let hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = '0' + hex;
        }
        return hex;
    }

    getColorAtPosition(x: number, y: number): string {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return '#' + this.rgbToHex(imageData[0]) + '' + this.rgbToHex(imageData[1]) + '' + this.rgbToHex(imageData[2]);
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    onMouseDown(event: MouseEvent): void {
        this.mousedown = true;
        this.selectedHeight = event.offsetY;
        this.draw();
        this.emitColor(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mousedown) {
            this.selectedHeight = event.offsetY;
            this.draw();
            this.emitColor(event.offsetX, event.offsetY);
        }
    }
}
