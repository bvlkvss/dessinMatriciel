import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
import { Command } from './command';

export class ResizeCommand implements Command {
    private oldWidth: number;
    private oldHeight: number;
    private newWidth: number;
    private newHeight: number;
    private oldCanvas: HTMLCanvasElement;
    isResize: boolean;
    preview: HTMLCanvasElement;
    grid: HTMLCanvasElement;
    canvasContainer: HTMLDivElement;

    constructor(oldW: number, oldH: number, protected tool: ResizingService, protected drawingService: DrawingService) {
        this.isResize = true;
        this.oldWidth = oldW;
        this.oldHeight = oldH;
        this.canvasContainer = document.querySelector('#canvas-container') as HTMLDivElement;
    }

    setnewSize(newW: number, newH: number): void {
        this.newWidth = newW;
        this.newHeight = newH;
    }

    setPreview(preview: HTMLCanvasElement): void {
        this.preview = preview;
    }

    setGrid(grid: HTMLCanvasElement): void {
        this.grid = grid;
    }

    getnewSize(): Vec2 {
        return { x: this.newWidth, y: this.newHeight } as Vec2;
    }

    getoldSize(): Vec2 {
        return { x: this.oldWidth, y: this.oldHeight } as Vec2;
    }

    getOldCanvas(): HTMLCanvasElement {
        return this.oldCanvas;
    }

    saveOldCanvas(canvas: HTMLCanvasElement): void {
        this.oldCanvas = canvas;
    }

    execute(): void {
        const tmp = this.tool.saveCanvas();
        this.drawingService.canvas.height = this.preview.height = this.grid.height = this.newHeight;
        this.drawingService.canvas.width = this.preview.width = this.grid.width = this.newWidth;
        this.canvasContainer.style.width = this.newWidth + 'px';
        this.canvasContainer.style.height = this.newHeight + 'px';
        this.tool.drawCanvas(tmp);
    }
    // for resize unexecute is nessecary
    unexecute(): void {
        this.drawingService.canvas.height = this.preview.height = this.grid.height = this.oldHeight;
        this.drawingService.canvas.width = this.preview.width = this.grid.width = this.oldWidth;
        this.canvasContainer.style.width = this.oldWidth + 'px';
        this.canvasContainer.style.height = this.oldHeight + 'px';
        this.tool.drawCanvas(this.oldCanvas);
    }
}
