import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AddTagsComponent } from '@app/components/add-tags/add-tags.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SavingService } from '@app/services/saving/saving.service';

@Component({
    selector: 'app-saving',
    templateUrl: './saving.component.html',
    styleUrls: ['./saving.component.scss'],
})
export class SavingComponent {
    static isSavingOpen: boolean;

    image: HTMLImageElement;
    @ViewChild(AddTagsComponent) child: AddTagsComponent;
    @ViewChild('div') div: ElementRef;

    nameIsValid: boolean = false;

    nameIsInvalid: boolean = false;

    errorMessageVisible: boolean = false;

    spinnerVisible: boolean = false;

    isSaving: boolean = false;

    isNotSaving: boolean = true;

    drawingName: string;

    tagArr: string[] = [];

    constructor(protected drawingService: DrawingService, private dialogRef: MatDialogRef<SavingComponent>, private savingService: SavingService) {
        this.image = this.savingService.createBaseImage();
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    validateName(name: string): void {
        if (name === '') {
            // alert('Nom dessin maquant');
            this.nameIsInvalid = true;
        } else {
            this.drawingName = name;
            this.nameIsValid = true;
            this.nameIsInvalid = false;
        }
    }

    confirmationMessage(): void {
        alert('Le dessin a été enregistré correctement');
        this.closeDialog();
    }

    getTags(): string[] {
        // On get les tags du child component
        return (this.tagArr = this.child.tags);
    }

    add(name: string): void {
        this.validateName(name);

        if (this.nameIsValid) {
            this.getTags();
            this.savingService.addDrawing(this.image, { name: this.drawingName, tag: this.tagArr }).subscribe(
                /*tslint:disable-next-line:no-empty*/
                (data) => {
                    this.spinnerVisible = true;
                    this.isSaving = true;
                    this.isNotSaving = false;
                    this.confirmationMessage();
                },
                (error) => {
                    this.errorMessageVisible = true;
                },
            );
        }
        this.spinnerVisible = false;
        this.isSaving = false;
        this.isNotSaving = true;
    }
}
