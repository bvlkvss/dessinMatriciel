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
  junctionWidth: string = "1";
  constructor(private tools: ToolsManagerService) {
  }
  private showContainer: boolean = false;
  ngOnInit(): void {
    this.widthValue = this.tools.currentTool.lineWidth.toString();
  }
  restoreValues(): void {
    if (this.tools.currentTool.lineWidth)
      this.widthValue = this.tools.currentTool.lineWidth.toString();

  }
  checkIfContainAttribute(attribute: string): boolean {
    this.restoreValues();
    return this.tools.currentTool.toolAttributes.includes(attribute);
  }
  setLineWidth(input: string): void {
    this.widthValue = input;
    this.tools.setLineWidth(Number(input));
  }
  setJunctionWidth(input: string): void {

    this.junctionWidth = input;
    this.tools.setJunctionWidth(Number(input));

  }
  setJunctionState(): void {
    let checkBox = document.querySelector("#sliderJunction") as HTMLInputElement;
    let slider = document.querySelector(".sliderJunction") as HTMLElement;
    slider.style.background = "gray";
    if (checkBox.checked) {
      slider.style.background = "white";
    }
    this.tools.setJunctionState();


  }
  updateTextInput(): void {
    let input = document.querySelector(".size-slider") as HTMLInputElement
    let inputToUpdate = document.querySelector(".textInput") as HTMLInputElement;
    inputToUpdate.value = input.value + "px";
  }
  toggleList(id: string): void {
    this.showContainer = !this.showContainer
    let container = document.querySelector("#" + id) as HTMLElement;


    let icon = container.previousSibling?.lastChild as HTMLElement;
    if (this.showContainer) {
      if (container.id === "currentImageContainer")
        container.style.display = "table-cell";
      else
        container.style.display = "flex";
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
  setShapeStyle(idStyle: number, isEllipse: boolean): void {
    let currentStyle;
    if (isEllipse)
      currentStyle = document.querySelector("#currentEllipseStyle") as HTMLElement;
    else
      currentStyle = document.querySelector("#currentRectangleStyle") as HTMLElement;

    let shapeStyle = document.querySelector("#style" + idStyle) as HTMLElement;
    currentStyle.style.borderColor = window.getComputedStyle(shapeStyle).borderColor;
    currentStyle.style.backgroundColor = window.getComputedStyle(shapeStyle).backgroundColor;
    currentStyle.style.borderStyle = window.getComputedStyle(shapeStyle).borderStyle;
    currentStyle.style.borderWidth = window.getComputedStyle(shapeStyle).borderWidth;
    console.log(window.getComputedStyle(shapeStyle).borderStyle);
    if (isEllipse)
      this.tools.setEllipseStyle(idStyle);
    else
      this.tools.setRectangleStyle(idStyle);


  }

  //<app-color-picker id="colorPicker" style="z-index: -1"></app-color-picker>

}
