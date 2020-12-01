/* tslint:disable */
import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Tool } from '@app/classes/tool';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { LineService } from '@app/services/tools/line/line.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SprayPaintService } from '@app/services/tools/spray-paint/spray-paint.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { MockUndoRedoService } from '../attributebar/attributebar.component.spec';
import { UserGuideComponent } from '../user-guide/user-guide.component';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let sprayPaintStub: SprayPaintService;
    let plumeStub: PlumeService;
    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let pipetteStub: PipetteService;
    let selectionStub: SelectionService;
    let drawServiceMock: MockDrawingService;
    let paintBucketStub: PaintBucketService;
    let UndoRedoServiceMock: MockUndoRedoService;
    let polygonStub: PolygonService;
    let textStub: TextService;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let gridStub:GridService;
    let magicWandStub: MagicWandService;

    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        pencilStub = new PencilService(drawServiceMock, UndoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, UndoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, UndoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, UndoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, UndoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, UndoRedoServiceMock);
        polygonStub = new PolygonService(drawServiceMock, UndoRedoServiceMock);
        pipetteStub = new PipetteService(drawServiceMock);
        plumeStub = new PlumeService(drawServiceMock, UndoRedoServiceMock);
        sprayPaintStub = new SprayPaintService(drawServiceMock, UndoRedoServiceMock);
        selectionStub = new SelectionService(drawServiceMock, UndoRedoServiceMock);
        textStub = new TextService(drawServiceMock);
        gridStub = new GridService(drawServiceMock);
        
        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub, selectionStub, paintBucketStub, polygonStub, pipetteStub, textStub, sprayPaintStub,plumeStub, gridStub, magicWandStub);
        toolManagerStub.currentTool = pencilStub;
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [
                { provide: ToolsManagerService, useValue: toolManagerStub },
                { provide: DrawingService, useValue: drawServiceMock },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ComponentFixtureAutoDetect, useValue: true },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
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
        window.confirm = jasmine.createSpy().and.returnValue(false);
        component.warningMessage();
        expect(window.confirm).toHaveBeenCalled();
    });

    it('should call restoreCanvasState when changeTools is called', () => {
        toolManagerStub.currentTool = toolManagerStub.getTools().get('pencil') as Tool;
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

    it('should open dialog if none was opened beforeHand when calling openDialog', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        component.openExportDialog();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should not open dialog if one was opened beforeHand when calling openDialog', () => {
        (matDialogSpy.openDialogs as any) = { length: 1 };
        component.openExportDialog();
        expect(matDialogSpy.open).not.toHaveBeenCalled();
    });

    it('should call selectAllCanvas when selectAll is called', () => {
        ((component as any).tools.currentTool as SelectionService).selectAllCanvas = jasmine.createSpy();
        component.selectAll();
        expect(((component as any).tools.currentTool as SelectionService).selectAllCanvas).toHaveBeenCalled();
    });

    it('if currentToolName does not change ngOnChanges should not call changeTools', () => {
        let changeToolsSpy = spyOn(component, 'changeTools');

        component.currentToolName = 'pencil';
        component.ngOnChanges({
            currentToolName: new SimpleChange(null, component.currentToolName, true)}
        );
        fixture.detectChanges();
        expect(changeToolsSpy).not.toHaveBeenCalled();
        expect(component.currentToolName).toBe('pencil');
    });
});
