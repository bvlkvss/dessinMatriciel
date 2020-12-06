import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

const SQUARE_SIZE_DIFFERENCE = 5;
const MAX_SQUARE_SIZE = 100;
const MIN_SQUARE_SIZE = 5;
const STARTING_SQUARE_SIZE = 25;
const STARTING_OPACITY = 50;
@Injectable({
    providedIn: 'root',
})
export class GridService extends Tool {
    static squareSize: number = STARTING_SQUARE_SIZE;
    static isGridActive: boolean = false;
    sizeObservable: Subject<string>;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.toolAttributes = ['opacity', 'squareSize'];
        this.opacity = STARTING_OPACITY;
        this.sizeObservable = new Subject<string>();
    }

    getSizeObservable(): Observable<string> {
        return this.sizeObservable;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'g') {
            GridService.isGridActive ? this.clearGrid() : this.displayGrid();
        }
        if (event.key === '+') {
            this.changeSquareSize(GridService.squareSize + SQUARE_SIZE_DIFFERENCE);
        } else if (event.key === '-') {
            this.changeSquareSize(GridService.squareSize - SQUARE_SIZE_DIFFERENCE);
        }
    }
    changeOpacity(opacity: number): void {
        if (opacity >= MIN_SQUARE_SIZE && opacity <= MAX_SQUARE_SIZE) {
            this.opacity = opacity;
            this.drawingService.clearCanvas(this.drawingService.gridCtx);
            this.displayGrid();
        }
    }
    changeSquareSize(size: number): void {
        if (size >= MIN_SQUARE_SIZE && size <= MAX_SQUARE_SIZE) {
            this.sizeObservable.next(size.toString());
            GridService.squareSize = size;
            this.drawingService.clearCanvas(this.drawingService.gridCtx);
            this.displayGrid();
        }
    }

    clearGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        GridService.isGridActive = false;
    }

    displayGrid(): void {
        const ctx = this.drawingService.gridCtx;
        const width = this.drawingService.gridCanvas.width;
        const height = this.drawingService.gridCanvas.height;
        const opacity = this.opacity / MAX_SQUARE_SIZE;
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = opacity;
        for (let i = 0; i < width; i += GridService.squareSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        for (let i = 0; i < height; i += GridService.squareSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        GridService.isGridActive = true;
    }
}
