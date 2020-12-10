import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSelectChange } from '@angular/material/select';
import { Const } from '@app/classes/constants';
import { Movable } from '@app/classes/movable';
import { Tool } from '@app/classes/tool';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { Arguments, PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-attributebar',
    templateUrl: './attribute-bar.component.html',
    styleUrls: ['./attribute-bar.component.scss'],
})
export class AttributeBarComponent implements OnInit, AfterViewChecked, AfterViewInit {
    static showStamps: boolean = false;
    widthValue: string;
    dropletsWidthValue: string;
    frequency: string;
    radius: string;
    lenghtValue: string;
    angleValue: string;
    junctionWidth: string;
    idStyleRectangle: number;
    idStyleBrush: number;
    degreeValue: string;
    tolerance: string;
    squareSize: string;
    opacity: string;
    leftStampFactorValue: number;
    rightStampFactorValue: number;
    selectedValue: string;
    polices: string[];
    circleIsShown: boolean;
    @ViewChild('pipette', { static: false }) pipetteCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('stampIcon') stampIcon: ElementRef<HTMLElement>;
    @ViewChild('a') a: ElementRef<HTMLElement>;

    pipetteCtx: CanvasRenderingContext2D;
    currentStamp: string = '../../../assets/Stamps/Poop Emoji.png';
    currentTexture: string = '../../../assets/b1.svg';
    subscription: Subscription;
    constructor(private tools: ToolsManagerService, private pipetteService: PipetteService, private plumeService: PlumeService) {
        this.degreeValue = '0';
        this.circleIsShown = true;
        this.dropletsWidthValue = '1';
        this.frequency = '700';
        this.radius = '20';
        this.lenghtValue = '50';
        this.angleValue = '0';
        this.junctionWidth = '1';
        this.idStyleRectangle = 2;
        this.idStyleBrush = 1;
        this.tolerance = '0';
        this.squareSize = '25';
        this.polices = ['Arial', 'Times New Roman', 'Tahoma', 'Verdana', 'Comic Sans MS, cursive'];
        this.opacity = '50';
        this.leftStampFactorValue = 1;
        this.rightStampFactorValue = 1;
        this.onClick();
    }
    private showContainer: boolean = false;
    private lastTool: Tool = this.tools.currentTool;

    ngOnInit(): void {
        this.widthValue = this.tools.currentTool.lineWidth.toString();
        this.subscription = this.plumeService.getMessage().subscribe((message: string) => {
            this.angleValue = message;
        });
    }

    onClick(): void {
        this.pipetteService.getColorObservable().subscribe((isPrimary: boolean) => {
            this.pickColor(isPrimary);
        });
    }
    toggleStampsList(): void {
        AttributeBarComponent.showStamps = !AttributeBarComponent.showStamps;
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
    setDegree(degree: number): void {
        degree %= Const.MAX_DEGREE;
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
    private pickColor(isPrimary: boolean): void {
        const height = this.pipetteCanvas.nativeElement.height / 2;
        const width = this.pipetteCanvas.nativeElement.width / 2;
        const data = this.pipetteCtx.getImageData(width + 2, height + Const.RECT_STROKE, 1, 1);
        this.tools.setColor('#' + this.pipetteService.rgbaToHex(this.pipetteService.getColorFromData(data)), isPrimary);
    }
    private drawPixelContour(): void {
        const height = this.pipetteCanvas.nativeElement.height / 2;
        const width = this.pipetteCanvas.nativeElement.width / 2;
        this.pipetteCtx.beginPath();
        this.pipetteCtx.strokeStyle = 'red';
        this.pipetteCtx.strokeRect(width - 1, height + 1, Const.RECT_SIZE, Const.RECT_SIZE);
    }
    private drawImage(arg: Arguments): void {
        const x = arg.event.offsetX;
        const y = arg.event.offsetY;
        this.pipetteCtx.clearRect(0, 0, this.pipetteCanvas.nativeElement.width, this.pipetteCanvas.nativeElement.height);
        this.pipetteCtx.imageSmoothingEnabled = false;
        this.pipetteCtx.imageSmoothingQuality = 'high';
        this.pipetteCtx.drawImage(
            arg.image,
            Math.abs(x - Const.PIPETTE_IMAGE_OFFSET_X),
            Math.abs(y + Const.PIPETTE_IMAGE_OFFSET_Y),
            Const.PIPETTE_IMAGE_WIDTH,
            Const.PIPETTE_IMAGE_HEIGHT,
            0,
            Const.PIPETTE_IMAGE_OFFSET_Y,
            Const.IMAGE_ZOOM,
            Const.IMAGE_ZOOM,
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
        if (event.ctrlKey) {
            event.preventDefault();
            return;
        }
        const WIDTH_ALLOWED_CHARS_REGEXP = /\b[0-9]+\b/;
        const target = event.target as HTMLInputElement;
        if (target.selectionStart === 0 && this.onToolChange('stamp') && target.id !== 'LeftSideInput' && target.id !== 'RightSideInput') {
            target.maxLength = event.key === '-' ? Const.MAX_INPUT_NEGATIVE_LENGTH : Const.MAX_INPUT_POSITIVE_LENGTH;
            return;
        }
        if (event.key !== 'Backspace' && event.key !== 'Enter' && !WIDTH_ALLOWED_CHARS_REGEXP.test(event.key)) {
            event.preventDefault();
        }
    }
    onToolChange(attribute: string): boolean {
        if (this.tools.currentTool instanceof GridService)
            (this.tools.currentTool as GridService).getSizeObservable().subscribe((squareSize: string) => {
                this.squareSize = squareSize;
            });
        if (this.lastTool !== this.tools.currentTool) {
            this.lastTool = this.tools.currentTool;
            this.restoreValues();
        }
        if (this.tools.currentTool instanceof StampService) {
            this.currentStamp = (this.tools.currentTool as StampService).image.src;
            this.degreeValue = (this.tools.currentTool as StampService).degres.toString(10);
        }
        const numberOfTools = document.querySelectorAll('#a').length;
        for (let i = 0; i < numberOfTools; i++) {
            document.querySelectorAll('#a')[i].classList.remove('active');
        }
        if (this.tools.currentTool instanceof SelectionService) {
            this.setSelectionClassName(this.tools.currentTool.selectionStyle === 0 ? '#rectSelection' : '#ellipseSelection');
        }
        if (this.tools.currentTool instanceof MagicWandService) {
            this.setSelectionClassName('#wandSelection');
        }
        return this.tools.currentTool.toolAttributes.includes(attribute);
    }
    private setSelectionClassName(selectionId: string): void {
        switch (selectionId) {
            case '#rectSelection':
                document.querySelector('#rectSelection')?.setAttribute('class', 'active');
                document.querySelector('#ellipseSelection')?.setAttribute('class', 'inactive');
                document.querySelector('#wandSelection')?.setAttribute('class', 'inactive');
                break;
            case '#ellipseSelection':
                document.querySelector('#ellipseSelection')?.setAttribute('class', 'active');
                document.querySelector('#wandSelection')?.setAttribute('class', 'inactive');
                document.querySelector('#rectSelection')?.setAttribute('class', 'inactive');
                break;
            case '#wandSelection':
                document.querySelector('#wandSelection')?.setAttribute('class', 'active');
                document.querySelector('#ellipseSelection')?.setAttribute('class', 'inactive');
                document.querySelector('#rectSelection')?.setAttribute('class', 'inactive');
                break;
        }
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
        if (Number(this.tolerance) > Const.MAX_WIDTH_VALUE) this.tolerance = '100';
        this.tools.setBucketTolerance(Number(this.tolerance));
    }
    setSquareSize(input: string): void {
        this.squareSize = input;
        if (Number(this.squareSize) > Const.MAX_WIDTH_VALUE) this.squareSize = '100';
        (this.tools.currentTool as GridService).changeSquareSize(Number(this.squareSize));
    }

    setOpacity(input: string): void {
        this.opacity = input;
        if (Number(this.opacity) > Const.MAX_WIDTH_VALUE) this.opacity = '100';
        (this.tools.currentTool as GridService).changeOpacity(Number(this.opacity));
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

    setDropletsWidth(input: string): void {
        this.dropletsWidthValue = input;
        if (Number(this.dropletsWidthValue) > Const.MAX_DROPLETS_WIDTH_VALUE) this.dropletsWidthValue = '10';
        this.tools.setDropletsWidth(Number(this.dropletsWidthValue));
    }

    setFrequency(input: string): void {
        this.frequency = input;
        if (Number(this.frequency) > Const.MAX_FREQUENCY_VALUE) this.frequency = '999';
        this.tools.setFrequency(Number(this.frequency));
    }

    setRadius(input: string): void {
        this.radius = input;
        if (Number(this.radius) > Const.MAX_FREQUENCY_VALUE) this.radius = '70';
        this.tools.setRadius(Number(this.radius));
    }

    setLineLength(id: string): void {
        this.lenghtValue = id;
        if (Number(this.lenghtValue) > Const.MAX_WIDTH_VALUE) this.lenghtValue = '100';
        const plume = this.tools.currentTool as PlumeService;
        plume.setLineLength(Number(this.lenghtValue));
    }

    setAngle(id: string): void {
        this.angleValue = id;
        const plume = this.tools.currentTool as PlumeService;
        plume.setAngle(Number(this.angleValue));
    }

    setLineWidth(input: string): void {
        this.widthValue = input;
        if (Number(this.widthValue) > Const.MAX_WIDTH_VALUE) this.widthValue = '100';
        this.tools.setLineWidth(Number(this.widthValue));
    }

    setAnchorPoint(anchorPoint: number): void {
        this.tools.setAnchorPoint(anchorPoint);
    }

    checkIfMagnetismActivated(): boolean {
        return Movable.magnetismActivated;
    }

    selectAll(): void {
        (this.tools.currentTool as SelectionService).selectionStyle = 0;
        (this.tools.currentTool as SelectionService).selectAllCanvas();
    }

    selectionRectangle(): void {
        (this.tools.currentTool as SelectionService).selectionStyle = 0;
    }

    selectionEllipse(): void {
        (this.tools.currentTool as SelectionService).selectionStyle = 1;
    }

    selectionMagicWand(): void {
        this.tools.setTools('magic-wand');
    }
}
