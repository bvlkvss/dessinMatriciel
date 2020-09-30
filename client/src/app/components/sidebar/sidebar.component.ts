import { Component /*, ElementRef*/ } from '@angular/core';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private tools: ToolsManagerService ,protected drawingService: DrawingService/*, private elRef: ElementRef*/) {}

    attributeBarIsActive: boolean = false;

    displayPalette(toolName: string): void {
        if (!this.attributeBarIsActive) {
            console.log(this.tools.currentTool);
            this.attributeBarIsActive = true;
            this.togglecanvas('drawing-container-open');
            this.toggleAttributeBar('attribute-open');
        } else {
            if ((this.tools.getTools().get(toolName) === this.tools.currentTool)) {
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

    togglecanvas(classname: string): void {
        document.getElementById('drawing-div')?.setAttribute('class', classname);
    }

    changeTools(name: string): void {
        this.tools.setTools(name);
    }

    openUserGuide(): void {
        UserGuideComponent.displayUserGuide();
    }

    newDrawing(): void{
        this.drawingService.newDrawing();
    }
}
