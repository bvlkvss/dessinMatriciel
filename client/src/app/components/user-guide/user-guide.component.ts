import { Component } from '@angular/core';

@Component({
    selector: 'app-user-guide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.css'],
})
export class UserGuideComponent {
    openTab(id: string): void {
        let outilDiv = document.getElementById('Outils') as HTMLElement;
        let diversDiv = document.getElementById('Divers') as HTMLElement;
        if (id == 'Outils'){
        diversDiv.style.display = 'none';
        if(outilDiv.style.display == 'none') outilDiv.style.display = 'block';
        }else {
            outilDiv.style.display = 'none';
            if(diversDiv.style.display == 'none') diversDiv.style.display = 'block';
        }
    }

    static displayUserGuide(): void {
        let userGuide = document.getElementById('background') as HTMLElement;
        userGuide.style.display = 'block';
    }

    closeUserGuide(): void {
        console.log('CLOSE USER GUIDE');
        let userGuide = document.getElementById('background') as HTMLElement;
        userGuide.style.display = 'none';
    }
}
