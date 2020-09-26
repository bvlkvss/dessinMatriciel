import { Component } from '@angular/core';

@Component({
    selector: 'app-user-guide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.css'],
})
export class UserGuideComponent {
    openTab(tab:string):void {
        console.log("openTAB CLICKED");
        let i, tablinks;
        let tabcontent;
        tabcontent = document.getElementsByClassName("tabcontent");
        console.log(tabcontent);
        for (i = 0; i < tabcontent.length; i++) {
            let tabElement = tabcontent[i] as HTMLElement;
            tabElement.style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        console.log(tablinks);
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        
        let x = document.getElementById(tab) as HTMLElement;
        console.log("X is", x)
        x.style.display = "block";
    }

    static displayUserGuide():void{
        console.log("DISPLAY USER GUIDE");
        let userGuide = document.getElementById("background") as HTMLElement;
        userGuide.style.display = "block";
    }

    closeUserGuide():void{
        console.log("CLOSE USER GUIDE");
        let userGuide = document.getElementById("background") as HTMLElement;
        userGuide.style.display = "none";
    }
}
