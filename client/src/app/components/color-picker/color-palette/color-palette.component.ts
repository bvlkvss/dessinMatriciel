/****************************************************************************************
 * this code was inspired from :
 *
 *    Title: color-picker Component with Angular
 *    Author: Lukas Marx
 *    Date: 2018
 *    Availability: https://malcoded.com/posts/angular-color-picker/
 *
 ***************************************************************************************/

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Const } from '@app/classes/constants';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
    @Input()
    hue: string;

    @Output()
    color: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    private ctx: CanvasRenderingContext2D;

    private mousedown: boolean = false;

    selectedPosition: { x: number; y: number };

    ngAfterViewInit(): void {
        this.draw();
    }

    draw(): void {
        if (this.canvas) {
            this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            const width = this.canvas.nativeElement.width;
            const height = this.canvas.nativeElement.height;

            this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)';
            this.ctx.fillRect(0, 0, width, height);

            const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0);
            whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
            whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');

            this.ctx.fillStyle = whiteGrad;
            this.ctx.fillRect(0, 0, width, height);

            const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height);
            blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
            blackGrad.addColorStop(1, 'rgba(0,0,0,1)');

            this.ctx.fillStyle = blackGrad;
            this.ctx.fillRect(0, 0, width, height);
        }
        if (this.selectedPosition) {
            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, Const.STARTING_ARC_RADIUS, 0, 2 * Math.PI);
            this.ctx.lineWidth = Const.STARTING_LINE_WIDTH;
            this.ctx.stroke();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hue) {
            this.draw();
            const pos = this.selectedPosition;
            if (pos) {
                this.color.emit(this.getColorAtPosition(pos.x, pos.y));
            }
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(evt: MouseEvent): void {
        this.mousedown = false;
    }

    onMouseDown(evt: MouseEvent): void {
        this.mousedown = true;
        this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
        this.draw();
        this.color.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY));
    }

    onMouseMove(evt: MouseEvent): void {
        if (this.mousedown) {
            this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
            this.draw();
            this.emitColor(evt.offsetX, evt.offsetY);
        }
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number): string {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return '#' + this.rgbToHex(imageData[0]) + '' + this.rgbToHex(imageData[1]) + '' + this.rgbToHex(imageData[2]);
    }
    rgbToHex(rgb: number): string {
        let hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = '0' + hex;
        }
        return hex;
    }
}
