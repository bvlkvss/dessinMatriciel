import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-user-guide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.css'],
})
export class UserGuideComponent {
    static displayUserGuide(): void {
        const userGuide = document.getElementById('background') as HTMLElement;
        userGuide.style.display = 'block';
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.closeUserGuide();
        }
    }

    openTab(id: string): void {
        const outilDiv = document.getElementById('Outils') as HTMLElement;
        const diversDiv = document.getElementById('Divers') as HTMLElement;

        if (id === 'Outils') {
            diversDiv.style.display = 'none';

            if (outilDiv.style.display === 'none') outilDiv.style.display = 'block';
        } else {
            outilDiv.style.display = 'none';
            if (diversDiv.style.display === 'none') diversDiv.style.display = 'block';
        }
    }

    closeUserGuide(): void {
        const userGuide = document.getElementById('background') as HTMLElement;
        userGuide.style.display = 'none';
    }
}
