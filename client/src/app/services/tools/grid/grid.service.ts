import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GridService extends Tool {
    squareSize: number;
    isGridActive: boolean;
    sizeObservable: Subject<string>;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.toolAttributes = ['opacity', 'squareSize'];
        this.squareSize = 25;
        this.opacity = 50;
        this.isGridActive = false;
        this.sizeObservable = new Subject<string>();
    }

    getSizeObservable():Observable<string>{
      return this.sizeObservable;
    }
    
    onKeyDown(event: KeyboardEvent) {
        if(event.key === 'g'){
          this.isGridActive ? this.clearGrid() : this.displayGrid() ;
        }
        if (event.key === '+') {
            this.changeSquareSize(this.squareSize + 5);
        } else if (event.key === '-') {
            this.changeSquareSize(this.squareSize - 5);
        }
    }
    changeOpacity(opacity: number) {
        if (opacity >= 5 && opacity <= 100){
           this.opacity = opacity;
           this.drawingService.clearCanvas(this.drawingService.gridCtx);
            this.displayGrid();
        }
    }
    changeSquareSize(size: number) {
        if (size >=5 && size<=100){
          this.sizeObservable.next(size.toString());
           this.squareSize = size;
           this.drawingService.clearCanvas(this.drawingService.gridCtx);
            this.displayGrid();
          }
    }

    clearGrid() {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        this.isGridActive = false;
    }

    displayGrid() {
        const ctx = this.drawingService.gridCtx;
        const width = this.drawingService.gridCanvas.width;
        const height = this.drawingService.gridCanvas.height;
        const opacity = this.opacity / 100;
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = opacity;
        for (let i = 0; i < width; i += this.squareSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        for (let i = 0; i < height; i += this.squareSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        this.isGridActive = true;
    }
}
