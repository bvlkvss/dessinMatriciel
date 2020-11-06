import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';

const TAGS_ARRAY_SIZE_MAX = 8;
@Component({
    selector: 'add-tags',
    templateUrl: 'add-tags.component.html',
    styleUrls: ['add-tags.component.scss'],
})
export class AddTagsComponent {
    visible: boolean = true;
    selectable: boolean = true;
    removable: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    tags: string[] = [];

    add(event: MatChipInputEvent): void {
        const input: HTMLInputElement = event.input;
        const value: string = event.value;
        const regex = /^[a-zA-Z]+$/; // Validation pour accepter les caracteres alphanumeriques
        if (value.match(regex) && this.tags.length < TAGS_ARRAY_SIZE_MAX) {
            this.tags.push(value);
            input.value = '';
        } else if (!value.match(regex)) {
            alert('Les espaces, les chiffres et les symboles ne sont pas permis dans les tags.');
        } else if (this.tags.length === TAGS_ARRAY_SIZE_MAX) {
            alert('Vous avez atteint le nombre maximal de tags alloués.');
        }
    }
    remove(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) this.tags.splice(index, 1);
    }
}
