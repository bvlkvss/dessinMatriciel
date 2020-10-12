import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { UndoRedoService } from '../../services/undo-redo/undo-redo.service';

// TODO : Avoir un fichier séparé pour les constantes ?

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('container') container: ElementRef<HTMLDivElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private keyBindings: Map<string, Tool> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private mouseFired: boolean;

    constructor(
        private drawingService: DrawingService,
        private tools: ToolsManagerService,
        private resizer: ResizingService,
        private invoker: UndoRedoService,
    ) { }

    ngOnInit(): void {
        this.drawingService.resizeCanvas();
    }

    ngAfterViewInit(): void {
        this.keyBindings
            .set('c', this.tools.getTools().get('pencil') as Tool)
            .set('w', this.tools.getTools().get('brush') as Tool)
            .set('e', this.tools.getTools().get('eraser') as Tool)
            .set('1', this.tools.getTools().get('rectangle') as Tool)
            .set('2', this.tools.getTools().get('ellipse') as Tool)
            .set('l', this.tools.getTools().get('line') as Tool);
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.mouseFired = false;
        this.baseCtx.save();
        this.previewCtx.save();
    }

    initResizing(event: MouseEvent): void {
        event.stopPropagation();
        this.mouseFired = true;
        this.resizer.initResizing(event);
    }

    @HostListener('window:mousemove', ['$event'])
    resize(event: MouseEvent): void {
        if (this.resizer.resizing) {
            this.previewCanvas.nativeElement.style.borderBottom = 'dotted #000000 1px';
            this.previewCanvas.nativeElement.style.borderRight = 'dotted #000000 1px';
            this.resizer.resize(event, this.previewCanvas.nativeElement);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    stopResize(event: MouseEvent): void {
        if (this.resizer.resizing) {
            this.resizer.stopResize(event, this.baseCanvas.nativeElement);
            this.previewCanvas.nativeElement.style.borderBottom = '2px solid #000000';
            this.previewCanvas.nativeElement.style.borderRight = '2px solid #000000';
        }
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const t = event.target as HTMLElement;
        if (t.className === 'resizer right' || t.className === 'resizer bottom-right' || t.className === 'resizer bottom') {
            return;
        }
        this.tools.currentTool.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.tools.currentTool.onMouseDown(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        const t = event.target as HTMLElement;
        if (t.className === 'resizer right' || t.className === 'resizer bottom-right' || t.className === 'resizer bottom') {
            return;
        }
        this.tools.currentTool.onMouseEnter(event);
    }

    @HostListener('dblclick', ['$event'])
    onDblClick(event: MouseEvent): void {
        this.tools.currentTool.onDblClick(event);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (this.mouseFired) {
            this.mouseFired = false;
            return;
        }
        this.tools.currentTool.onClick(event);
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.mouseFired && !this.resizer.isMaximazed) {
            // apres un mousedown sur resizer ignore le mouseup puis le mouseclick
            return;
        } else if (this.resizer.isMaximazed) {
            this.mouseFired = false;
        }
        this.tools.currentTool.onMouseUp(event);
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        const t = event.target as HTMLElement;
        if (t.className === 'resizer right' || t.className === 'resizer bottom-right' || t.className === 'resizer bottom') {
            return;
        }
        this.tools.currentTool.onMouseOut(event);
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.tools.currentTool.onKeyUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        console.log(event.shiftKey, ';', event.key);
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            event.stopPropagation();
            this.drawingService.newDrawing();
            this.drawingService.resizeCanvas();
        } else if (event.ctrlKey && event.shiftKey && (event.key === 'z' || event.key === 'Z')) {
            console.log('yep', event.key);
            event.preventDefault();
            this.invoker.redoPrev();
        } else if (event.ctrlKey && event.key === 'z') {
            console.log('yep');
            event.preventDefault();
            this.invoker.undoLast();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'o') {
            return;
        } else if (this.keyBindings.has(event.key)) {
            this.drawingService.restoreCanvasState();
            this.tools.currentTool = this.keyBindings.get(event.key) as Tool;
        } else this.tools.currentTool.onKeyDown(event);
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }
}
