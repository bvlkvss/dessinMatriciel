import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DrawingCardComponent } from '@app/components/drawing-card/drawing-card.component';
import { FilterByTagService } from '@app/services/filterByTag/filter-by-tag.service';
import { Observable } from 'rxjs';

export interface Drawings {
    name: string;
    imageData: string;
    tag: string[];
    _id?: string;
}
const DRAWINGS_TO_SHOW_LIMIT = 3;
@Component({
    selector: 'app-carrousel',
    templateUrl: './carrousel.component.html',
    styleUrls: ['./carrousel.component.scss'],
})
export class CarrouselComponent implements OnInit, AfterViewChecked {
    allDrawings: Drawings[];
    drawingsToShow: Drawings[];
    middlePosition: number;
    previousCount: number = 0;
    errorMessageVisible: boolean = false;
    spinnerVisible: boolean = false;
    deleteErrorMessage: boolean = false;
    emptyCarrouselMessage: boolean = false;
    carouselVisible: boolean = true;
    drawing: Drawings;
    step: number;
    @ViewChildren('button') buttons: QueryList<ElementRef<HTMLButtonElement>>;
    @ViewChildren('card') cards: QueryList<DrawingCardComponent>;

    constructor(private http: HttpClient, public filter: FilterByTagService) {
        this.allDrawings = [];
        this.drawingsToShow = [];
        this.fillCarousel();
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDownWindow(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft' && this.drawingsToShow.length >= 2) this.previous();
        else if (event.key === 'ArrowRight' && this.drawingsToShow.length >= 2) this.next();
    }

    fillCarousel(): void {
        this.getDrawings().subscribe(
            (drawings) => {
                this.allDrawings = drawings;
                this.spinnerVisible = false;
                this.step = this.allDrawings.length >= DRAWINGS_TO_SHOW_LIMIT ? DRAWINGS_TO_SHOW_LIMIT : this.allDrawings.length;
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
    /* tslint:disable:no-empty */
    ngOnInit(): void {}
    getDrawings(): Observable<Drawings[]> {
        this.spinnerVisible = true;
        this.emptyCarrouselMessage = false;
        return this.http.get<Drawings[]>('http://localhost:3000/api/drawings/localServer');
    }
    addDrawing(drawing: Drawings): void {
        if (!this.drawingsToShow.find((element) => element === drawing)) this.drawingsToShow.push(drawing);
    }
    deleteFromServer(drawingToDelete: number): Observable<object> {
        this.spinnerVisible = true;
        this.carouselVisible = false;
        return this.http.delete('http://localhost:3000/api/drawings/' + this.allDrawings[drawingToDelete]._id);
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
                if (this.allDrawings.length >= DRAWINGS_TO_SHOW_LIMIT) {
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
        if (this.allDrawings.length < DRAWINGS_TO_SHOW_LIMIT) {
            this.swapDrawings();
        } else {
            this.middlePosition = (this.middlePosition - 1 + this.allDrawings.length) % this.allDrawings.length;
            this.drawingsToShow.pop();
            if (this.allDrawings[this.middlePosition - 1]) this.drawingsToShow.unshift(this.allDrawings[this.middlePosition - 1]);
            else this.drawingsToShow.unshift(this.allDrawings[this.allDrawings.length - 1]);
        }
    }
    swapDrawings(): void {
        const tmp = this.drawingsToShow[0];
        const tmp1 = this.drawingsToShow[1];
        this.drawingsToShow[0] = tmp1;
        this.drawingsToShow[1] = tmp;
    }
    next(): void {
        if (this.allDrawings.length < DRAWINGS_TO_SHOW_LIMIT) {
            this.swapDrawings();
        } else {
            this.middlePosition = (this.middlePosition + 1) % this.allDrawings.length;
            this.drawingsToShow.splice(0, 1);
            if (this.allDrawings[this.middlePosition + 1]) this.addDrawing(this.allDrawings[this.middlePosition + 1]);
            else this.addDrawing(this.allDrawings[0]);
        }
    }
}
