import { Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private dialogRef: MatDialogRef<ExportComponent>) {
      }
    
      onConfirmClick(): void {
        this.dialogRef.close(true);
      }
}

