import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/export/export.service';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
    static isExportOpen: boolean;
    @ViewChild('demo') imageHtml: ElementRef<HTMLImageElement>;
    private type: string;
    private filter: string;
    private name: string;
    private isError: boolean;
    email: string;
    image: HTMLImageElement;
    constructor(private exportService: ExportService, protected drawingService: DrawingService, private dialogRef: MatDialogRef<ExportComponent>) {
        this.filter = 'none';
        this.type = 'jpeg';
        this.name = 'MonDessin';
        this.email = 'none';
        this.image = this.exportService.createBaseImage();
        this.dialogRef.afterClosed().subscribe(() => {
            ExportComponent.isExportOpen = false;
        });
    }

    saveImageOnDisk(): void {
        if (window.confirm('Voulez vous vraiment sauvegarder ce dessin sur votre ordinateur')) this.exportImage();
        this.closeDialog();
    }

    async sendEmail(): Promise<boolean> {
        if (!this.validateEmail(this.email)) {
            alert('Vous devez entrer un email valide de type example@example.xyz');
            return false;
        } else {
            if (window.confirm('Voulez vous vraiment envoyer ce dessin par courriel')) {
                await this.sendImage();
                if (this.isError) {
                    alert("Une erreur a eu lieu durant l'envoi de votre dessin");
                    return false;
                }

                alert('Dessin envoyé avec succès');
                this.closeDialog();
                return true;
            }
            this.closeDialog();
            return false;
        }
    }

    async sendImage(): Promise<boolean> {
        this.isError = !(await this.exportService.sendEmailDataToServer(this.image, this.name, this.filter, this.type, this.email));
        return this.isError;
    }

    exportImage(): void {
        this.exportService.exportImage(this.image, this.name, this.filter, this.type);
    }

    setEmail(emailValue: string): void {
        this.email = emailValue;
    }

    setImageName(nameValue: string): void {
        this.name = nameValue;
    }

    setImageType(typeValue: string): void {
        this.type = typeValue;
        this.changeImage();
    }

    setImageFilter(filterValue: string): void {
        this.filter = filterValue;
        this.setPreviewFilter();
        this.changeImage();
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    validateEmail(email: string): boolean {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email);
    }

    private setPreviewFilter(): void {
        this.exportService.setFilter(this.imageHtml.nativeElement, this.filter);
    }

    private changeImage(): void {
        this.exportService.setFilter(this.image, this.filter);
    }
}
