import { Component, HostListener, OnInit } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
  hue: string;
  color: string;
  constructor(private tools: ToolsManagerService) { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.tools.setColor(this.color);
  }

  ngOnInit(): void { }
}
