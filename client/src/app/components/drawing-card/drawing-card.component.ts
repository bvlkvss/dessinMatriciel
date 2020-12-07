import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Const } from '@app/classes/constants';
import { Drawings } from '@app/components/carrousel/carrousel.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-drawing-card',
    templateUrl: './drawing-card.component.html',
    styleUrls: ['./drawing-card.component.scss'],
})
export class DrawingCardComponent implements AfterViewChecked {
    @Input() drawingIndex: number;
    @ViewChild('card') card: ElementRef<HTMLDivElement>;
    @ViewChild('image') image: ElementRef<HTMLImageElement>;
    onDelete: boolean;
    mouseOver: boolean;
    @Output() deleteDrawing: EventEmitter<Drawings>;
    constructor(private drawingService: DrawingService) {
        this.onDelete = false;
        this.drawingIndex = 0;
        this.mouseOver = false;
        this.deleteDrawing = new EventEmitter<Drawings>();
    }
    @Input() drawing: Drawings;

    static getImage(imageData: string): Observable<HTMLImageElement> {
        return new Observable((observer) => {
            const image = new Image();
            image.src = imageData;
            image.onload = () => {
                observer.next(image);
                observer.complete();
            };
        });
    }
    static drawImage(drawingService: DrawingService, imageData: string): void {
        drawingService.baseCtx.clearRect(0, 0, drawingService.canvas.width, drawingService.canvas.height);
        DrawingCardComponent.getImage(imageData).subscribe((image: HTMLImageElement) => {
            this.resizeCanvas(image, drawingService);
            drawingService.baseCtx.drawImage(image, 0, 0, image.width, image.height);
            localStorage.setItem('drawing', drawingService.baseCtx.canvas.toDataURL());
        });
    }
    static resizeCanvas(image: HTMLImageElement, drawingService: DrawingService): void {
        drawingService.canvasContainer.style.width = image.width + 'px';
        drawingService.canvasContainer.style.height = image.height + 'px';
        drawingService.canvas.width = drawingService.previewCanvas.width = image.width;
        drawingService.canvas.height = drawingService.previewCanvas.height = image.height;
    }
    ngAfterViewChecked(): void {
        this.setImageSize();
        if (this.drawingIndex !== 1) {
            this.card.nativeElement.firstElementChild?.setAttribute('style', 'opacity: 0.3; pointer-events: none; ');
            return;
        }
        this.card.nativeElement.firstElementChild?.setAttribute('style', 'opacity: 1');
        if (this.mouseOver)
            this.card.nativeElement.firstElementChild?.setAttribute(
                'style',
                '-webkit-box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75);-moz-box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75);box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75); opacity:1',
            );
    }
    private setImageSize(): void {
        const ratio = this.image.nativeElement.naturalWidth / this.image.nativeElement.naturalHeight;
        if (ratio >= 1) {
            this.image.nativeElement.width = Const.CONTAINER_WIDTH;
            this.image.nativeElement.height = this.image.nativeElement.naturalHeight / ratio;
        } else {
            this.image.nativeElement.width = this.image.nativeElement.naturalWidth * ratio;
            this.image.nativeElement.height = Const.CONTAINER_HEIGHT;
        }
    }
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
            return;
        }
        if (this.drawingIndex === 1) {
            if (this.drawingService.canvas.toDataURL() !== this.drawingService.blankCanvasDataUrl) {
                if (confirm('Voulez vous abandonner vos changements actuel ?'))
                    DrawingCardComponent.drawImage(this.drawingService, this.drawing.imageData);
                return;
            }
            DrawingCardComponent.drawImage(this.drawingService, this.drawing.imageData);
        }
    }
}
