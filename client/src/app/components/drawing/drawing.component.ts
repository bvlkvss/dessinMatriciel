import { AfterViewInit, Component, DoCheck, ElementRef, HostListener, IterableDiffer, IterableDiffers, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Command } from '@app/classes/command';
import { Const } from '@app/classes/constants';
import { Movable } from '@app/classes/movable';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
import { SelectionClipboardService } from '@app/services/selection-clipboard/selection-clipboard.service';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnInit, DoCheck {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('container') container: ElementRef<HTMLDivElement>;
    @ViewChild('resizeContainer') resizeContainer: ElementRef<HTMLDivElement>;

    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;
    private keyBindings: Map<string, string> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private mouseFired: boolean;
    private iterableDiffer: IterableDiffer<Command>;
    constructor(
        private drawingService: DrawingService,
        private tools: ToolsManagerService,
        private resizer: ResizingService,
        private invoker: UndoRedoService,
        private dialog: MatDialog,
        private clipboard: SelectionClipboardService,
        iDiffers: IterableDiffers,
    ) {
        this.iterableDiffer = iDiffers.find([]).create();
    }
    ngDoCheck(): void {
        const changesUndo = this.iterableDiffer.diff(this.invoker.getUndo());
        if (changesUndo) {
            localStorage.setItem('drawing', this.baseCtx.canvas.toDataURL());
        }
    }
    ngOnInit(): void {
        this.drawingService.resizeCanvas();
    }

    ngAfterViewInit(): void {
        this.keyBindings
            .set('c', 'pencil')
            .set('w', 'brush')
            .set('e', 'eraser')
            .set('1', 'rectangle')
            .set('2', 'ellipse')
            .set('l', 'line')
            .set('b', 'paintBucket')
            .set('3', 'polygon')
            .set('r', 'selection')
            .set('s', 'selection')
            .set('i', 'pipette')
            .set('t', 'text')
            .set('a', 'aerosol')
            .set('p', 'plume')
            .set('g', 'grid')
            .set('v', 'magic-wand')
            .set('d', 'stamp');
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
        this.drawingService.afterViewObservable.next();
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
            this.resizer.resize(event, this.previewCanvas.nativeElement, this.gridCanvas.nativeElement);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    stopResize(event: MouseEvent): void {
        if (this.resizer.resizing) {
            this.resizer.stopResize(event, this.baseCanvas.nativeElement);
            if (this.tools.currentTool instanceof GridService && GridService.isGridActive) this.tools.currentTool.displayGrid();
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
            if ((event.target as HTMLElement).tagName !== 'CANVAS') {
                event.stopPropagation();
                return;
            }
            const tool = this.tools.currentTool as StampService;
            const position = tool.getPositionFromMouse(event);
            tool.updateDegree(event);
            tool.degres %= Const.FULL_CIRCLE;
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
        this.tools.currentTool.onKeyUp(event);
    }

    @HostListener('window:popstate', ['$event'])
    onPopState(): void {
        if (window.location.pathname === '/home') {
            location.replace('main-page.component.html');
        }
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        const element = event.target as HTMLElement;
        if (element.className === 'textInput' || this.dialog.openDialogs.length) return;

        if (event.ctrlKey) {
            switch (event.key) {
                case 'o':
                    if (this.invoker.getUndo().length !== 0) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.drawingService.newDrawing();
                        this.drawingService.resizeCanvas();
                    }
                    break;
                case 'a':
                    event.preventDefault();
                    event.stopPropagation();
                    this.tools.setTools(this.keyBindings.get('r') as string);
                    this.tools.currentTool.onKeyDown(event);
                    break;

                default:
                    if (event.key === 'z' || event.key === 'Z') {
                        event.preventDefault();
                        event.stopPropagation();
                        this.invoker.onKeyDown(event);
                    } else if (this.tools.currentTool instanceof MagicWandService || this.tools.currentTool instanceof SelectionService) {
                        this.clipboard.onKeyDown(event, this.tools.currentTool);
                    }
                    break;
            }
        }
        this.onKeyDown(event);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!(this.tools.currentTool instanceof TextService && this.tools.currentTool.isWriting))
            if (event.ctrlKey) {
                return;
            } else if (event.key === 'm') {
                Movable.magnetismActivated = !Movable.magnetismActivated;
            } else if (this.keyBindings.has(event.key)) {
                this.drawingService.restoreCanvasState();
                this.tools.setTools(this.keyBindings.get(event.key) as string);
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
                }
                if (this.dialog.openDialogs.length === 0) {
                    this.drawingService.sendMessage(this.tools.getByValue(this.tools.currentTool));
                }
            }
        this.tools.currentTool.onKeyDown(event);
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }
}
