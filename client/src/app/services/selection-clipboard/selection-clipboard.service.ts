import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MagicWandSelection } from '@app/services/tools/magic-wand/magic-wand-selection';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionClipboardService {
    private currentClipboardData: HTMLCanvasElement;
    // private serviceAllowed: boolean;
    private isCuted: boolean;
    constructor() {
        // this.serviceAllowed = false;
        this.isCuted = false;
    }

    onKeyDown(event: KeyboardEvent, selectionTool: SelectionService | MagicWandSelection): void {
        switch (event.key) {
            case 'c':
                this.copy(selectionTool);
                break;
            case 'x':
                this.cut(selectionTool);
                break;
            case 'v':
                this.paste(selectionTool);
                break;
            case 'Delete':
                this.delete(selectionTool);
                break;
        }
    }

    private copy(selectionTool: SelectionService | MagicWandSelection): void {
        if (selectionTool.selectionData) {
            this.currentClipboardData = document.createElement('canvas');
            const ctx = this.currentClipboardData.getContext('2d') as CanvasRenderingContext2D;
            this.currentClipboardData.width = selectionTool.width;
            this.currentClipboardData.height = selectionTool.height;
            ctx.drawImage(selectionTool.selectionData, 0, 0, selectionTool.width, selectionTool.height);
            console.log(this.currentClipboardData, selectionTool.selectionData);
        }
        this.isCuted = false;
    }

    private paste(selectionTool: SelectionService | MagicWandSelection): void {
        if (!this.isCuted) selectionTool.drawSelectionOnBase();
        selectionTool.resetSelection();
        selectionTool.selectionStartPoint = { x: 0, y: 0 } as Vec2;
        selectionTool.selectionEndPoint = { x: this.currentClipboardData.width, y: this.currentClipboardData.height };
        const tmp = this.currentClipboardData;
        selectionTool.selectionData = tmp;
        selectionTool.redrawSelection();
        selectionTool.selectionActivated = true;
    }

    private cut(selectionTool: SelectionService | MagicWandSelection): void {
        this.copy(selectionTool);
        this.delete(selectionTool);
        this.isCuted = true;
    }

    private delete(selectionTool: SelectionService | MagicWandSelection): void {
        selectionTool.drawSelectionOnBase();
        selectionTool.eraseSelectionFromBase(selectionTool.selectionEndPoint);
        selectionTool.resetSelection();
    }
}
