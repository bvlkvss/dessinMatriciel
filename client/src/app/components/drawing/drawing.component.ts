import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
import { SelectionClipboardService } from '@app/services/selection-clipboard/selection-clipboard.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

// TODO : Avoir un fichier séparé pour les constantes ?

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('container') container: ElementRef<HTMLDivElement>;
    @ViewChild('resizeContainer') resizeContainer: ElementRef<HTMLDivElement>;

    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private keyBindings: Map<string, Tool> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private mouseFired: boolean;
    private altkey: boolean;

    constructor(
        private drawingService: DrawingService,
        private tools: ToolsManagerService,
        private resizer: ResizingService,
        private invoker: UndoRedoService,
        private clipboard: SelectionClipboardService,
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
            .set('l', this.tools.getTools().get('line') as Tool)
            .set('b', this.tools.getTools().get('paintBucket') as Tool)
            .set('3', this.tools.getTools().get('polygon') as Tool)
            .set('r', this.tools.getTools().get('selection') as Tool)
            .set('s', this.tools.getTools().get('selection') as Tool)
            .set('i', this.tools.getTools().get('pipette') as Tool)
            .set('v', this.tools.getTools().get('magic-wand') as Tool);

        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.baseCtx.beginPath();
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.rect(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        this.baseCtx.fill();
        this.baseCtx.closePath();
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.canvasContainer = this.resizeContainer.nativeElement as HTMLDivElement;
        this.mouseFired = false;
        this.drawingService.blankCanvasDataUrl = this.drawingService.canvas.toDataURL();

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
    @HostListener('window : mousewheel', ['$event'])
    updateDegree(event: WheelEvent): void {
        console.log(this.tools.currentTool);
        if (this.tools.getTools().get('selection') === this.tools.currentTool) {
            const tool = this.tools.currentTool as SelectionService;
            tool.updateDegree(event, this.altkey);
            tool.redrawSelection(true);
        } else if (this.tools.getTools().get('magic-wand') === this.tools.currentTool) {
            const tool = this.tools.currentTool as MagicWandService;
            if (tool.magicSelectionObj.isActive) {
                tool.magicSelectionObj.updateDegree(event, this.altkey);
                tool.magicSelectionObj.redrawSelection();
            }
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
    @HostListener('contextmenu', ['$event'])
    onRightClick(event: MouseEvent): void {
        event.preventDefault();
        this.tools.currentTool.onRightClick(event);
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
        this.altkey = event.altKey;
        this.tools.currentTool.onKeyUp(event);
    }

    // tslint:disable-next-line:cyclomatic-complexity
    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        this.altkey = event.altKey;
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            event.stopPropagation();
            this.drawingService.newDrawing();
            this.drawingService.resizeCanvas();
        } else if ((event.ctrlKey && (event.key === 'x' || event.key === 'c' || event.key === 'v')) || event.key === 'Delete') {
            if (
                this.tools.getTools().get('selection') === this.tools.currentTool ||
                this.tools.getTools().get('magic-wand') === this.tools.currentTool
            ) {
                this.clipboard.onKeyDown(event, this.tools.currentTool as SelectionService | MagicWandService);
                if (this.tools.currentTool instanceof MagicWandService && (event.key === 'x' || event.key === 'v')) {
                    // (this.tools.getTools().get('selection') as SelectionService).selectionStyle = 0;
                    // this.tools.currentTool = this.tools.getTools().get('selection') as Tool;
                }
            }
        } else if (event.ctrlKey || (event.ctrlKey && event.shiftKey && (event.key === 'z' || event.key === 'Z'))) {
            this.invoker.onKeyDown(event);
        } else if (event.ctrlKey && event.key === 'a') {
            this.tools.currentTool = this.keyBindings.get('r') as Tool;
            this.tools.currentTool.onKeyDown(event);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            return;
        }
        if (event.ctrlKey && event.key === 'o') {
            return;
        } else if (this.keyBindings.has(event.key)) {
            this.drawingService.restoreCanvasState();
            this.tools.currentTool = this.keyBindings.get(event.key) as Tool;
            if (event.key === 'r') {
                (this.tools.currentTool as SelectionService).selectionStyle = 0;
                (this.tools.currentTool as SelectionService).resetSelection();
            } else if (event.key === 's') {
                (this.tools.currentTool as SelectionService).selectionStyle = 1;
                (this.tools.currentTool as SelectionService).resetSelection();
            }
        } else this.tools.currentTool.onKeyDown(event);
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }
}
