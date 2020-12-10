import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MagicWandSelection } from '@app/services/tools/magic-wand/magic-wand-selection';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionClipboardService {
    private currentClipboardData: HTMLCanvasElement;
    private isCuted: boolean;
    constructor() {
        this.isCuted = false;
    }

    onKeyDown(event: KeyboardEvent, selectionTool: SelectionService | MagicWandService): void {
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

    private copy(selectionTool: SelectionService | MagicWandService): void {
        let tool = selectionTool as SelectionService | MagicWandSelection;
        if (selectionTool instanceof MagicWandService) tool = selectionTool.magicSelectionObj;
        if (tool.selectionData) {
            this.currentClipboardData = document.createElement('canvas') as HTMLCanvasElement;
            const ctx = this.currentClipboardData.getContext('2d') as CanvasRenderingContext2D;
            this.currentClipboardData.width = tool.width;
            this.currentClipboardData.height = tool.height;
            ctx.drawImage(tool.selectionData, 0, 0, tool.width, tool.height);
        }
        this.isCuted = false;
    }

    private paste(selectionTool: SelectionService | MagicWandService): void {
        let tool = selectionTool as SelectionService | MagicWandSelection;
        if (selectionTool instanceof MagicWandService) {
            tool = selectionTool.magicSelectionObj;
            selectionTool.isMagicSelectionActivated = true;
        }
        if (!this.isCuted) {
            tool.drawSelectionOnBase();
        }
        tool.resetSelection();
        tool.degres = 0;
        tool.selectionStartPoint = { x: 0, y: 0 } as Vec2;
        tool.selectionEndPoint = { x: this.currentClipboardData.width, y: this.currentClipboardData.height };
        const tmp = this.currentClipboardData;
        tool.selectionData = tmp;
        tool.firstSelectionMove = true;
        tool.redrawSelection();
        tool.selectionActivated = true;
    }

    private cut(selectionTool: SelectionService | MagicWandService): void {
        this.copy(selectionTool);
        this.delete(selectionTool);
        this.isCuted = true;
    }

    private delete(selectionTool: SelectionService | MagicWandService): void {
        let tool = selectionTool as SelectionService | MagicWandSelection;
        if (selectionTool instanceof MagicWandService) {
            selectionTool.isMagicSelectionActivated = false;
            tool = selectionTool.magicSelectionObj;
            tool.eraseSelectionOnDelete();
        } else {
            tool.eraseSelectionFromBase(tool.selectionEndPoint);
        }
        tool.resetSelection();
        tool.clearPreview();
    }
}
