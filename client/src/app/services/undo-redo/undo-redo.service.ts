import { Injectable } from '@angular/core';
import { Command } from '@app/classes/command';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    private undoStack: Command[];
    private redoStack: Command[];
    private isAllowed: boolean;

    constructor(protected drawingService: DrawingService) {
        this.undoStack = [];
        this.redoStack = [];
    }
    onKeyDown(event: KeyboardEvent): void {
        if (this.isAllowed) {
            if (event.ctrlKey && event.shiftKey && (event.key === 'z' || event.key === 'Z')) {
                this.redoPrev();
            } else if (event.ctrlKey && event.key === 'z') {
                this.undoLast();
            }
        }
    }
    addToUndo(cmd: Command): void {
        if (cmd) {
            this.undoStack.push(cmd);
        }
    }
    addToRedo(cmd: Command): void {
        if (cmd) {
            this.redoStack.push(cmd);
        }
    }
    getRedo(): Command[] {
        return this.redoStack;
    }
    getUndo(): Command[] {
        return this.undoStack;
    }
    setIsAllowed(bool: boolean): void {
        this.isAllowed = bool;
    }

    getIsAllowed(): boolean {
        return this.isAllowed;
    }

    undoLast(): void {
        if (this.isAllowed) {
            const lastUndo = this.undoStack.pop();
            if (lastUndo) {
                if (lastUndo.isResize) {
                    lastUndo.unexecute();
                }
                this.redoStack.push(lastUndo);
                this.drawingService.clearCanvas(this.drawingService.baseCtx);
                this.makeCanvasWhite(this.drawingService.baseCtx);
                this.executeAll();
            }
        }
    }
    redoPrev(): void {
        if (this.isAllowed) {
            const firstRedo = this.redoStack.pop();
            if (firstRedo) {
                this.undoStack.push(firstRedo);
                this.drawingService.clearCanvas(this.drawingService.baseCtx);
                this.makeCanvasWhite(this.drawingService.baseCtx);
                this.executeAll();
            }
        }
    }

    ClearRedo(): void {
        this.redoStack = [];
    }
    ClearUndo(): void {
        this.undoStack = [];
    }

    executeAll(): void {
        for (const cmd of this.undoStack) {
            cmd.execute();
        }
    }

    makeCanvasWhite(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.fillStyle = 'white';
        context.rect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        context.fill();
        context.closePath();
    }
}
