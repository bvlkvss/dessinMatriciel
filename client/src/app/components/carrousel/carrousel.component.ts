import { AfterViewChecked, Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { Const } from '@app/classes/constants';
import { DrawingCardComponent } from '@app/components/drawing-card/drawing-card.component';
import { FilterByTagService } from '@app/services/filterByTag/filter-by-tag.service';
import { HttpClientRequestService } from '@app/services/http-client-request/http-client-request.service';
import { Observable } from 'rxjs';

export interface Drawings {
    name: string;
    imageData: string;
    tag: string[];
    _id?: string;
}
@Component({
    selector: 'app-carrousel',
    templateUrl: './carrousel.component.html',
    styleUrls: ['./carrousel.component.scss'],
})
export class CarrouselComponent implements AfterViewChecked {
    allDrawings: Drawings[];
    drawingsToShow: Drawings[];
    private middlePosition: number;
    previousCount: number;
    errorMessageVisible: boolean;
    spinnerVisible: boolean;
    deleteErrorMessage: boolean;
    emptyCarrouselMessage: boolean;
    carouselVisible: boolean;
    drawing: Drawings;
    private step: number;
    @ViewChildren('button') buttons: QueryList<ElementRef<HTMLButtonElement>>;
    @ViewChildren('card') cards: QueryList<DrawingCardComponent>;

    constructor(private httpService: HttpClientRequestService, public filter: FilterByTagService) {
        this.previousCount = 0;
        this.errorMessageVisible = false;
        this.spinnerVisible = false;
        this.deleteErrorMessage = false;
        this.emptyCarrouselMessage = false;
        this.carouselVisible = true;
        this.allDrawings = [];
        this.drawingsToShow = [];
        this.fillCarousel();
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft' && this.drawingsToShow.length >= 2) this.previous();
        else if (event.key === 'ArrowRight' && this.drawingsToShow.length >= 2) this.next();
    }
    private fillCarousel(): void {
        this.getDrawings().subscribe(
            (drawings) => {
                this.allDrawings = drawings;
                this.spinnerVisible = false;
                this.step = this.allDrawings.length >= Const.DRAWINGS_TO_SHOW_LIMIT ? Const.DRAWINGS_TO_SHOW_LIMIT : this.allDrawings.length;
                for (let i = 0; i < this.step; i++) {
                    if (this.allDrawings[i]) this.drawingsToShow.push(this.allDrawings[i]);
                }
                this.filter.drawings = this.allDrawings;
                this.filter.drawingsToShow = this.drawingsToShow;
                this.middlePosition = this.drawingsToShow.length - this.step + 1;
            },
            () => {
                this.spinnerVisible = false;
                this.errorMessageVisible = true;
            },
        );
    }
    ngAfterViewChecked(): void {
        this.emptyCarrouselMessage = this.allDrawings.length === 0 && !this.spinnerVisible && !this.errorMessageVisible ? true : false;
        if (this.allDrawings.length <= 1) {
            if (this.cards.toArray()[0]) this.cards.toArray()[0].drawingIndex = 1;
            this.buttons.forEach((element) => {
                element.nativeElement.style.visibility = 'hidden';
            });
        } else
            this.buttons.forEach((element) => {
                element.nativeElement.style.visibility = 'visible';
            });
    }
    private getDrawings(): Observable<Drawings[]> {
        this.spinnerVisible = true;
        this.emptyCarrouselMessage = false;
        return this.httpService.getRequest();
    }
    private addDrawing(drawing: Drawings): void {
        if (!this.drawingsToShow.find((element) => element === drawing)) this.drawingsToShow.push(drawing);
    }
    private deleteFromServer(drawingToDelete: number): Observable<object> {
        this.spinnerVisible = true;
        this.carouselVisible = false;
        return this.httpService.deleteRequest(this.allDrawings[drawingToDelete]._id);
    }
    delete(drawing: Drawings): void {
        const drawingToHide: number = this.drawingsToShow.indexOf(drawing);
        const drawingToDelete: number = this.allDrawings.indexOf(drawing);
        this.deleteFromServer(drawingToDelete).subscribe(
            () => {
                this.spinnerVisible = false;
                this.carouselVisible = true;
                this.deleteErrorMessage = false;
                this.allDrawings.splice(drawingToDelete, 1);
                this.drawingsToShow.splice(drawingToHide, 1);
                if (this.allDrawings.length >= Const.DRAWINGS_TO_SHOW_LIMIT) {
                    if (this.allDrawings[this.middlePosition + 1]) this.addDrawing(this.allDrawings[this.middlePosition + 1]);
                    else this.addDrawing(this.allDrawings[1]);
                }
            },
            () => {
                this.spinnerVisible = false;
                this.carouselVisible = true;
                this.deleteErrorMessage = true;
            },
        );
    }
    previous(): void {
        if (this.allDrawings.length < Const.DRAWINGS_TO_SHOW_LIMIT) {
            this.swapDrawings();
            return;
        }
        this.middlePosition = (this.middlePosition - 1 + this.allDrawings.length) % this.allDrawings.length;
        this.drawingsToShow.pop();
        if (this.allDrawings[this.middlePosition - 1]) this.drawingsToShow.unshift(this.allDrawings[this.middlePosition - 1]);
        else this.drawingsToShow.unshift(this.allDrawings[this.allDrawings.length - 1]);
    }
    swapDrawings(): void {
        const tmp = this.drawingsToShow[0];
        this.drawingsToShow[0] = { ...this.drawingsToShow[1] };
        this.drawingsToShow[1] = { ...tmp };
    }
    next(): void {
        if (this.allDrawings.length < Const.DRAWINGS_TO_SHOW_LIMIT) {
            this.swapDrawings();
            return;
        }
        this.middlePosition = (this.middlePosition + 1) % this.allDrawings.length;
        this.drawingsToShow.splice(0, 1);
        if (this.allDrawings[this.middlePosition + 1]) this.addDrawing(this.allDrawings[this.middlePosition + 1]);
        else this.addDrawing(this.allDrawings[0]);
    }
}
