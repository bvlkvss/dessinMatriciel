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
        let tool = selectionTool;
        if (selectionTool.magicSelectionObj) tool = selectionTool.magicSelectionObj;
        if (tool.selectionData) {
            this.currentClipboardData = document.createElement('canvas');
            const ctx = this.currentClipboardData.getContext('2d') as CanvasRenderingContext2D;
            this.currentClipboardData.width = tool.width;
            this.currentClipboardData.height = tool.height;
            ctx.drawImage(tool.selectionData, 0, 0, tool.width, tool.height);
            console.log(this.currentClipboardData, tool.selectionData, 'called');
        }
    }

    private paste(selectionTool: SelectionService | MagicWandSelection): void {
        let tool = selectionTool;
        if (selectionTool.magicSelectionObj) tool = selectionTool.magicSelectionObj;
        if (!this.isCuted) tool.drawSelectionOnBase();
        tool.resetSelection();
        tool.selectionStartPoint = { x: 0, y: 0 } as Vec2;
        tool.selectionEndPoint = { x: this.currentClipboardData.width, y: this.currentClipboardData.height };
        const tmp = this.currentClipboardData;
        tool.selectionData = tmp;
        tool.redrawSelection();
        tool.selectionActivated = true;
    }

    private cut(selectionTool: SelectionService | MagicWandSelection): void {
        this.copy(selectionTool);
        this.delete(selectionTool);
        this.isCuted = true;
    }

    private delete(selectionTool: SelectionService | MagicWandSelection): void {
        let tool = selectionTool;
        if (selectionTool.magicSelectionObj) tool = selectionTool.magicSelectionObj;
        tool.drawSelectionOnBase();
        tool.eraseSelectionFromBase(selectionTool.selectionEndPoint);
        tool.resetSelection();
    }
}
