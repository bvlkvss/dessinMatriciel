/* tslint:disable */
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { LineService } from '@app/services/tools/line/line.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { Arguments, PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SprayPaintService } from '@app/services/tools/spray-paint/spray-paint.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { AttributeBarComponent } from './attributebar.component';

export class MockUndoRedoService extends UndoRedoService {
    executeAll(): void {
        console.log('executeAll was Called');
    }
    ClearRedo(): void {
        console.log('clearRedo was called');
    }
}

describe('AttributebarComponent', () => {
    let component: AttributeBarComponent;
    let mouseEvent: MouseEvent;
    let event: KeyboardEvent;
    let fixture: ComponentFixture<AttributeBarComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let pipetteStub: PipetteService;
    let plumeStub: PlumeService
    let sprayPaintStub: SprayPaintService;

    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let paintBucketStub: PaintBucketService;
    let drawServiceMock: MockDrawingService;
    let selectionStub: SelectionService;
    let polygonStub: PolygonService;
    let UndoRedoServiceMock: MockUndoRedoService;
    let textStub: TextService;
    let gridStub: GridService;
    let magicWandStub: MagicWandService;

    beforeEach(async(() => {
        mouseEvent = new MouseEvent('click', { clientX: 5, clientY: 5 });
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        polygonStub = new PolygonService(drawServiceMock, UndoRedoServiceMock);
        pencilStub = new PencilService(drawServiceMock, UndoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, UndoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, UndoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, UndoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, UndoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, UndoRedoServiceMock);
        pipetteStub = new PipetteService(drawServiceMock);
        textStub = new TextService(drawServiceMock);
        plumeStub = new PlumeService(drawServiceMock, UndoRedoServiceMock);
        sprayPaintStub = new SprayPaintService(drawServiceMock, UndoRedoServiceMock);
        gridStub = new GridService(drawServiceMock);

        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub, selectionStub, paintBucketStub, polygonStub, pipetteStub, textStub, sprayPaintStub, plumeStub, gridStub, magicWandStub);
        toolManagerStub.currentTool = pencilStub;
        TestBed.configureTestingModule({
            declarations: [AttributeBarComponent, MatButtonToggleGroup],
            providers: [{ provide: ToolsManagerService, useValue: toolManagerStub }, { provide: PipetteService, useValue: pipetteStub }],
            imports: [MatButtonToggleModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributeBarComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        console.log(pencilStub.lineWidth);
        console.log((component as any).tools);
        expect(component).toBeTruthy();
    });

    it('should call getComputedStyle when calling change Style if both id are correct', () => {
        let style_ = { borderColor: 'blue', backgroundColor: 'blue', borderStyle: 'dashed', borderWidth: '2' } as any;
        let element = { style: style_ } as HTMLElement;
        let currenttStyle = 'style0';
        let nextStyle = 1;
        let getComputedStyleSpy = spyOn(window, 'getComputedStyle').and.returnValue(style_);
        let querySelectorSpy = spyOn(document, 'querySelector').and.returnValue(element);
        component.changeStyle(currenttStyle, nextStyle);
        expect(querySelectorSpy).toHaveBeenCalled();
        expect(getComputedStyleSpy).toHaveBeenCalled();
    });

    it('should not call getComputedStyle when calling change Style if both id are not correct', () => {
        let currenttStyle = 'badStyle';
        let nextStyle = 101;
        let getComputedStyleSpy = spyOn(window, 'getComputedStyle');

        component.changeStyle(currenttStyle, nextStyle);

        expect(getComputedStyleSpy).not.toHaveBeenCalled();
    });

    it('should set widthValue when calling restoreValues if tool has lineWidth', () => {
        (component as any).tools.currentTool.lineWidth = 6;
        component.restoreValues();
        expect(component.widthValue).toEqual('6');
    });

    it('should call restoreValues when calling checkIfContainAttributes if lastTool is not the same as currentTool', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        (component as any).lastTool = (component as any).tools.getTools().get('ellipse');

        let restoreValuesSpy = spyOn(component, 'restoreValues');

        component.checkIfContainAttribute('lineWidth');

        expect(restoreValuesSpy).toHaveBeenCalled();
    });

    it('should not call restoreValues when calling checkIfContainAttributes if lastTool is the same as currentTool', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        (component as any).lastTool = (component as any).tools.getTools().get('brush');

        let restoreValuesSpy = spyOn(component, 'restoreValues');

        component.checkIfContainAttribute('lineWidth');

        expect(restoreValuesSpy).not.toHaveBeenCalled();
    });

    it('should set widthValue when calling setLineWidth', () => {
        component.setLineWidth('6');

        expect(component.widthValue).toEqual('6');
    });

    it('should call toolManager"s setjunctionWidth when calling setJunctionWidth', () => {
        let junctionWidthSpy = spyOn(toolManagerStub, 'setJunctionWidth');
        component.setJunctionWidth('6');
        expect(junctionWidthSpy).toHaveBeenCalled();
    });
    it('should call prevent if an not accepted key is pressed', () => {
        event = new KeyboardEvent('keydown', { key: '@' });
        let eventSpy = spyOn<any>(event, 'preventDefault').and.callThrough();
        component.validate(event);
        expect(eventSpy).toHaveBeenCalled();
    });

    it('should call toolManager"s setjunctionState when calling setJunctionState', () => {
        let junctionStateSpy = spyOn(toolManagerStub, 'setJunctionState');
        component.setJunctionState(true);
        expect(junctionStateSpy).toHaveBeenCalled();
    });

    it('should set currentTexture to given value when setTexture is called', () => {
        (toolManagerStub.currentTool as BrushService).setTexture = jasmine.createSpy('setTexture');
        component.setTexture(5);
        expect(component.currentTexture).toContain('b5.svg');
    });

    it('should call change style with ellipse as argument when calling setShapeStyle and isEllipse is true', () => {
        let changeStyleSpy = spyOn(component, 'changeStyle');
        (toolManagerStub.currentTool as EllipseService).setStyle = jasmine.createSpy();
        let idStyle = 1;
        component.setShapeStyle(idStyle, true);
        expect(changeStyleSpy).toHaveBeenCalledWith('currentEllipseStyle', idStyle);
        expect(component.idStyleRectangle).toEqual(idStyle);
    });

    it('should call change style with rectangle as argument when calling setShapeStyle and isEllipse is false', () => {
        let changeStyleSpy = spyOn(component, 'changeStyle');
        let idStyle = 1;
        (toolManagerStub.currentTool as RectangleService).setStyle = jasmine.createSpy();
        component.setShapeStyle(idStyle, false);
        expect(changeStyleSpy).toHaveBeenCalledWith('currentRectangleStyle', idStyle);
        expect(component.idStyleRectangle).toEqual(idStyle);
    });

    it('should call setBucketTolerance when calling setTolerance', () => {
        let setBucketToleranceSpy = spyOn(toolManagerStub, 'setBucketTolerance');
        component.setTolerance('40');
        expect(setBucketToleranceSpy).toHaveBeenCalled();
    });

    it('should call querySelector when toggleList is called', () => {
        let child = { innerHTML: 'sss' } as any;
        let sibling = { innerHTML: 'sss', lastChild: child } as any;
        let _style = { display: 'block' };
        let querySelectorSpy = spyOn(document, 'querySelector').and.returnValue({ id: '3', style: _style, previousSibling: sibling } as HTMLElement);
        component.toggleList('5');
        expect(querySelectorSpy).toHaveBeenCalled();
    });

    it('should change display to none when toggleList is called and showContainer was false', () => {
        let child = { innerHTML: 'sss' } as any;
        let sibling = { innerHTML: 'sss', lastChild: child } as any;
        let _style = { display: 'block' };
        let querySelectorSpy = spyOn(document, 'querySelector').and.returnValue({ id: '3', style: _style, previousSibling: sibling } as HTMLElement);
        (component as any).showContainer = true;
        component.toggleList('5');
        expect(querySelectorSpy).toHaveBeenCalled();
    });
    it(' pickColor should call toolManager"s setColor    ', () => {
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        component.pipetteCtx = component.pipetteCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        let spy = spyOn<any>(toolManagerStub, 'setColor').and.stub();
        component.pickColor(true);
        expect(spy).toHaveBeenCalled();
    });
    it('validate should call preventDefault if  an unallowed key was pressed ', () => {
        event = new KeyboardEvent('keydown', { key: '-' });
        let spy = spyOn<any>(event, 'preventDefault').and.callThrough();
        component.validate(event);
        expect(spy).toHaveBeenCalled();
    });
    it('validate should not  call preventDefault if  an allowed key was pressed ', () => {
        event = new KeyboardEvent('keydown', { key: '0' });
        let spy = spyOn<any>(event, 'preventDefault').and.callThrough();
        component.validate(event);
        expect(spy).not.toHaveBeenCalled();
    });
    it('colorObservale should trigger with the right value ', () => {
        spyOn<any>(pipetteStub, 'getColorObservable').and.returnValue(of(true));
        pipetteStub.getColorObservable().subscribe((isPrime) => {
            expect(isPrime).toEqual(true);
        });
    });
    it('onClick should call pickColor  ', () => {
        let observerSpy = spyOn<any>(pipetteStub, 'getColorObservable').and.returnValue(of(false));
        let spy = spyOn<any>(component, 'pickColor').and.stub();
        component.onClick();
        expect(spy).toHaveBeenCalled();
        expect(observerSpy).toHaveBeenCalled();

    });
    it('DisplayCircle should set circleIsShown to the right value  ', () => {
        let observerSpy = spyOn<any>(pipetteStub, 'getCircleViewObservable').and.returnValue(of(false));
        component.displayCircle();
        expect(observerSpy).toHaveBeenCalled();
        expect(component.circleIsShown).toEqual(false);
    });

    it('ngAfterViewInit should call drawImage and drawPixelContour  ', () => {
        const arg: Arguments = { image: new Image(), event: mouseEvent };
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        const observerSpy = spyOn<any>(pipetteStub, 'getPipetteObservable').and.returnValue(of(arg));
        const drawImageSpy = spyOn(component, 'drawImage').and.stub();
        const drawPixelSpy = spyOn(component, 'drawPixelContour').and.stub();
        component.ngAfterViewInit();
        expect(observerSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(drawPixelSpy).toHaveBeenCalled();
    });
    it('drawImage should  should call drawImage and clearReact of pipetteCtx  ', () => {
        const arg: Arguments = { image: new Image(), event: mouseEvent };
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        component.pipetteCtx = component.pipetteCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy = spyOn(component.pipetteCtx, 'drawImage').and.callThrough();
        const clearRectSpy = spyOn(component.pipetteCtx, 'clearRect').and.callThrough();
        component.drawImage(arg);
        expect(drawImageSpy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalled();
    });
    it('drawPixelContour should   call strokeRect of pipetteCtx and change the rectStyle to red  ', () => {
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        component.pipetteCtx = component.pipetteCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const beginPathSpy = spyOn(component.pipetteCtx, 'beginPath').and.callThrough();
        const strokeSpy = spyOn(component.pipetteCtx, 'strokeRect').and.callThrough();
        component.drawPixelContour();
        expect(component.pipetteCtx.strokeStyle).toEqual('#ff0000');
        expect(beginPathSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('should set lenghtValue to given value when setlignLenght is called', () => {
        (toolManagerStub.currentTool as PlumeService).setLineLength = jasmine.createSpy('setLineLength');
        component.setLineLength('5');
        expect(component.lenghtValue).toEqual('5');
    });

    it('should call changeOpacity when setOpacity is called', () => {
        (toolManagerStub.currentTool as GridService).changeOpacity = jasmine.createSpy();
        component.setOpacity('102');
        expect((toolManagerStub.currentTool as GridService).changeOpacity).toHaveBeenCalled();
    });

    it('should call changeSquareSize when setSquareSize is called', () => {
        (toolManagerStub.currentTool as GridService).changeSquareSize = jasmine.createSpy();
        component.setSquareSize('102');
        expect((toolManagerStub.currentTool as GridService).changeSquareSize).toHaveBeenCalled();
    });

    it('should set angleValue to given value when setAngle is called', () => {
        (toolManagerStub.currentTool as PlumeService).setAngle = jasmine.createSpy('setangle');
        component.setAngle('5');
        expect(component.angleValue).toEqual('5');
    });

    it('should set Droplets Width to given value when setDropletsWidth is called', () => {
        (toolManagerStub.currentTool as SprayPaintService).setDropletsWidth = jasmine.createSpy('setDropletsWidth');
        component.setDropletsWidth('5');
        expect(component.dropletsWidthValue).toEqual('5');
    });

    it('should set frequency Width to given value when setfrequency is called', () => {
        (toolManagerStub.currentTool as SprayPaintService).setfrequency = jasmine.createSpy('setfrequency');
        component.setFrequency('5');
        expect(component.frequency).toEqual('5');
    });

    it('should set radius Width to given value when setradius is called', () => {
        (toolManagerStub.currentTool as SprayPaintService).setRadius = jasmine.createSpy('setRadius');
        component.setRadius('5');
        expect(component.radius).toEqual('5');
    });

});
