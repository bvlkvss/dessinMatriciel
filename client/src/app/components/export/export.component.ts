import { ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService} from '@app/services/export/export.service'

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
    @ViewChild('demo') imageHtml: ElementRef<HTMLImageElement>;
    private type:string;
    private filter:string;
    private image:HTMLImageElement;
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private data: any,
        private exportService: ExportService,
        protected drawingService: DrawingService,
        private dialogRef: MatDialogRef<ExportComponent>,
        private cdRef: ChangeDetectorRef,
    ) {
        this.filter = "Flou";
        this.type = "jpg";
        this.image = this.exportService.createImageToExport(this.type);
    }
    
    setImageType(typeValue:string): void{
        this.type = typeValue;
        this.changeImage();
    }

    setImageFilter(filterValue:string): void{
        console.log(filterValue)
        this.filter = filterValue;
        this.setPreviewFilter();
        this.changeImage();
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    private setPreviewFilter(){
        this.exportService.setFilter(this.imageHtml.nativeElement, this.filter);
    }
    
    private changeImage(): void {
       this.exportService.setFilter(this.image, this.filter);
       this.cdRef.detectChanges();
    }
}
