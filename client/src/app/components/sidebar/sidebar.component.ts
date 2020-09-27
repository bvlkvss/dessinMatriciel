import { Component /*, ElementRef*/ } from '@angular/core';
import {UserGuideComponent} from '@app/components/user-guide/user-guide.component';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private tools: ToolsManagerService /*, private elRef: ElementRef*/) { }

    paletteIsActive : boolean = false;

    displayPalette(): void {

        console.log(document.querySelectorAll("app-color-picker"));
       
        this.paletteIsActive = !this.paletteIsActive;
        if(this.paletteIsActive){
            this.togglecanvas("canvas-open")
            this.togglecolorpicker( "colorpicker-open")
        } else {
            this.togglecanvas("canvas-close")
            this.togglecolorpicker( "colorpicker-close")
        }
    }

    togglecolorpicker(classname:string):void{

        document.querySelectorAll("#colorpicker-container").forEach(item=>{
            item.setAttribute("class", classname);
        });

    }

    
    togglecanvas(classname:string):void{

        //document.getElementById("canvas-container")?.setAttribute("class" , "canvas-open");

        document.querySelectorAll("#canvas-container canvas").forEach(item=>{
            item.setAttribute("class", classname);
        })
    }

    changeTools(id: number): void {
        this.tools.setTools(id);
    }

    openUserGuide(): void {
        UserGuideComponent.displayUserGuide();
    }
}
