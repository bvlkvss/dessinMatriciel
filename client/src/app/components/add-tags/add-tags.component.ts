import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { Const } from '@app/classes/constants';

@Component({
    selector: 'add-tags',
    templateUrl: 'add-tags.component.html',
    styleUrls: ['add-tags.component.scss'],
})
export class AddTagsComponent {
    visible: boolean;
    selectable: boolean;
    removable: boolean;
    readonly separatorKeysCodes: number[];
    tags: string[];
    constructor() {
        this.visible = true;
        this.selectable = true;
        this.removable = true;
        this.separatorKeysCodes = [ENTER, COMMA, SPACE];
        this.tags = [];
    }
    add(event: MatChipInputEvent): void {
        const input: HTMLInputElement = event.input;
        const value: string = event.value;
        const regex = /^[a-zA-Z]+$/; // Validation pour accepter les caracteres alphanumeriques
        if (value.match(regex) && this.tags.length < Const.TAGS_ARRAY_SIZE_MAX) {
            this.tags.push(value);
            input.value = '';
        } else if (!value.match(regex)) {
            alert('Les espaces, les chiffres et les symboles ne sont pas permis dans les tags.');
        } else if (this.tags.length === Const.TAGS_ARRAY_SIZE_MAX) {
            alert('Vous avez atteint le nombre maximal de tags alloués.');
        }
    }
    remove(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) this.tags.splice(index, 1);
    }
}
