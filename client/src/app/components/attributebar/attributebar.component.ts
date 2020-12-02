import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSelectChange } from '@angular/material/select';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { Arguments, PipetteService } from '@app/services/tools/pipette/pipette.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

const MAX_WIDTH_VALUE = 100;
const IMAGE_ZOOM = 60;
const PIPETTE_IMAGE_WIDTH = 10;
const PIPETTE_IMAGE_HEIGHT = 10;
const PIPETTE_IMAGE_OFFSET_Y = -5;
const PIPETTE_IMAGE_OFFSET_X = 3;
const RECT_STROKE = 4;
const RECT_SIZE = 5;

@Component({
    selector: 'app-attributebar',
    templateUrl: './attributebar.component.html',
    styleUrls: ['./attributebar.component.scss'],
})
export class AttributebarComponent implements OnInit, AfterViewChecked, AfterViewInit {
    widthValue: string;
    junctionWidth: string = '1';
    idStyleRectangle: number = 2;
    idStyleBrush: number = 1;
    degreeValue: string;
    tolerance: string = '0';
    leftStampFactorValue: number;
    rightStampFactorValue: number;
    selectedValue: string;
    polices: string[] = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Comic Sans MS, cursive', 'Trebuchet MS, Helvetica'];
    circleIsShown: boolean = true;
    showStamps: boolean = true;
    @ViewChild('pipette', { static: false }) pipetteCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('stampIcon') stampIcon: ElementRef<HTMLElement>;

    pipetteCtx: CanvasRenderingContext2D;
    currentStamp: string = '../../../assets/Stamps/Poop Emoji.png';
    currentTexture: string = '../../../assets/b1.svg';
    constructor(private tools: ToolsManagerService, private pipetteService: PipetteService) {
        this.degreeValue = '0';
        this.leftStampFactorValue = 1;
        this.rightStampFactorValue = 1;
        this.onClick();
    }
    private showContainer: boolean = false;
    private lastTool: Tool = this.tools.currentTool;

    ngOnInit(): void {
        this.widthValue = this.tools.currentTool.lineWidth.toString();
    }
    onClick(): void {
        this.pipetteService.getColorObservable().subscribe((isPrimary: boolean) => {
            this.pickColor(isPrimary);
        });
    }
    toggleStampsList(): void {
        (this.tools.currentTool as StampService).getStampObs().next();
    }
    ngAfterViewChecked(): void {
        this.displayCircle();
    }
    setStampSize(value: number, isRightSide: boolean): void {
        isRightSide ? (this.rightStampFactorValue = value) : (this.leftStampFactorValue = value);
        (this.tools.currentTool as StampService).setStampSize(this.leftStampFactorValue, this.rightStampFactorValue);
    }
    displayCircle(): void {
        this.pipetteService.getCircleViewObservable().subscribe((isShown: boolean) => {
            this.circleIsShown = isShown;
        });
    }
    setDegree(degree: number) {
        degree %= 360;
        this.degreeValue = degree.toString(10);
        (this.tools.currentTool as StampService).setDegree(degree);
    }
    ngAfterViewInit(): void {
        this.pipetteService.getPipetteObservable().subscribe((arg: Arguments) => {
            this.pipetteCtx = this.pipetteCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.drawImage(arg);
            this.drawPixelContour();
        });
    }
    pickColor(isPrimary: boolean): void {
        const height = this.pipetteCanvas.nativeElement.height / 2;
        const width = this.pipetteCanvas.nativeElement.width / 2;
        const data = this.pipetteCtx.getImageData(width + 2, height + RECT_STROKE, 1, 1);
        this.tools.setColor('#' + this.pipetteService.rgbaToHex(this.pipetteService.getColorFromData(data)), isPrimary);
    }
    drawPixelContour(): void {
        const height = this.pipetteCanvas.nativeElement.height / 2;
        const width = this.pipetteCanvas.nativeElement.width / 2;
        this.pipetteCtx.beginPath();
        this.pipetteCtx.strokeStyle = 'red';
        this.pipetteCtx.strokeRect(width - 1, height + 1, RECT_SIZE, RECT_SIZE);
    }
    drawImage(arg: Arguments): void {
        const x = arg.event.offsetX;
        const y = arg.event.offsetY;
        this.pipetteCtx.clearRect(0, 0, this.pipetteCanvas.nativeElement.width, this.pipetteCanvas.nativeElement.height);
        this.pipetteCtx.imageSmoothingEnabled = false;
        this.pipetteCtx.imageSmoothingQuality = 'high';
        this.pipetteCtx.drawImage(
            arg.image,
            Math.abs(x - PIPETTE_IMAGE_OFFSET_X),
            Math.abs(y + PIPETTE_IMAGE_OFFSET_Y),
            PIPETTE_IMAGE_WIDTH,
            PIPETTE_IMAGE_HEIGHT,
            0,
            PIPETTE_IMAGE_OFFSET_Y,
            IMAGE_ZOOM,
            IMAGE_ZOOM,
        );
    }
    setFontStyle(style: MatButtonToggleChange): void {
        let tmpStyle = '';
        style.value.forEach((fontStyle: string) => {
            tmpStyle += fontStyle + ' ';
        });
        (this.tools.currentTool as TextService).setFontStyle(tmpStyle);
    }
    setAllignement(allignement: MatSelectChange): void {
        (this.tools.currentTool as TextService).setAllignement(allignement.value);
    }
    setFontFamily(fontFamily: MatSelectChange): void {
        (this.tools.currentTool as TextService).setFontText(fontFamily.value);
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
        const WIDTH_ALLOWED_CHARS_REGEXP = /\b[0-9]+\b/;
        const target = event.target as HTMLInputElement;
        if (target.selectionStart === 0 && this.checkIfContainAttribute('stamp')) {
            target.maxLength = event.key === '-' ? 4 : 3;
            return;
        }
        if (event.key !== 'Backspace' && event.key !== 'Enter' && !WIDTH_ALLOWED_CHARS_REGEXP.test(event.key)) {
            event.preventDefault();
        }
    }

    checkIfContainAttribute(attribute: string): boolean {
        if (this.lastTool !== this.tools.currentTool) {
            this.lastTool = this.tools.currentTool;
            this.restoreValues();
        }
        if (this.tools.currentTool instanceof StampService) {
            this.currentStamp = (this.tools.currentTool as StampService).image.src;
            this.degreeValue = (this.tools.currentTool as StampService).degres.toString(10);
        }
        return this.tools.currentTool.toolAttributes.includes(attribute);
    }

    setLineWidth(input: string): void {
        this.widthValue = input;
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
