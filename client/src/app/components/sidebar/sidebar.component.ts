import { Component, ElementRef } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private tools: ToolsManagerService, private elRef: ElementRef) {}

    displayPalette(): void {
        console.log(this.elRef.nativeElement.parentElement.children[1]);
        if (this.elRef.nativeElement.parentElement.children[1].style.display === 'block') {
            this.elRef.nativeElement.parentElement.children[1].style.display = 'none';
        } else {
            this.elRef.nativeElement.parentElement.children[1].style.display = 'block';
        }
    }
    changeTools(id: number): void {
        this.tools.setTools(id);
        // id.setFocus();
    }
}
