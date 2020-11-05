/* tslint:disable */
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { LineService } from '@app/services/tools/line/line.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { Arguments, PipetteService } from '@app/services/tools/pipette/pipette.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { AttributebarComponent } from './attributebar.component';
import { of } from 'rxjs';


export class MockUndoRedoService extends UndoRedoService {
    executeAll(): void {
        console.log("executeAll was Called");
    }
    ClearRedo(): void {
        console.log("clearRedo was called");
    }
}


describe('AttributebarComponent', () => {
    let component: AttributebarComponent;
    let mouseEvent: MouseEvent;
    let event: KeyboardEvent;
    let fixture: ComponentFixture<AttributebarComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let pipetteStub: PipetteService;

    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let paintBucketStub: PaintBucketService;
    let drawServiceMock: MockDrawingService;
    let selectionStub: SelectionService;
    let UndoRedoServiceMock: MockUndoRedoService;

    beforeEach(async(() => {
        mouseEvent = (new MouseEvent('click', { clientX: 5, clientY: 5 }));
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        pencilStub = new PencilService(drawServiceMock, UndoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, UndoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, UndoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, UndoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, UndoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, UndoRedoServiceMock);
        pipetteStub = new PipetteService(drawServiceMock);

        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub,paintBucketStub,selectionStub);
        TestBed.configureTestingModule({
            declarations: [AttributebarComponent],
            providers: [{ provide: ToolsManagerService, useValue: toolManagerStub }, { provide: PipetteService, useValue: pipetteStub }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributebarComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
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
        component.setJunctionWidth("6");
        expect(junctionWidthSpy).toHaveBeenCalled();
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
    /*   it('onMouseOut should  change  this.circleIsShown to false  ', () => {
   
           fixture.detectChanges();
           pipetteStub.onMouseOut(event);
           expect(component.circleIsShown).toEqual(false);
       });*/
    it(' pickColor should call toolManager"s setColor    ', () => {
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        component.pipetteCtx = component.pipetteCanvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        let spy = spyOn<any>(toolManagerStub, 'setColor').and.callThrough();
        component.pickColor(true);
        expect(spy).toHaveBeenCalled();
    });
    it('validate should call preventDefault if  an unallowed key was pressed ', () => {
        event = new KeyboardEvent("keydown", { key: "-" });
        let spy = spyOn<any>(event, 'preventDefault').and.callThrough();
        component.validate(event);
        expect(spy).toHaveBeenCalled();

    });
    it('validate should not  call preventDefault if  an allowed key was pressed ', () => {
        event = new KeyboardEvent("keydown", { key: "0" });
        let spy = spyOn<any>(event, 'preventDefault').and.callThrough();
        component.validate(event);
        expect(spy).not.toHaveBeenCalled();

    });
    it('colorObservale should trigger with the right value ', () => {
        spyOn<any>(pipetteStub, 'getColorObservable').and.returnValue(of(true));
        pipetteStub.getColorObservable().subscribe((isPrime) => {
            expect(isPrime).toEqual(true);
        })

    });
    it('onClick should call pickColor  ', () => {
        let observerSpy = spyOn<any>(pipetteStub, 'getColorObservable').and.returnValue(of(false));
        let spy = spyOn<any>(component, 'pickColor').and.callThrough();
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

        const arg: Arguments = { image: new Image(), event: mouseEvent }
        let canvas: HTMLCanvasElement = document.createElement("canvas");
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
        const arg: Arguments = { image: new Image(), event: mouseEvent }
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        component.pipetteCtx = component.pipetteCanvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        const drawImageSpy = spyOn(component.pipetteCtx, 'drawImage').and.callThrough();
        const clearRectSpy = spyOn(component.pipetteCtx, 'clearRect').and.callThrough();
        component.drawImage(arg);
        expect(drawImageSpy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalled();

    });
    it('drawPixelContour should   call strokeRect of pipetteCtx and change the rectStyle to red  ', () => {
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        component.pipetteCanvas = new ElementRef<HTMLCanvasElement>(canvas);
        component.pipetteCtx = component.pipetteCanvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        const beginPathSpy = spyOn(component.pipetteCtx, 'beginPath').and.callThrough();
        const strokeSpy = spyOn(component.pipetteCtx, 'strokeRect').and.callThrough();
        component.drawPixelContour();
        expect(component.pipetteCtx.strokeStyle).toEqual("#ff0000");
        expect(beginPathSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();



    });
});
