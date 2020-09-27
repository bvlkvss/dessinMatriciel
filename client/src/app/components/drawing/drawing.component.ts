import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

// TODO : Avoir un fichier séparé pour les constantes ?
export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private currentResizer: string;
    private resizing: boolean = false;
    private resizedWidth: number;
    private resizedHeight: number;
    // TODO : Avoir un service dédié pour gérer tous les outils ? Ceci peut devenir lourd avec le temps
    constructor(private drawingService: DrawingService, private tools: ToolsManagerService) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
    }

    initResizing(event: MouseEvent): void {
        if (event.button === 0) {
            const target = event.target as HTMLDivElement;
            event.preventDefault();
            this.currentResizer = target.className;
            this.resizing = true;
            console.log(this.currentResizer);
        }
    }
    
    @HostListener('window:mousemove', ['$event'])
    resize(event: MouseEvent): void {
        const t = document.querySelector('#canvas-container') as HTMLDivElement;
        if (this.resizing && event.button === 0) {
            if (this.currentResizer === 'resizer right') {
                t.style.width = event.pageX - t.getBoundingClientRect().left + 'px';
                this.resizedWidth = event.pageX - t.getBoundingClientRect().left;
                console.log(this.currentResizer);
            } else if (this.currentResizer === 'resizer bottom') {
                t.style.height = event.pageY - t.getBoundingClientRect().top + 'px';
                this.resizedHeight = event.pageY - t.getBoundingClientRect().top;
                console.log(this.currentResizer);
            } else if (this.currentResizer === 'resizer bottom-right') {
                t.style.width = event.pageX - t.getBoundingClientRect().left + 'px';
                this.resizedWidth = event.pageX - t.getBoundingClientRect().left;
                t.style.height = event.pageY - t.getBoundingClientRect().top + 'px';
                this.resizedHeight = event.pageY - t.getBoundingClientRect().top;
            }
        }
    }
    @HostListener('window:mouseup', ['$event'])
    stopResize(event: MouseEvent): void {
        if (this.resizing) {
            if (this.currentResizer === 'resizer right') {
                this.baseCanvas.nativeElement.width = this.resizedWidth;
                this.previewCanvas.nativeElement.width = this.resizedWidth;
            } else if (this.currentResizer === 'resizer bottom') {
                this.baseCanvas.nativeElement.height = this.resizedHeight;
                this.previewCanvas.nativeElement.height = this.resizedHeight;
            } else if (this.currentResizer === 'resizer bottom-right') {
                this.baseCanvas.nativeElement.width = this.resizedWidth;
                this.previewCanvas.nativeElement.width = this.resizedWidth;
                this.baseCanvas.nativeElement.height = this.resizedHeight;
                this.previewCanvas.nativeElement.height = this.resizedHeight;
            }
            this.resizing = false;
            console.log('Resizing stopped');
        }
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onMouseMove(event);
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onMouseDown(event);
        }
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onMouseEnter(event);
        }
    }
    @HostListener('dblclick', ['$event'])
    onDblClick(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onDblClick(event);
        }
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onClick(event);
        }
    }
    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onMouseUp(event);
        }
    }
    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onMouseOut(event);
        }
    }

    @HostListener('document:keyup', ['$event'])
    KeyUp(event: KeyboardEvent): void {
        if (!this.resizing) {
            this.tools.currentTool.onKeyUp(event);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (!this.resizing) {
            this.drawingService.baseCtx.restore();
            this.drawingService.previewCtx.restore();

            switch (event.key) {
                case '1':
                    this.tools.setTools(2);
                    break;
                case 'w':
                    this.tools.setTools(1); // pour tester setRGB bleu,initialement coleur noir !!

                    break;
                case 'c':
                    this.tools.setTools(0);
                    this.previewCtx.canvas.style.cursor = 'crosshair';
                    break;
                case 'e':
                    // tslint:disable-next-line:no-magic-numbers
                    this.tools.setTools(3);
                    this.previewCtx.canvas.style.cursor = "url('whiteSquare.png'), auto";
                    console.log('eraser');
                    // tslint:disable-next-line:no-magic-numbers
                    this.tools.setColor('#ffffff');
                    break;

                case '2':
                    // tslint:disable-next-line:no-magic-numbers
                    this.tools.setTools(4);
                    break;
                default:
                    this.tools.currentTool.onKeyDown(event);
                    break;
            }
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
