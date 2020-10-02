import { Component, OnInit } from '@angular/core';
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
export class AttributebarComponent implements OnInit {
    widthValue: string;
    junctionWidth: string = '1';
    idStyleRectangle: number = 2;
    idStyleBrush: number = 1;
    constructor(private tools: ToolsManagerService) {}
    private showContainer: boolean = false;
    private lastTool: Tool = this.tools.currentTool;

    ngOnInit(): void {
        this.widthValue = this.tools.currentTool.lineWidth.toString();
    }

    changeStyle(styleToChangeId: string, styleId: number): void {
        const shapeStyle = document.querySelector('#style' + styleId) as HTMLElement;
        const currentStyle = document.querySelector('#' + styleToChangeId) as HTMLElement;

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
        switch (this.tools.currentTool) {
            case this.tools.getTools().get('rectangle'):
                currentTool = this.tools.currentTool as RectangleService;
                this.changeStyle('currentRectangleStyle', currentTool.rectangleStyle);
                break;

            case this.tools.getTools().get('ellipse'):
                currentTool = this.tools.currentTool as EllipseService;
                this.changeStyle('currentEllipseStyle', currentTool.ellipseStyle);
                break;

            case this.tools.getTools().get('line'):
                currentTool = this.tools.currentTool as LineService;
                this.junctionWidth = currentTool.junctionWidth.toString();
                const inputValue = document.getElementById('sliderJunction') as HTMLInputElement;
                if (inputValue) inputValue.checked = currentTool.withJunction;
                break;

            case this.tools.getTools().get('brush'):
                const brush = this.tools.currentTool as BrushService;
                brush.setTexture(brush.imageId);
                const currentImage = document.querySelector('#currentImage') as HTMLImageElement;
                if (currentImage) currentImage.src = '../../../assets/b' + brush.imageId + '.svg';
        }
    }

    acceptChanges(): void {
        let inputValue;
        this.tools.setLineWidth(Number(this.widthValue));
        switch (this.tools.currentTool) {
            case this.tools.getTools().get('rectangle'):
                this.tools.setRectangleStyle(this.idStyleRectangle);
                break;
            case this.tools.getTools().get('ellipse'):
                this.tools.setEllipseStyle(this.idStyleRectangle);
                break;
            case this.tools.getTools().get('line'):
                this.tools.setJunctionWidth(Number(this.junctionWidth));
                inputValue = document.getElementById('sliderJunction') as HTMLInputElement;
                this.tools.setJunctionState(inputValue.checked);
                break;
            case this.tools.getTools().get('brush'):
                const brush = this.tools.currentTool as BrushService;
                brush.imageId = this.idStyleBrush;
                brush.setTexture(this.idStyleBrush);
                break;
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
        const checkBox = document.querySelector('#sliderJunction') as HTMLInputElement;
        const slider = document.querySelector('.sliderJunction') as HTMLElement;
        if (checkBox.checked) slider.style.background = 'white';
        else slider.style.background = 'gray';
    }

    updateTextInput(): void {
        const input = document.querySelector('.size-slider') as HTMLInputElement;
        const inputToUpdate = document.querySelector('.textInput') as HTMLInputElement;
        inputToUpdate.value = input.value + 'px';
    }

    toggleList(id: string): void {
        this.showContainer = !this.showContainer;
        const container = document.querySelector('#' + id) as HTMLElement;
        const icon = container.previousSibling?.lastChild as HTMLElement;
        if (this.showContainer) {
            if (container.id === 'styleContainer') container.style.display = 'flex';
            else container.style.display = 'table-cell';
            icon.innerHTML = 'expand_less';
        } else {
            container.style.display = 'none';
            icon.innerHTML = 'expand_more';
        }
    }

    setTexture(id: number): void {
        const currentImage = document.querySelector('#currentImage') as HTMLImageElement;
        currentImage.src = '../../../assets/b' + id + '.svg';
        this.idStyleBrush = id;
    }

    setShapeStyle(idStyle: number, isEllipse: boolean): void {
        if (isEllipse) this.changeStyle('currentEllipseStyle', idStyle);
        else this.changeStyle('currentRectangleStyle', idStyle);
        this.idStyleRectangle = idStyle;
    }
}
