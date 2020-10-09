import { Component, Input, OnChanges } from '@angular/core';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import {ExportComponent} from '@app/components/export/export.component';
import {MatDialog } from '@angular/material/dialog'

const COLOR_STRING_LENGTH = 7;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges {
    constructor(private tools: ToolsManagerService, protected drawingService: DrawingService, private dialog: MatDialog) {}
    @Input() primaryColor: string = this.tools.currentTool.primaryColor.slice(0, COLOR_STRING_LENGTH);
    @Input() secondaryColor: string = this.tools.currentTool.secondaryColor.slice(0, COLOR_STRING_LENGTH);
    isRevertClicked: boolean = false;
    attributeBarIsActive: boolean = false;

    ngOnChanges(): void {
        if (!this.isRevertClicked) {
            const primColorDiv = document.querySelector('.color-box1') as HTMLElement;
            const secondColorDiv = document.querySelector('.color-box2') as HTMLElement;
            primColorDiv.style.backgroundColor = this.primaryColor;
            secondColorDiv.style.backgroundColor = this.secondaryColor;
        }
        this.isRevertClicked = false;
    }

    openExportDialog():void {
        console.log("openExport clicked");
       this.dialog.open(ExportComponent);
    }

    displayPalette(toolName: string): void {
        if (!this.attributeBarIsActive) {
            this.attributeBarIsActive = true;
            this.togglecanvas('drawing-container-open');
            this.toggleAttributeBar('attribute-open');
        } else {
            if (this.tools.getTools().get(toolName) === this.tools.currentTool) {
                this.attributeBarIsActive = false;
                this.togglecanvas('drawing-container');
                this.toggleAttributeBar('attribute-close');
            }
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
        this.tools.setTools(name);
        const numberOfTools = document.getElementsByTagName('a').length;

        for (let i = 0; i < numberOfTools; i++) {
            document.getElementsByTagName('a')[i].classList.remove('active');
        }

        document.getElementById(name)?.setAttribute('class', 'active');
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
        this.drawingService.newDrawing();
    }

    warningMessage(): void {
        if (window.confirm('Warning, your current sketch will be deleted.\n Do you want to proceed to the main menu?')) {
            location.replace('main-page.component.html');
        }
    }
}
