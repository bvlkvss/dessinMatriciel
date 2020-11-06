import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FilterByTagService } from '@app/services/filterByTag/filter-by-tag.service';
import { Drawings } from '@common/classes/drawings';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
    selector: 'app-filter-tag',
    templateUrl: './filter-tag.component.html',
    styleUrls: ['./filter-tag.component.scss'],
})
export class FilterTagComponent implements OnInit {
    selectedTags: string[] = [];
    tags: string[] = [];
    dropdownSettings: IDropdownSettings;
    constructor(private http: HttpClient, private filter: FilterByTagService) {}
    ngOnInit(): void {
        this.http.get<Drawings[]>('http://localhost:3000/api/drawings/localServer').subscribe((drawings) => {
            this.filter.initDrawings = drawings;
        });
        this.dropdownSettings = {
            singleSelection: false,
            enableCheckAll: true,
            allowSearchFilter: true,
        };
    }

    onClick(): void {
        this.updateTags(this.filter.initDrawings);
    }

    updateTags(drawings: Drawings[]): void {
        const tmp = [] as string[];
        for (const draw of drawings) {
            for (const tag of draw.tag) {
                if (!tmp.find((element) => element === tag)) {
                    tmp.push(tag);
                }
            }
        }
        this.tags = tmp;
    }
    onItemSelect(): void {
        console.log('called');
        this.filter.filter(this.selectedTags);
    }
    ignoreFilter(): void {
        this.filter.ignoreFilter();
    }
    onDeSelect(): void {
        this.filter.filterOnDeSelect(this.selectedTags);
    }
}
