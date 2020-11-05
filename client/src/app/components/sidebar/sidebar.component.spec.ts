/* tslint:disable */
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { MockUndoRedoService } from '../attributebar/attributebar.component.spec';
import { UserGuideComponent } from '../user-guide/user-guide.component';
import { MatDialog } from '@angular/material/dialog';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let pipetteStub: PipetteService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let selectionStub: SelectionService;
    let paintBucketStub: PaintBucketService;
    let UndoRedoServiceMock: MockUndoRedoService;
    //let paintBucketStub: PaintBucketService;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    // let drawImageSpy: jasmine.SpyObj<any>;
    let drawServiceMock: MockDrawingService;

    beforeEach(async(() => {
        //   pipetteObservableStub = new Subject<Arguments>();
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        pencilStub = new PencilService(drawServiceMock, UndoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, UndoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, UndoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, UndoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, UndoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, UndoRedoServiceMock);
        pipetteStub = new PipetteService(drawServiceMock);
        selectionStub = new SelectionService(drawServiceMock, UndoRedoServiceMock);
        toolManagerStub = new ToolsManagerService(
            pencilStub,
            brushStub,
            rectangleStub,
            eraserStub,
            ellipseStub,
            lineStub,
            paintBucketStub,
            selectionStub,
            pipetteStub,
        );
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [
                { provide: ToolsManagerService, useValue: toolManagerStub },
                { provide: DrawingService, useValue: drawServiceMock },
                //   { provide: PipetteService, useValue: pipetteSpy },
                { provide: ComponentFixtureAutoDetect, useValue: true },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        drawServiceMock.canvas = canvasStub;
        drawServiceMock.baseCtx = baseCtxStub;
        drawServiceMock.canvas.width = canvasStub.width;
        drawServiceMock.canvas.height = canvasStub.height;
        drawServiceMock.baseCtx.canvas.width = baseCtxStub.canvas.width;
        drawServiceMock.baseCtx.canvas.height = baseCtxStub.canvas.height;
        //  drawImageSpy = spyOn<any>(component, 'drawImage').and.callThrough();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call togglecanvas when displayPalette is called and set attribute bar to true', () => {
        component.attributeBarIsActive = false;
        let togglecanvasSpy = spyOn(component, 'togglecanvas');
        component.displayPalette('brush');
        expect(component.attributeBarIsActive).toEqual(true);
        expect(togglecanvasSpy).toHaveBeenCalled();
    });

    it('should call togglecanvas when displayPalette is called and set attribute bar to false if currentTool is given name', () => {
        component.attributeBarIsActive = true;
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        let togglecanvasSpy = spyOn(component, 'togglecanvas');
        component.displayPalette('brush');
        expect(component.attributeBarIsActive).toEqual(false);
        expect(togglecanvasSpy).toHaveBeenCalled();
    });

    it('should not call togglecanvas when displayPalette is called and  attribute bar is false if currentTool is not given name', () => {
        component.attributeBarIsActive = true;
        (component as any).tools.currentTool = (component as any).tools.getTools().get('rectangle');
        let togglecanvasSpy = spyOn(component, 'togglecanvas');
        component.displayPalette('brush');
        expect(component.attributeBarIsActive).toEqual(true);
        expect(togglecanvasSpy).not.toHaveBeenCalled();
    });

    it('should call displayUserGuide when openUserGuide is called', () => {
        let displayUserGuideSpy = spyOn(UserGuideComponent, 'displayUserGuide');
        component.openUserGuide();
        expect(displayUserGuideSpy).toHaveBeenCalled();
    });

    it('should call newDrawing when newDrawing is called', () => {
        let newDrawingSpy = spyOn(drawServiceMock, 'newDrawing');
        component.newDrawing();
        expect(newDrawingSpy).toHaveBeenCalled();
    });

    it('should  call confirm if user doesn"t confirm warning message', () => {
        let confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
        component.warningMessage();
        expect(confirmSpy).toHaveBeenCalled();
    });

    it('should call restoreCanvasState when changeTools is called', () => {
        let restoreCanvasStateSpy = spyOn(drawServiceMock, 'restoreCanvasState');
        component.changeTools('brush');
        expect(restoreCanvasStateSpy).toHaveBeenCalled();
    });

    it('should set element to none if primaryColor was not given as attribute to toggleColorPalette', () => {
        var dummyElement = document.createElement('div');
        dummyElement.id = 'primaryColorPicker';
        document.querySelector = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
        component.toggleColorPalette('dummyPalette');
        expect(dummyElement.style.display).toEqual('none');
    });

    it('should set element to none if primaryColor was  given as attribute to toggleColorPalette', () => {
        var dummyElement = document.createElement('div');
        dummyElement.id = 'primaryColorPicker';
        document.querySelector = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
        component.toggleColorPalette('primaryColorPicker');
        expect(dummyElement.style.display).toEqual('none');
    });

    it('should set class name when togglecanvas is called', () => {
        var dummyElement = document.createElement('div');
        document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
        component.togglecanvas('dummyClassName');
        expect(dummyElement.className).toEqual('dummyClassName');
    });

    it('should set primaryColor to secondaryColor when revertColor is called', () => {
        toolManagerStub.currentTool.primaryColor = '#aabbccdd';
        toolManagerStub.currentTool.secondaryColor = '#bbaabbaa';
        component.revertColors();
        expect(toolManagerStub.currentTool.primaryColor).toEqual('#bbaabbaa');
    });
});
