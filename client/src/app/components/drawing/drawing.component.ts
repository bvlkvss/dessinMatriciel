import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { ResizingService } from '../../services/resizing/resizing.service';

// TODO : Avoir un fichier séparé pour les constantes ?


@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('container') container: ElementRef<HTMLDivElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    private keyBindings: Map<string, Tool> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private mouseFired: boolean;
    private resized: boolean;

    // TODO : Avoir un service dédié pour gérer tous les outils ? Ceci peut devenir lourd avec le temps
    constructor(private drawingService: DrawingService, private tools: ToolsManagerService, private resizer: ResizingService) { }

    ngOnInit(): void{
        this.drawingService.resizeCanvas();
    }
    ngAfterViewInit(): void {
        this.keyBindings.set('c', this.tools.getTools().get("pencil") as Tool)
            .set('w', this.tools.getTools().get("brush") as Tool)
            .set('e', this.tools.getTools().get("eraser") as Tool)
            .set('2', this.tools.getTools().get("ellipse") as Tool)
            .set('l', this.tools.getTools().get("line") as Tool);
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
    }



    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const diff = 1;
        const shiftX = this.container.nativeElement.getBoundingClientRect().x - diff;
        const shiftY = this.container.nativeElement.getBoundingClientRect().y - diff;
        if (event.pageX > this.baseCanvas.nativeElement.clientWidth + shiftX || event.pageY > this.baseCanvas.nativeElement.clientHeight + shiftY) {
            return;
        }
        this.tools.currentTool.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        event.preventDefault ? event.preventDefault() : (event.returnValue = false);
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
        if (this.mouseFired && !this.resizer.IsextendingCanvas()) {
            this.mouseFired = false;
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

    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {

        if (event.ctrlKey && event.key == "o") {
        event.preventDefault();
        event.stopPropagation();
        this.drawingService.newDrawing();
        this.drawingService.resizeCanvas();
    }


    }
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.drawingService.baseCtx.restore();
        this.drawingService.previewCtx.restore();
        if (event.ctrlKey && event.key == "o") {
            return;         
        }
        else if (this.keyBindings.has(event.key)){
            this.drawingService.restoreCanvasState();
            this.tools.currentTool = this.keyBindings.get(event.key) as Tool;
        }
        else
            this.tools.currentTool.onKeyDown(event);
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }
}
