import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService} from '@app/services/export/export.service'

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private exportService: ExportService,
        protected drawingService: DrawingService,
        private data: any,
        private dialogRef: MatDialogRef<ExportComponent>,
    ) {}
    
    getImage

    closeDialog(): void {
        this.dialogRef.close(true);
    }
}
