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

    nameIsValid: boolean;
    nameIsInvalid: boolean;
    errorMessageVisible: boolean;
    spinnerVisible: boolean;
    isSaving: boolean;
    isNotSaving: boolean;
    drawingName: string;
    tagArr: string[] = [];

    constructor(protected drawingService: DrawingService, private dialogRef: MatDialogRef<SavingComponent>, private savingService: SavingService) {
        this.nameIsValid = false;
        this.nameIsInvalid = false;
        this.errorMessageVisible = false;
        this.spinnerVisible = false;
        this.isSaving = false;
        this.isNotSaving = true;
        this.tagArr = [];
        this.image = this.savingService.createBaseImage();
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    validateName(name: string): void {
        if (name === '') {
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
                () => {
                    this.spinnerVisible = true;
                    this.isSaving = true;
                    this.isNotSaving = false;
                    this.confirmationMessage();
                },
                () => {
                    this.errorMessageVisible = true;
                },
            );
        }
        this.spinnerVisible = false;
        this.isSaving = false;
        this.isNotSaving = true;
    }
}
