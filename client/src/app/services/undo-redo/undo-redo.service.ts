import { Injectable } from '@angular/core';
import { Command } from '@app/classes/command';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];
    private isAllowed: boolean;

    constructor(protected drawingService: DrawingService) { }
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
                this.executeAll();
            }
        }
    }

    ClearRedo(): void {
        this.redoStack = [];
    }

    executeAll(): void {
        for (const cmd of this.undoStack) {
            cmd.execute();
        }
    }
}
