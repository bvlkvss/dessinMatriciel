import { Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Const } from '@app/classes/constants';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { ExportComponent } from '@app/components/export/export.component';
import { SavingComponent } from '@app/components/saving/saving.component';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionClipboardService } from '@app/services/selection-clipboard/selection-clipboard.service';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges {
    subscription: Subscription;
    currentToolName: string;
    @Input() primaryColor: string = this.tools.currentTool.primaryColor.slice(0, Const.COLOR_STRING_LENGTH);
    @Input() secondaryColor: string = this.tools.currentTool.secondaryColor.slice(0, Const.COLOR_STRING_LENGTH);
    isRevertClicked: boolean;
    attributeBarIsActive: boolean;

    constructor(
        private tools: ToolsManagerService,
        protected drawingService: DrawingService,
        protected invoker: UndoRedoService,
        private dialog: MatDialog,
        private clipboard: SelectionClipboardService,
    ) {
        this.isRevertClicked = false;
        this.attributeBarIsActive = false;
    }

    @ViewChild('icons', { static: false }) toolIcons: ElementRef<HTMLCanvasElement>;
    ngOnChanges(): void {
        this.subscription = this.drawingService.getMessage().subscribe((message: string) => {
            const numberOfTools = this.toolIcons.nativeElement.getElementsByTagName('a').length;
            for (let i = 0; i < numberOfTools; i++) {
                this.toolIcons.nativeElement.getElementsByTagName('a')[i].classList.remove('active');
            }
            this.toolIcons.nativeElement.querySelector('#' + message)?.setAttribute('class', 'active');
            if (message === 'selection' || 'magic-wand') {
                this.togglecanvas('drawing-container-open');
                this.toggleAttributeBar('attribute-open');
            }
        });

        if (!this.isRevertClicked) {
            const primColorDiv = document.querySelector('.color-box1') as HTMLElement;
            const secondColorDiv = document.querySelector('.color-box2') as HTMLElement;
            primColorDiv.style.backgroundColor = this.primaryColor;
            secondColorDiv.style.backgroundColor = this.secondaryColor;
        }
        this.isRevertClicked = false;
    }

    undo(): void {
        this.invoker.undoLast();
    }

    redo(): void {
        this.invoker.redoPrev();
    }

    undoRedoAllowed(): boolean {
        return this.invoker.getIsAllowed();
    }

    clipboardBarAllowed(): boolean {
        return (
            this.tools.getTools().get('selection') === this.tools.currentTool || this.tools.getTools().get('magic-wand') === this.tools.currentTool
        );
    }

    onCopy(): void {
        const event = {
            key: 'c',
        } as KeyboardEvent;
        if (this.tools.getTools().get('selection') === this.tools.currentTool || this.tools.getTools().get('magic-wand') === this.tools.currentTool) {
            this.clipboard.onKeyDown(event, this.tools.currentTool as SelectionService | MagicWandService);
        }
    }

    onPaste(): void {
        const event = {
            key: 'v',
        } as KeyboardEvent;
        if (this.tools.getTools().get('selection') === this.tools.currentTool || this.tools.getTools().get('magic-wand') === this.tools.currentTool) {
            this.clipboard.onKeyDown(event, this.tools.currentTool as SelectionService | MagicWandService);
        }
    }

    onDelete(): void {
        const event = {
            key: 'Delete',
        } as KeyboardEvent;
        if (this.tools.getTools().get('selection') === this.tools.currentTool || this.tools.getTools().get('magic-wand') === this.tools.currentTool) {
            this.clipboard.onKeyDown(event, this.tools.currentTool as SelectionService | MagicWandService);
        }
    }
    onCut(): void {
        const event = {
            key: 'x',
        } as KeyboardEvent;
        if (this.tools.getTools().get('selection') === this.tools.currentTool || this.tools.getTools().get('magic-wand') === this.tools.currentTool) {
            this.clipboard.onKeyDown(event, this.tools.currentTool as SelectionService | MagicWandService);
        }
    }

    openExportDialog(): void {
        if (this.dialog.openDialogs.length === 0) {
            this.dialog.open(ExportComponent);
            ExportComponent.isExportOpen = true;
        }
    }

    openCarousel(): void {
        if (this.dialog.openDialogs.length === 0) {
            this.dialog.open(CarrouselComponent, {
                maxWidth: 'none',
                height: '460px',
                width: 'auto',
                minWidth: '615px',
            });
        }
    }

    openSavingDialog(): void {
        if (this.dialog.openDialogs.length === 0) {
            this.dialog.open(SavingComponent);
            SavingComponent.isSavingOpen = true;
        }
    }

    displayPalette(toolName: string): void {
        if (!this.attributeBarIsActive) {
            this.attributeBarIsActive = true;
            this.togglecanvas('drawing-container-open');
            this.toggleAttributeBar('attribute-open');
        } else if (this.tools.getTools().get(toolName) === this.tools.currentTool) {
            this.attributeBarIsActive = false;
            this.togglecanvas('drawing-container');
            this.toggleAttributeBar('attribute-close');
        }
    }

    toggleAttributeBar(classname: string): void {
        document.querySelectorAll('#attribute').forEach((item) => {
            item.setAttribute('class', classname);
        });
    }

    toggleColorPalette(colorpickerId: string): void {
        if (colorpickerId === 'primaryColorPicker') {
            if (document.querySelector('#primaryColorPicker')?.getAttribute('style') === 'display:block')
                document.querySelector('#primaryColorPicker')?.setAttribute('style', 'display:none');
            else {
                document.querySelector('#primaryColorPicker')?.setAttribute('style', 'display:block');
                document.querySelector('#secondaryColorPicker')?.setAttribute('style', 'display:none');
            }
        } else {
            if (document.querySelector('#secondaryColorPicker')?.getAttribute('style') === 'display:block')
                document.querySelector('#secondaryColorPicker')?.setAttribute('style', 'display:none');
            else {
                document.querySelector('#secondaryColorPicker')?.setAttribute('style', 'display:block');
                document.querySelector('#primaryColorPicker')?.setAttribute('style', 'display:none');
            }
        }
    }

    togglecanvas(classname: string): void {
        document.getElementById('drawing-div')?.setAttribute('class', classname);
    }

    changeTools(name: string): void {
        this.drawingService.restoreCanvasState();
        if (this.tools.currentTool instanceof TextService && name !== 'text') (this.tools.currentTool as TextService).drawConfirmedText(true);
        else if (this.tools.currentTool instanceof StampService && name !== 'stamp') this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.tools.setTools(name);
        if (this.tools.currentTool instanceof GridService) {
            this.tools.currentTool.onKeyDown({ key: 'g' } as KeyboardEvent);
        }
        const numberOfTools = this.toolIcons.nativeElement.getElementsByTagName('a').length;
        for (let i = 0; i < numberOfTools; i++) {
            this.toolIcons.nativeElement.getElementsByTagName('a')[i].classList.remove('active');
        }
        this.toolIcons.nativeElement.querySelector('#' + name)?.setAttribute('class', 'active');
    }

    revertColors(): void {
        this.isRevertClicked = true;
        const primColorDiv = document.querySelector('.color-box1') as HTMLElement;
        const secondColorDiv = document.querySelector('.color-box2') as HTMLElement;
        const tmpPrimaryColor: string = this.tools.currentTool.primaryColor;
        const tmpSecondaryColor: string = this.tools.currentTool.secondaryColor;
        this.tools.currentTool.primaryColor = tmpSecondaryColor;
        this.tools.currentTool.secondaryColor = tmpPrimaryColor;
        primColorDiv.style.backgroundColor = this.tools.currentTool.primaryColor;
        secondColorDiv.style.backgroundColor = this.tools.currentTool.secondaryColor;
    }

    openUserGuide(): void {
        UserGuideComponent.displayUserGuide();
    }

    newDrawing(): void {
        if (this.invoker.getUndo().length !== 0) {
            this.drawingService.newDrawing();
        }
    }

    selectAll(): void {
        (this.tools.currentTool as SelectionService).selectionStyle = 0;
        (this.tools.currentTool as SelectionService).selectAllCanvas();
    }

    warningMessage(): void {
        if (window.confirm('Voulez-vous vraiment continuer vers le menu?')) {
            location.replace('main-page.component.html');
        }
    }
    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            this.openExportDialog();
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.openSavingDialog();
        } else if (event.ctrlKey && event.key === 'g') {
            event.preventDefault();
            this.openCarousel();
        }
    }

    getInvoker(): UndoRedoService {
        return this.invoker;
    }
}
