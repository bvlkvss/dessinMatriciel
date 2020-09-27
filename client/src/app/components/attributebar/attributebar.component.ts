import { Component, OnInit } from '@angular/core';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
  selector: 'app-attributebar',
  templateUrl: './attributebar.component.html',
  styleUrls: ['./attributebar.component.scss']
})
export class AttributebarComponent implements OnInit {
  constructor(private tools: ToolsManagerService) { }

  ngOnInit(): void {

  }

  checkIfContainAttribute(attribute: string): boolean {
    return this.tools.currentTool.toolAttributes.includes(attribute);
  }
  setLineWidth(): void {
    let input = document.querySelector(".size-slider") as HTMLInputElement
    this.tools.setLineWidth(input.valueAsNumber);
  }
  updateTextInput(): void {
    let input = document.querySelector(".size-slider") as HTMLInputElement
    let inputToUpdate = document.querySelector(".textInput") as HTMLInputElement;
    inputToUpdate.value = input.value + "px";
  }

  //<app-color-picker id="colorPicker" style="z-index: -1"></app-color-picker>

}
