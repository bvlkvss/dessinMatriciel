import { Component } from '@angular/core';

@Component({
    selector: 'app-user-guide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.css'],
})
export class UserGuideComponent {
    openTab(id:string):void {
        let j;
        let tabcontent;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (j = 0; j < tabcontent.length; j++) {
            let tabElement = tabcontent[j] as HTMLElement;
            tabElement.style.display = "none";
        }
        let y = document.getElementById(id) as HTMLElement;
        y.style.display = "block";


        // set active elements
        let i;
        let options = document.getElementsByTagName("li")
        for (i = 0; i < options.length; i++) {
            if(options[i].id==="#"+id){
                options[i].setAttribute('class', "active");
            } else{
                options[i].setAttribute('class', "tablinks");
            }
        }
    }

    showTools():void {
        let element = document.getElementById("#tools");
    
        if(element?.className =="dropDown-open"){
            element?.setAttribute('class'," ");
            element?.setAttribute('class',"dropDown");
        }   else{
            element?.setAttribute('class'," ");
            element?.setAttribute('class',"dropDown-open");
        }
    }

    showOther(tab:string):void {
        let element = document.getElementById("#other");

        if(element?.className =="dropDown-open"){
            element?.setAttribute('class'," ");
            element?.setAttribute('class',"dropDown");
        }   else{
            element?.setAttribute('class'," ");
            element?.setAttribute('class',"dropDown-open");
        }
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
