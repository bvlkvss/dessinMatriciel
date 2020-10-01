import { Component} from '@angular/core';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private tools: ToolsManagerService, protected drawingService: DrawingService) { }

    attributeBarIsActive: boolean = false;
    displayPalette(toolName: string): void {
        if (!this.attributeBarIsActive) {
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
        console.log(document.querySelectorAll('app-color-picker'));
    }

    toggleColorPalette(colorpickerId: string): void {
        if (colorpickerId === "primaryColorPicker") {
            if (document.querySelector("#primaryColorPicker")?.getAttribute("style") === "display:block")
                document.querySelector("#primaryColorPicker")?.setAttribute("style", "display:none");
            else {
                document.querySelector("#primaryColorPicker")?.setAttribute("style", "display:block");
                document.querySelector("#secondaryColorPicker")?.setAttribute("style", "display:none");
            }
        }
        else {
            if (document.querySelector("#secondaryColorPicker")?.getAttribute("style") === "display:block")
                document.querySelector("#secondaryColorPicker")?.setAttribute("style", "display:none");
            else {
                document.querySelector("#secondaryColorPicker")?.setAttribute("style", "display:block");
                document.querySelector("#primaryColorPicker")?.setAttribute("style", "display:none");
            }
        }
    }

    togglecanvas(classname: string): void {
        document.getElementById('drawing-div')?.setAttribute('class', classname);
    }

    changeTools(name: string): void {
        this.drawingService.restoreCanvasState();
        this.tools.setTools(name);
        var nb = document.getElementsByTagName("a").length;
        for (var i = 0; i < nb; i++) {
            document.getElementsByTagName("a")[i].classList.remove("active");
        }
        document.getElementById(name)?.setAttribute('class', "active");
    }
    revertColors(): void {
        let primColorDiv = document.querySelector(".color-box1") as HTMLElement;
        let secondColorDiv = document.querySelector(".color-box2") as HTMLElement;
        let tmp: string = this.tools.currentTool.primaryColor;
        this.tools.currentTool.primaryColor = this.tools.currentTool.secondaryColor;
        this.tools.currentTool.secondaryColor = tmp;
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
        if (window.confirm("Warning, your current sketch will be deleted.\n Do you want to proceed to the main menu?")) {
            location.replace("main-page.component.html");
        };
    }
}
