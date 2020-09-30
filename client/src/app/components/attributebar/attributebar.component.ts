import { Component, OnChanges, OnInit } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { LineService } from '@app/services/tools/line/line.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
  selector: 'app-attributebar',
  templateUrl: './attributebar.component.html',
  styleUrls: ['./attributebar.component.scss'],
})
export class AttributebarComponent implements OnInit, OnChanges {
  widthValue: string;
  junctionWidth: string = '1';
  idStyleRectangle: number = 2;
  idStyleBrush: number = 0;
  constructor(private tools: ToolsManagerService) { }
  private showContainer: boolean = false;
  private lastTool = this.tools.currentTool as Tool;

  ngOnChanges(): void {
    this.restoreValues();
  }
  ngOnInit(): void {
    this.widthValue = this.tools.currentTool.lineWidth.toString();
  }
  changeStyle(styleToChangeId: string, styleId: number): void {
    let shapeStyle = document.querySelector('#style' + styleId) as HTMLElement;
    let currentStyle = document.querySelector('#' + styleToChangeId) as HTMLElement;
    if (shapeStyle && currentStyle) {
      currentStyle.style.borderColor = window.getComputedStyle(shapeStyle).borderColor;
      currentStyle.style.backgroundColor = window.getComputedStyle(shapeStyle).backgroundColor;
      currentStyle.style.borderStyle = window.getComputedStyle(shapeStyle).borderStyle;
      currentStyle.style.borderWidth = window.getComputedStyle(shapeStyle).borderWidth;
    }
  }
  restoreValues(): void {
    let currentTool;
    if (this.tools.currentTool.lineWidth) this.widthValue = this.tools.currentTool.lineWidth.toString();
    if (this.tools.currentTool === this.tools.getTools().get('rectangle')) {
      currentTool = this.tools.currentTool as RectangleService;
      this.changeStyle("currentRectangleStyle", currentTool.rectangleStyle);
    } else if (this.tools.currentTool === this.tools.getTools().get('ellipse')) {
      currentTool = this.tools.currentTool as EllipseService;
      this.changeStyle("currentEllipseStyle", currentTool.ellipseStyle);
    } else if (this.tools.currentTool === this.tools.getTools().get('line')) {
      currentTool = this.tools.currentTool as LineService;
      this.junctionWidth = currentTool.junctionWidth.toString();
      let inputValue = document.getElementById('sliderJunction') as HTMLInputElement;
      if (inputValue) inputValue.checked = currentTool.withJunction;
    }
    else if (this.tools.currentTool === this.tools.getTools().get('brush')) {
      let brush = this.tools.currentTool as BrushService;
      brush.setTexture(brush.imageId);
      let currentImage = document.querySelector('#currentImage') as HTMLImageElement;
      if (currentImage)
        currentImage.src = '../../../assets/b' + brush.imageId + '.svg'
    }
  }
  acceptChanges(): void {
    let inputValue;
    if (this.tools.currentTool === this.tools.getTools().get('pencil')) {
      this.tools.setLineWidth(Number(this.widthValue));
    } else if (this.tools.currentTool === this.tools.getTools().get('rectangle')) {

      this.tools.setLineWidth(Number(this.widthValue));
      this.tools.setRectangleStyle(this.idStyleRectangle);
    } else if (this.tools.currentTool === this.tools.getTools().get('ellipse')) {
      this.tools.setEllipseStyle(this.idStyleRectangle);
      this.tools.setLineWidth(Number(this.widthValue));
    } else if (this.tools.currentTool === this.tools.getTools().get('line')) {
      this.tools.setLineWidth(Number(this.widthValue));
      this.tools.setJunctionWidth(Number(this.junctionWidth));
      inputValue = document.getElementById('sliderJunction') as HTMLInputElement;
      this.tools.setJunctionState(inputValue.checked);

    } else if (this.tools.currentTool === this.tools.getTools().get('brush')) {
      let brush = this.tools.currentTool as BrushService;
      brush.imageId = this.idStyleBrush;
      brush.setTexture(this.idStyleBrush);
    }
    else {
      this.tools.setLineWidth(Number(this.widthValue));
    }
  }
  checkIfContainAttribute(attribute: string): boolean {
    if (this.lastTool !== this.tools.currentTool) {
      this.lastTool = this.tools.currentTool;
      this.restoreValues();
    }
    return this.tools.currentTool.toolAttributes.includes(attribute);
  }
  setLineWidth(input: string): void {
    this.widthValue = input;
  }
  setJunctionWidth(input: string): void {
    this.junctionWidth = input;
  }
  setJunctionState(): void {
    let checkBox = document.querySelector('#sliderJunction') as HTMLInputElement;
    let slider = document.querySelector('.sliderJunction') as HTMLElement;
    if (checkBox.checked) {
      slider.style.background = 'white';
    } else slider.style.background = 'gray';
  }
  updateTextInput(): void {
    let input = document.querySelector('.size-slider') as HTMLInputElement;
    let inputToUpdate = document.querySelector('.textInput') as HTMLInputElement;
    inputToUpdate.value = input.value + 'px';
  }
  toggleList(id: string): void {
    this.showContainer = !this.showContainer;
    let container = document.querySelector('#' + id) as HTMLElement;
    let icon = container.previousSibling?.lastChild as HTMLElement;
    if (this.showContainer) {
      if (container.id === 'currentImageContainer') container.style.display = 'table-cell';
      else container.style.display = 'flex';
      icon.innerHTML = 'expand_less';
    } else {
      container.style.display = 'none';
      icon.innerHTML = 'expand_more';
    }
  }
  setTexture(id: number): void {
    let currentImage = document.querySelector('#currentImage') as HTMLImageElement;
    currentImage.src = '../../../assets/b' + id + '.svg'
    this.idStyleBrush = id;
  }

  setShapeStyle(idStyle: number, isEllipse: boolean): void {
    if (isEllipse)
      this.changeStyle("currentEllipseStyle", idStyle);
    else
      this.changeStyle("currentRectangleStyle", idStyle);
    this.idStyleRectangle = idStyle;
  }
}
