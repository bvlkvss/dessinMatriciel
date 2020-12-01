import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { DrawingCardComponent } from '@app/components/drawing-card/drawing-card.component';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { Message } from '@common/communication/message';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'PolyDessin2';
    message: BehaviorSubject<string>;
    drawingData: string | null;

    constructor(private basicService: IndexService, private dialog: MatDialog, private drawingService: DrawingService) {
        this.message = new BehaviorSubject<string>('');
        this.drawingData = localStorage.getItem('drawing');
    }

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.basicService.basicPost(newTimeMessage).subscribe();
    }

    getMessagesFromServer(): void {
        this.basicService
            .basicGet()
            // Cette étape transforme le Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }
    openCarousel(): void {
        this.dialog.open(CarrouselComponent, {
            maxWidth: 'none',
            height: '460px',
            width: 'auto',
            minWidth: '615px',
        });
    }
    openUserGuide(): void {
        UserGuideComponent.displayUserGuide();
    }

    continueDrawing(): void {
        this.drawingService.getAfterViewObservable().subscribe(() => {
            if (this.drawingData != null) {
                DrawingCardComponent.drawImage(this.drawingService, this.drawingData);
            }
        });
    }

    newDrawing(): void {
        this.drawingService.getAfterViewObservable().subscribe(() => {
            localStorage.setItem('drawing', this.drawingService.canvas.toDataURL());
        });
    }
}
