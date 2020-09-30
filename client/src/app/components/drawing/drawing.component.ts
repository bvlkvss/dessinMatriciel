import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { ResizingService } from '../../services/resizing/resizing.service';

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
    private keyBindings: Map<string, Tool> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private mouseFired: boolean;
    private resized: boolean;

    // private UpFired: boolean;
    // TODO : Avoir un service dédié pour gérer tous les outils ? Ceci peut devenir lourd avec le temps
    constructor(private drawingService: DrawingService, private tools: ToolsManagerService, private resizer: ResizingService) { }

    ngAfterViewInit(): void {
        this.keyBindings
            .set('c', this.tools.getTools()[0])
            .set('w', this.tools.getTools()[1])
            .set('e', this.tools.getTools()[3])
            .set('2', this.tools.getTools()[4]);
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.mouseFired = false;
        // this.UpFired = false;
    }

    initResizing(event: MouseEvent): void {
        event.stopPropagation();
        this.mouseFired = true;
        this.resizer.initResizing(event);
    }

    @HostListener('window:mousemove', ['$event'])
    resize(event: MouseEvent): void {
        event.stopPropagation();
        if (this.resizer.resizing) {
            this.resizer.resize(event);
        }
    }
    @HostListener('window:mouseup', ['$event'])
    stopResize(event: MouseEvent): void {
        if (this.resizer.resizing) {
            event.stopPropagation();
            this.resizer.stopResize(event, this.baseCanvas.nativeElement, this.previewCanvas.nativeElement);
        }
        // this.delay(100);
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const t = event.target as HTMLDivElement;
        if (t.className === 'resizer') {
            return;
        }
        this.tools.currentTool.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        const t = event.target as HTMLDivElement;
        if (t.className === 'resizer') {
            return;
        }
        this.tools.currentTool.onMouseDown(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (!this.resizer.resizing) {
            if (!this.resized) {
                this.resized = false;
                return;
            }
            this.tools.currentTool.onMouseEnter(event);
        }
    }

    @HostListener('dblclick', ['$event'])
    onDblClick(event: MouseEvent): void {
        this.tools.currentTool.onDblClick(event);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        const t = event.target as HTMLDivElement;
        if (this.mouseFired && !this.resizer.IsextendingCanvas()) {
            this.mouseFired = false;
            return;
        }
        if (t.className === 'resizer') {
            return;
        }
        this.tools.currentTool.onClick(event);
    }
    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.tools.currentTool.onMouseUp(event);
    }
    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        if (!this.resizer.resizing) {
            if (!this.resized) {
                this.resized = false;
                return;
            }
            this.tools.currentTool.onMouseOut(event);
        }
    }

    @HostListener('document:keyup', ['$event'])
    KeyUp(event: KeyboardEvent): void {
        this.tools.currentTool.onKeyUp(event);
    }


    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.drawingService.baseCtx.restore();
        this.drawingService.previewCtx.restore();
        if (this.keyBindings.has(event.key)) this.tools.currentTool = this.keyBindings.get(event.key) as Tool;
        else this.tools.currentTool.onKeyDown(event);

        /* switch (event.key) {
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
         } */
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
