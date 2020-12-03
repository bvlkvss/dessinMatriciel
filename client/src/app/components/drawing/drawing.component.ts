import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ExportComponent } from '@app/components/export/export.component';
import { SavingComponent } from '../saving/saving.component';
import { MatDialog } from '@angular/material/dialog';
// import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';

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
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    private keyBindings: Map<string, Tool> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private mouseFired: boolean;
    //private altkey: boolean = false;

    constructor(
        private drawingService: DrawingService,
        private tools: ToolsManagerService,
        private resizer: ResizingService,
        private invoker: UndoRedoService,
        private dialog: MatDialog,
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
            .set('t', this.tools.getTools().get('text') as Tool)
            .set('a', this.tools.getTools().get('aerosol') as Tool)
            .set('p', this.tools.getTools().get('plume') as Tool)
            .set('g', this.tools.getTools().get('grid') as Tool)
            .set('v', this.tools.getTools().get('magic-wand') as Tool);

        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.baseCtx.beginPath();
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.rect(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        this.baseCtx.fill();
        this.baseCtx.closePath();
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.gridCanvas = this.gridCanvas.nativeElement;
        this.drawingService.canvasContainer = this.resizeContainer.nativeElement as HTMLDivElement;
        this.mouseFired = false;
        this.drawingService.blankCanvasDataUrl = this.drawingService.canvas.toDataURL();
        this.baseCtx.save();
        this.previewCtx.save();
        this.gridCtx.save();
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
            if (this.tools.currentTool instanceof GridService && this.tools.currentTool.isGridActive) this.tools.currentTool.displayGrid();
            this.previewCanvas.nativeElement.style.borderBottom = '2px solid #000000';
            this.previewCanvas.nativeElement.style.borderRight = '2px solid #000000';
        }
    }
    @HostListener('window : mousewheel', ['$event'])
    updateDegree(event: WheelEvent): void {
        if (this.tools.getTools().get('selection') === this.tools.currentTool) {
            const tool = this.tools.currentTool as SelectionService;
            tool.updateDegree(event);
            tool.redrawSelection(true);
        } else if (this.tools.getTools().get('magic-wand') === this.tools.currentTool) {
            const tool = this.tools.currentTool as MagicWandService;
            if (tool.magicSelectionObj.isActive) {
                tool.magicSelectionObj.updateDegree(event);
                tool.magicSelectionObj.redrawSelection();
            }
        } else if (this.tools.getTools().get('plume') === this.tools.currentTool) {
            const tool = this.tools.currentTool as PlumeService;
            tool.adjustAngle(event);
        } else if (this.tools.getTools().get('stamp') === this.tools.currentTool) {
            const tool = this.tools.currentTool as StampService;
            const position = tool.getPositionFromMouse(event);
            tool.updateDegree(event);
            tool.rotateStamp(this.drawingService.previewCtx, position);
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
        //     this.altkey = event.altKey;
        this.tools.currentTool.onKeyUp(event);
        if(this.dialog.openDialogs.length == 0){
            this.drawingService.sendMessage(this.tools.getByValue(this.tools.currentTool));
        }
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        const element = event.target as HTMLElement;
        if (element.className === 'textInput') return;

        //    this.altkey = event.altKey;
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            event.stopPropagation();
            this.drawingService.newDrawing();
            this.drawingService.resizeCanvas();
        } else if (event.ctrlKey || (event.ctrlKey && event.shiftKey && (event.key === 'z' || event.key === 'Z'))) {
            this.invoker.onKeyDown(event);
        } else if (event.ctrlKey && event.key === 'a') {
            this.tools.currentTool = this.keyBindings.get('r') as Tool;
            this.tools.currentTool.onKeyDown(event);
        }
        this.onKeyDown(event);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!(this.tools.currentTool instanceof TextService)) {
            if (event.ctrlKey && event.key === 'o') {
                return;
            } else if (this.keyBindings.has(event.key)) {
                this.drawingService.restoreCanvasState();
                this.tools.currentTool = this.keyBindings.get(event.key) as Tool;
                switch (event.key) {
                    case 'r': {
                        (this.tools.currentTool as SelectionService).selectionStyle = 0;
                        (this.tools.currentTool as SelectionService).resetSelection();
                        break;
                    }
                    case 's': {
                        (this.tools.currentTool as SelectionService).selectionStyle = 1;
                        (this.tools.currentTool as SelectionService).resetSelection();
                        break;
                    }
                    case 'g': {
                        this.tools.currentTool.onKeyDown(event);
                        break;
                    }
                }
            } else this.tools.currentTool.onKeyDown(event);
        } else this.tools.currentTool.onKeyDown(event);
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }
}
