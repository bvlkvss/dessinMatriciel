/* tslint:disable */
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PencilCommand } from '@app/classes/pencil-command';
import { Tool } from '@app/classes/tool';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionClipboardService } from '@app/services/selection-clipboard/selection-clipboard.service';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
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
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { MockUndoRedoService } from '../attribute-bar/attribute-bar.component.spec';
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
    let gridStub: GridService;
    let magicWandStub: MagicWandService;
    let clipboardStub: SelectionClipboardService;

    let stampStub: StampService;
    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        clipboardStub = new SelectionClipboardService();
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
        textStub = new TextService(drawServiceMock, UndoRedoServiceMock);
        gridStub = new GridService(drawServiceMock);
        stampStub = new StampService(drawServiceMock, UndoRedoServiceMock);

        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub, selectionStub, paintBucketStub, polygonStub, pipetteStub, textStub, sprayPaintStub, plumeStub, gridStub, magicWandStub, stampStub);
        toolManagerStub.currentTool = pencilStub;
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [
                { provide: ToolsManagerService, useValue: toolManagerStub },
                { provide: DrawingService, useValue: drawServiceMock },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: UndoRedoService, useValue: UndoRedoServiceMock },
                { provide: SelectionClipboardService, useValue: clipboardStub },
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
    it('openCarousel should call dialog.open methode', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        component.openCarousel();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });
    it('openCarousel should not call dialog.open methode if another dialog is open', () => {
        (matDialogSpy.openDialogs as any) = { length: 1 };
        component.openCarousel();
        expect(matDialogSpy.open).not.toHaveBeenCalled();
    });
    it('undo should call undoLast', () => {
        let undoLastSpy = spyOn(UndoRedoServiceMock, 'undoLast');
        component.undo();
        expect(undoLastSpy).toHaveBeenCalled();
    });
    it('redo should call redoPrev', () => {
        let redoPrevSpy = spyOn(UndoRedoServiceMock, 'redoPrev');
        component.redo();
        expect(redoPrevSpy).toHaveBeenCalled();
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

    it('should call newDrawing when newDrawing is called and undostack is empty', () => {
        let newDrawingSpy = spyOn(drawServiceMock, 'newDrawing');
        (component as SidebarComponent).getInvoker().addToUndo(new PencilCommand([], pencilStub, drawServiceMock));
        component.newDrawing();
        expect(newDrawingSpy).toHaveBeenCalled();
    });

    it('should call onKeyDown of grid service with g as key ', () => {
        toolManagerStub.currentTool = gridStub;
        let keyDownSpy = spyOn(gridStub, 'onKeyDown').and.stub();
        spyOn(drawServiceMock, 'restoreCanvasState').and.stub();
        component.changeTools('grid');
        expect(keyDownSpy).toHaveBeenCalledWith({ key: 'g' });
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
    it('should set element to none if primaryColor given as attribute to toggleColorPalette and was block', () => {
        var dummyElement = document.createElement('div');
        dummyElement.id = 'primaryColorPicker';
        dummyElement.setAttribute('style', 'display:block');
        document.querySelector = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
        component.toggleColorPalette('primaryColorPicker');
        expect(dummyElement.style.display).toEqual('none');
    });
    it('should set element to none if not primaryColor given as attribute to toggleColorPalette and was block', () => {
        var dummyElement = document.createElement('div');
        dummyElement.id = 'dummyId';
        dummyElement.setAttribute('style', 'display:block');
        document.querySelector = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
        component.toggleColorPalette('dummyId');
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
    it('should open dialog if none was opened before when calling openDialog', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        component.openSavingDialog();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should not open dialog if one was opened before when calling openDialog', () => {
        (matDialogSpy.openDialogs as any) = { length: 1 };
        component.openSavingDialog();
        expect(matDialogSpy.open).not.toHaveBeenCalled();
    });
    it('should call selectAllCanvas when selectAll is called', () => {
        ((component as any).tools.currentTool as SelectionService).selectAllCanvas = jasmine.createSpy();
        component.selectAll();
        expect(((component as any).tools.currentTool as SelectionService).selectAllCanvas).toHaveBeenCalled();
    });
    it('should call openExportDialog and prevent default if key is e and ctrl', () => {
        const event = new KeyboardEvent('window:keydown', { key: 'e', ctrlKey: true });
        let preventSpy = spyOn(event, "preventDefault").and.stub();
        let openExportSpy = spyOn(component, "openExportDialog").and.stub();
        component.onkeyDownWindow(event)
        expect(openExportSpy).toHaveBeenCalled();
        expect(preventSpy).toHaveBeenCalled();

    });
    it('should call openSavingDialog and prevent default if key is s and ctrl', () => {
        const event = new KeyboardEvent('window:keydown', { key: 's', ctrlKey: true });
        let preventSpy = spyOn(event, "preventDefault").and.stub();
        let openSavingSpy = spyOn(component, "openSavingDialog").and.stub();
        component.onkeyDownWindow(event)
        expect(openSavingSpy).toHaveBeenCalled();
        expect(preventSpy).toHaveBeenCalled();

    });
    it('should call openCarousel and prevent default if key is g and ctrl', () => {
        const event = new KeyboardEvent('window:keydown', { key: 'g', ctrlKey: true });
        let preventSpy = spyOn(event, "preventDefault").and.stub();
        let openCarouselSpy = spyOn(component, "openCarousel").and.stub();
        component.onkeyDownWindow(event)
        expect(openCarouselSpy).toHaveBeenCalled();
        expect(preventSpy).toHaveBeenCalled();

    });
    it('should not call prevent default if ctrl was not pressed', () => {
        const event = new KeyboardEvent('window:keydown', { key: 'g', ctrlKey: false });
        let preventSpy = spyOn(event, "preventDefault").and.stub();
        component.onkeyDownWindow(event)
        expect(preventSpy).not.toHaveBeenCalled();

    });

    it('is should return value of invoker.getIsAllowed', () => {
        UndoRedoServiceMock.setIsAllowed(true);
        expect(component.undoRedoAllowed()).toEqual(true);
    });

    it('is should return value of invoker.getIsAllowed', () => {
        UndoRedoServiceMock.setIsAllowed(false);
        expect(component.undoRedoAllowed()).toEqual(false);
    });

    it('should call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('selection');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onCopy();
        expect(clipboardStub.onKeyDown).toHaveBeenCalled();
    });

    it('should call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('selection');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onCut();
        expect(clipboardStub.onKeyDown).toHaveBeenCalled();
    });

    it('should call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('selection');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onPaste();
        expect(clipboardStub.onKeyDown).toHaveBeenCalled();
    });

    it('should call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('selection');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onDelete();
        expect(clipboardStub.onKeyDown).toHaveBeenCalled();
    });

    it('should not call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('pencil');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onCopy();
        expect(clipboardStub.onKeyDown).not.toHaveBeenCalled();
    });

    it('should not call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('pencil');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onCopy();
        expect(clipboardStub.onKeyDown).not.toHaveBeenCalled();
    });


    it('should not call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('pencil');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onPaste();
        expect(clipboardStub.onKeyDown).not.toHaveBeenCalled();
    });

    it('should not call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('pencil');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onCut();
        expect(clipboardStub.onKeyDown).not.toHaveBeenCalled();
    });

    it('should not call on keydown of clipboard', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('pencil');
        clipboardStub.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onDelete();
        expect(clipboardStub.onKeyDown).not.toHaveBeenCalled();
    });

    it('should call undoLast', () => {
        (component as any).invoker.undoLast = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.undo();
        expect((component as any).invoker.undoLast).toHaveBeenCalled();
    });

    it('should call redoPrev', () => {
        (component as any).invoker.redoPrev = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.redo();
        expect((component as any).invoker.redoPrev).toHaveBeenCalled();
    });

});
