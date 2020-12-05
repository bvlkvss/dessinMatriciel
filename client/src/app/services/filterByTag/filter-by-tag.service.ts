import { Injectable } from '@angular/core';
import { Drawings } from '@common/classes/drawings';

const NOT_FOUND_INDEX = -1;
const MAX_TO_SHOW = 3;

@Injectable({
    providedIn: 'root',
})
export class FilterByTagService {
    drawings: Drawings[];
    drawingsToShow: Drawings[];
    initDrawings: Drawings[];
    found: boolean;
    filter(tag: string[]): void {
        const tmp = this.filtredDrawings(this.initDrawings, tag) as Drawings[];
        if (tmp && tmp.length > 0) {
            this.emptydrawings();
            tmp.forEach((draw) => {
                this.drawings.push(draw);
            });
            this.updateDrawingsToShow(tmp);
        }
    }
    ignoreFilter(): void {
        this.emptydrawings();
        this.initDrawings.forEach((draw) => {
            this.drawings.push(draw);
        });
        this.updateDrawingsToShow(this.drawings);
    }

    filterOnDeSelect(tags: string[]): void {
        const tmp = this.filtredDrawings(this.initDrawings, tags) as Drawings[];
        this.emptydrawings();
        if (tmp && tmp.length > 0) {
            tmp.forEach((draw) => {
                this.drawings.push(draw);
            });
        } else {
            for (const draw of this.initDrawings as Drawings[]) {
                this.drawings.push(draw);
            }
        }
        this.updateDrawingsToShow(this.drawings);
    }

    updateDrawingsToShow(drawings: Drawings[]): void {
        const step = drawings.length >= MAX_TO_SHOW ? MAX_TO_SHOW : drawings.length;
        for (let i = 0; i < step; i++) {
            if (drawings[i] && this.drawingsToShow.indexOf(drawings[i]) === NOT_FOUND_INDEX) {
                this.drawingsToShow.push(this.drawings[i]);
            }
        }
    }

    emptydrawings(): void {
        while (this.drawingsToShow.length > 0) {
            this.drawingsToShow.pop();
        }
        while (this.drawings.length > 0) {
            this.drawings.pop();
        }
    }

    filtredDrawings(drawings: Drawings[], tags: string[]): Drawings[] {
        const draws = [] as Drawings[];
        for (const draw of drawings) {
            for (const tag of tags) {
                const matches = (draw.tag.indexOf(tag) > NOT_FOUND_INDEX) as boolean;
                if (matches && draws.indexOf(draw) === NOT_FOUND_INDEX) {
                    draws.push(draw);
                    break;
                }
            }
        }
        return draws;
    }
}
