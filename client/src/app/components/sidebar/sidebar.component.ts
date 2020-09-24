import { Component } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})


export class SidebarComponent {

    constructor(private tools: ToolsManagerService){}
  
    
    changeTools(id : number){
        this.tools.setTools(id);
        //id.setFocus();
        
    }

      
}

