import { Component, OnInit } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
const MAX_WIDTH_VALUE = 100;
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
    tolerance: string = '0';
    currentTexture: string = '../../../assets/b1.svg';
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
        if (this.tools.currentTool.lineWidth) this.widthValue = this.tools.currentTool.lineWidth.toString();
    }

    validate(event: KeyboardEvent): void {
        const WIDTH_ALLOWED_CHARS_REGEXP = /[0-9\/]+/;
        if (event.key !== 'Backspace' && event.key !== 'Enter' && !WIDTH_ALLOWED_CHARS_REGEXP.test(event.key)) {
            event.preventDefault();
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
        if (Number(this.widthValue) > MAX_WIDTH_VALUE) this.widthValue = '100';
        this.tools.setLineWidth(Number(this.widthValue));
    }

    setJunctionWidth(input: string): void {
        this.junctionWidth = input;
        this.tools.setJunctionWidth(Number(this.junctionWidth));
    }

    setJunctionState(checkBoxValue: boolean): void {
        this.tools.setJunctionState(checkBoxValue);
    }

    setTolerance(input: string): void {
        this.tolerance = input;
        if (Number(this.tolerance) > MAX_WIDTH_VALUE) this.tolerance = '100';
        this.tools.setBucketTolerance(Number(this.tolerance));
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
        const brush = this.tools.currentTool as BrushService;
        brush.setTexture(id);
        this.currentTexture = '../../../assets/b' + id + '.svg';
    }

    setShapeStyle(idStyle: number, isEllipse: boolean): void {
        this.idStyleRectangle = idStyle;
        if (isEllipse) {
            this.changeStyle('currentEllipseStyle', idStyle);
            this.tools.setEllipseStyle(this.idStyleRectangle);
        } else {
            this.changeStyle('currentRectangleStyle', idStyle);
            this.tools.setRectangleStyle(this.idStyleRectangle);
        }
    }

    setNumberSides(newNumberSides: number): void {
        this.tools.setPolygonNumberSides(newNumberSides);
    }
}
