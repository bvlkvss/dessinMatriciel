import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Drawings } from '@app/components/carrousel/carrousel.component';
import { DrawingService } from '@app/services/drawing/drawing.service';

const CONTAINER_WIDTH = 301;
const CONTAINER_HEIGHT = 200;
@Component({
    selector: 'app-drawing-card',
    templateUrl: './drawing-card.component.html',
    styleUrls: ['./drawing-card.component.scss'],
})
export class DrawingCardComponent implements OnInit, AfterViewChecked {
    @Input() drawingIndex: number = 0;
    @ViewChild('card') card: ElementRef<HTMLDivElement>;
    @ViewChild('image') image: ElementRef<HTMLImageElement>;

    onDelete: boolean = false;
    mouseOver: boolean = false;
    @Output() deleteDrawing: EventEmitter<Drawings>;
    constructor(private drawingService: DrawingService) {
        this.deleteDrawing = new EventEmitter<Drawings>();
    }
    @Input() drawing: Drawings;

    ngAfterViewChecked(): void {
        this.setImageSize();
        if (this.drawingIndex !== 1) {
            this.card.nativeElement.firstElementChild?.setAttribute('style', 'opacity: 0.3; pointer-events: none; ');
        } else {
            this.card.nativeElement.firstElementChild?.setAttribute('style', 'opacity: 1');
            if (this.mouseOver)
                this.card.nativeElement.firstElementChild?.setAttribute(
                    'style',
                    '-webkit-box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75);-moz-box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75);box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75); opacity:1',
                );
        }
    }
    setImageSize(): void {
        const ratio = this.image.nativeElement.naturalWidth / this.image.nativeElement.naturalHeight;
        if (ratio >= 1) {
            this.image.nativeElement.width = CONTAINER_WIDTH;
            this.image.nativeElement.height = this.image.nativeElement.naturalHeight / ratio;
        } else {
            this.image.nativeElement.width = this.image.nativeElement.naturalWidth * ratio;
            this.image.nativeElement.height = CONTAINER_HEIGHT;
        }
    }
    /* tslint:disable:no-empty */
    ngOnInit(): void { }
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.drawingIndex === 1) this.mouseOver = true;
    }
    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        if (this.drawingIndex === 1) this.mouseOver = false;
    }
    delete(drawing: Drawings): void {
        if (confirm('Voulez vous supprimer le dessin ?')) this.deleteDrawing.emit(drawing);
    }
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        const element = event.target as HTMLElement;
        if (element.className === 'btn') {
            this.onDelete = true;
            this.delete(this.drawing);
        } else {
            if (this.drawingIndex === 1) {
                if (this.drawingService.canvas.toDataURL() !== this.drawingService.blankCanvasDataUrl) {
                    if (confirm('Voulez vous abandonner vos changements actuel ?')) this.drawImage();
                } else this.drawImage();
            }
        }
    }
    drawImage(): void {
        this.drawingService.baseCtx.clearRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const image = new Image();
        image.src = this.drawing.imageData;
        this.resizeCanvas(image);
        this.drawingService.baseCtx.drawImage(image, 0, 0, image.width, image.height);
    }
    resizeCanvas(image: HTMLImageElement): void {
        this.drawingService.canvasContainer.style.width = image.width + 'px';
        this.drawingService.canvasContainer.style.height = image.height + 'px';
        this.drawingService.canvas.width = this.drawingService.previewCanvas.width = image.width;
        this.drawingService.canvas.height = this.drawingService.previewCanvas.height = image.height;
    }
}
