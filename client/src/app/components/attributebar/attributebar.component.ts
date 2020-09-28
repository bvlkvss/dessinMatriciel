import { Component, OnInit } from '@angular/core';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
  selector: 'app-attributebar',
  templateUrl: './attributebar.component.html',
  styleUrls: ['./attributebar.component.scss']
})
export class AttributebarComponent implements OnInit {
  widthValue: string
  constructor(private tools: ToolsManagerService) {
  }
  private showContainer: boolean = false;
  ngOnInit(): void {
    this.widthValue = this.tools.currentTool.lineWidth.toString();
  }

  checkIfContainAttribute(attribute: string): boolean {
    return this.tools.currentTool.toolAttributes.includes(attribute);
  }
  setLineWidth(input: string): void {
    this.widthValue = input;
    this.tools.setLineWidth(Number(input));
  }
  updateTextInput(): void {
    let input = document.querySelector(".size-slider") as HTMLInputElement
    let inputToUpdate = document.querySelector(".textInput") as HTMLInputElement;
    inputToUpdate.value = input.value + "px";
  }
  toggleTextureList(): void {
    this.showContainer = !this.showContainer
    let container = document.querySelector("#textureContainer") as HTMLElement;
    let icon = document.querySelector("#icon") as HTMLElement;
    if (this.showContainer) {
      container.style.display = "table-cell";
      icon.innerHTML = "expand_less";
    }
    else {
      container.style.display = "none";
      icon.innerHTML = "expand_more";

    }
  }
  setTexture(id: number): void {
    let brush = this.tools.getTools()[1] as BrushService;

    brush.setTexture(id);
    let currentImage = document.querySelector("#currentImage") as HTMLImageElement;
    currentImage.src = '../../../assets/b' + id + '.svg';
  }
  //<app-color-picker id="colorPicker" style="z-index: -1"></app-color-picker>

}
