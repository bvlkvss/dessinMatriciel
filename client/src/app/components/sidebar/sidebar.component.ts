import { Component, ElementRef } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private tools: ToolsManagerService, private elRef: ElementRef) { }

    isopen : boolean = false;

    displayPalette(): void {
        if (this.elRef.nativeElement.parentElement.children[1].style.display === 'inline-block') {
            this.elRef.nativeElement.parentElement.children[1].style.display = 'none';
        } else {
            this.elRef.nativeElement.parentElement.children[1].style.display = 'inline-block';
        }
        this.isopen = !this.isopen;
        console.log(document.getElementsByTagName("canvas"));
        
        if(this.isopen){
            this.togglecanvas("canvas-open", "canvas-close")
        } else {
            this.togglecanvas("canvas-close", "canvas-open")
        }

    }

    togglecanvas(classname:string , oldclassname:string):void{
        document.querySelectorAll("#canvas-container canvas").forEach(item=>{
            item.classList.remove ( oldclassname);
            item.setAttribute("class", classname);
        })
    }

    changeTools(id: number): void {
        this.tools.setTools(id);
    }
}
