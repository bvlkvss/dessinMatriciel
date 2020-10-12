import { Injectable } from '@angular/core';
import { Command } from '@app/classes/command';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    addToUndo(cmd: Command): void {
        if (cmd) {
            console.log(this.undoStack);
            this.undoStack.push(cmd);
        }
    }

    addToRedo(cmd: Command): void {
        if (cmd) {
            this.redoStack.push(cmd);
        }
    }

    undoLast(): void {
        const lastUndo = this.undoStack.pop();
        console.log(this.undoStack);
        if (lastUndo) {
            if (lastUndo.isResize) {
                lastUndo.unexecute();
            }
            this.redoStack.push(lastUndo);
            this.executeAll();
        }
    }

    ClearRedo(): void {
        while (this.redoStack.pop());
    }

    executeAll(): void {
        for (const cmd of this.undoStack) {
            cmd.execute();
        }
    }
}
