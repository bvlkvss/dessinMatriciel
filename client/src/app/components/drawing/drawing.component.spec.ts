/* tslint:disable */
import { Target } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PencilCommand } from '@app/classes/pencil-command';
import { Tool } from '@app/classes/tool';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
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
import { MockUndoRedoService } from '../attribute-bar/attribute-bar.component.spec';

export class MockDrawingService extends DrawingService {
    resizeCanvas(): void {
    }
    restoreCanvasState() {
    }
}

class MockResizingService extends ResizingService {
    initResizing(event: MouseEvent) {
    }
}

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let plumeStub: PlumeService;
    let sprayPaintStub: SprayPaintService;
    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let paintBucketStub: PaintBucketService;
    let pipetteStub: PipetteService;
    let drawServiceMock: MockDrawingService;
    let selectionStub: SelectionService;
    let undoRedoServiceMock: MockUndoRedoService;
    let resizingServiceMock: MockResizingService;
    let polygonStub: PolygonService;
    let textStub: TextService;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let gridStub;
    let magicWandStub: MagicWandService;


    let stampStub: StampService;
    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        undoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        resizingServiceMock = new MockResizingService(drawServiceMock, undoRedoServiceMock);
        pencilStub = new PencilService(drawServiceMock, undoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, undoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, undoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, undoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, undoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, undoRedoServiceMock);
        pipetteStub = new PipetteService(drawServiceMock);
        selectionStub = new SelectionService(drawServiceMock, undoRedoServiceMock);
        polygonStub = new PolygonService(drawServiceMock, undoRedoServiceMock);
        textStub = new TextService(drawServiceMock, undoRedoServiceMock);
        plumeStub = new PlumeService(drawServiceMock, undoRedoServiceMock);
        sprayPaintStub = new SprayPaintService(drawServiceMock, undoRedoServiceMock);
        gridStub = new GridService(drawServiceMock);
        stampStub = new StampService(drawServiceMock, undoRedoServiceMock);

        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub, selectionStub, paintBucketStub, polygonStub, pipetteStub, textStub, sprayPaintStub, plumeStub, gridStub, magicWandStub, stampStub);
        toolManagerStub.currentTool = toolManagerStub.getTools().get('pencil') as Tool;
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: DrawingService, useValue: drawServiceMock },
                { provide: ToolsManagerService, useValue: toolManagerStub },
                { provide: ResizingService, useValue: resizingServiceMock },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        }).compileComponents();
        (matDialogSpy as any).openDialogs = [] as any;
    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get stubTool', () => {
        const currentTool = toolManagerStub.getTools();
        expect(currentTool).toEqual(toolManagerStub.getTools());
    });

    it(" should call the tool's mouse down when receiving a mouse down event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolManagerStub.currentTool, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse up when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolManagerStub.currentTool, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse dblClick when receiving a mouse dblClick event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolManagerStub.currentTool, 'onDblClick').and.callThrough();
        component.onDblClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse click when receiving a mouse click event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolManagerStub.currentTool, 'onClick').and.callThrough();
        component.onClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse out when receiving a mouse out event", () => {
        let target_ = { className: 'target' };
        let event = { target: target_ } as any;
        let onMouseOutSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseOut').and.callThrough();
        component.onMouseOut(event);
        expect(onMouseOutSpy).toHaveBeenCalled();
        expect(onMouseOutSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's key up when receiving a key up event", () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = {} as KeyboardEvent;
        const KeyboardEventSpy = spyOn(toolManagerStub.currentTool, 'onKeyUp').and.callThrough();
        component.onKeyUp(event);
        expect(KeyboardEventSpy).toHaveBeenCalled();
        expect(KeyboardEventSpy).toHaveBeenCalledWith(event);
    });

    it('on key w pressed current tool should change to brush ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: 'w',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('brush') as Tool);
    });

    it('on keyDownWindow should not call keyDown if it is input ', () => {
        let target_ = { className: 'textInput' };
        let event = {
            key: 'w',
            target: target_ as Target
        } as KeyboardEvent;
        component.onKeyDown = jasmine.createSpy();
        component.onkeyDownWindow(event);
        expect(component.onKeyDown).not.toHaveBeenCalled();
    });

    it('on keyDownWindow should call keyDown if it is not input ', () => {
        let target_ = { className: 'notInput' };
        let event = {
            key: 'g',
            target: target_ as Target
        } as KeyboardEvent;
        component.onKeyDown = jasmine.createSpy();
        component.onkeyDownWindow(event);
        expect(component.onKeyDown).toHaveBeenCalled();
    });

    it('on key e pressed current tool should change to eraser ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: 'e',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('eraser') as Tool);
    });

    it('on key c pressed current tool should change to pencil ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: 'c',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('pencil') as Tool);
    });

    it('on key 1 pressed current tool should change to rectangle ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: '1',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('rectangle') as Tool);
    });

    it('on key 2 pressed current tool should change to ellipse ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: '2',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('ellipse') as Tool);
    });
    it('on key l pressed current tool should change to line ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: 'l',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('line') as Tool);
    });

    it('on key 3 pressed current tool should change to polygon ', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: '3',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('polygon') as Tool);
    });

    it('on another key down, current tool should call tool on key down', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
        });
        const KeyboardEventSpy = spyOn(toolManagerStub.currentTool, 'onKeyDown').and.callThrough();
        component.onKeyDown(event);
        expect(KeyboardEventSpy).toHaveBeenCalled();
        expect(KeyboardEventSpy).toHaveBeenCalledWith(event);
    });

    it('should call initResizing when initResizing is called', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let initResizingSpy = spyOn<any>(resizingServiceMock, 'initResizing');
        component.initResizing(event);
        expect(initResizingSpy).toHaveBeenCalled();
    });

    it('should call resize when resize is called and resize is true', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let resizeSpy = spyOn<any>(resizingServiceMock, 'resize');
        resizingServiceMock.resizing = true;
        component.resize(event);
        expect(resizeSpy).toHaveBeenCalled();
    });

    it('should not call resize when resize is called and resize is false', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let resizeSpy = spyOn<any>(resizingServiceMock, 'resize');
        resizingServiceMock.resizing = false;
        component.resize(event);
        expect(resizeSpy).not.toHaveBeenCalled();
    });

    it('should  call stopResize when stopResizing is called and resize is true', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let stopResizingSpy = spyOn<any>(resizingServiceMock, 'stopResize');
        resizingServiceMock.resizing = true;
        component.stopResize(event);
        expect(stopResizingSpy).toHaveBeenCalled();
    });

    it('should not call stopResize when stopResizing is called and resize is false', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let stopResizingSpy = spyOn<any>(resizingServiceMock, 'stopResize');
        resizingServiceMock.resizing = false;
        component.stopResize(event);
        expect(stopResizingSpy).not.toHaveBeenCalled();
    });

    it('should call tool.onMouseMove when onMouseMove is called', () => {
        let target_ = { className: 'target' };
        let event = { target: target_ } as any;
        let onMouseMoveSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseMove');
        component.onMouseMove(event);
        expect(onMouseMoveSpy).toHaveBeenCalled();
    });

    it('should not call tool.onMouseMove when onMouseMove is called if resizing', () => {
        let target_ = { className: 'resizer right' };
        let event = { target: target_ } as any;
        let onMouseMoveSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseMove');
        component.onMouseMove(event);
        expect(onMouseMoveSpy).not.toHaveBeenCalled();
    });

    it('should call tool.onMouseDown when onMouseDown is called ', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let onMouseDownSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseDown');
        component.onMouseDown(event);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });
    it('should call tool.onRightClick when onRightClick is called ', () => {
        const event = new MouseEvent('contextmenu');
        let onRightClickSpy = spyOn<any>((component as any).tools.currentTool, 'onRightClick');
        let eventSpy = spyOn<any>(event, 'preventDefault');
        component.onRightClick(event);
        expect(eventSpy).toHaveBeenCalled();
        expect(onRightClickSpy).toHaveBeenCalledWith(event);

    });

    it('should not call tool.onMouseEnter when onMouseEnter is called if resizing is true ', () => {
        let target_ = { className: 'resizer right' };
        let event = { target: target_ } as any;
        let onMouseEnterSpy = spyOn<any>(toolManagerStub.currentTool, 'onMouseEnter').and.callThrough();
        component.onMouseEnter(event);
        expect(onMouseEnterSpy).not.toHaveBeenCalled();
    });

    it('should call tool.onMouseEnter when onMouseEnter is called if resizing is false ', () => {
        let target_ = { className: 'not resize' };
        let event = { target: target_ } as any;
        let onMouseEnterSpy = spyOn<any>(toolManagerStub.currentTool, 'onMouseEnter').and.callThrough();
        component.onMouseEnter(event);
        expect(onMouseEnterSpy).toHaveBeenCalled();
    });

    it('should call tool.onDblClick when onDblClick is called  ', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let onDblClickSpy = spyOn<any>((component as any).tools.currentTool, 'onDblClick');
        component.onDblClick(event);
        expect(onDblClickSpy).toHaveBeenCalled();
    });

    it('should call tool.onClick when onClick is called and mouseFired is false ', () => {
        let event = {} as MouseEvent;
        let onClickSpy = spyOn<any>(toolManagerStub.currentTool, 'onClick');
        (component as any).mouseFired = false;
        component.onClick(event);
        expect(onClickSpy).toHaveBeenCalled();
    });

    it('should not call tool.onClick when onClick is called and mouseFired is true ', () => {
        let event = {} as MouseEvent;
        let onClickSpy = spyOn<any>(toolManagerStub.currentTool, 'onClick');
        (component as any).mouseFired = true;
        component.onClick(event);
        expect(onClickSpy).not.toHaveBeenCalled();
    });
    it('should call set mouseFired to false is resizer is maximased ', () => {
        let event = {} as MouseEvent;
        component['resizer'] = resizingServiceMock;
        component['resizer'].isMaximazed = true;
        (component as any).mouseFired = true;
        let onMouseUpSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseUp');
        component.onMouseUp(event);
        expect(component['mouseFired']).toEqual(false);
        expect(onMouseUpSpy).toHaveBeenCalled();
    });
    it('should call tool.onMouseUp when onMouseUp is called ', () => {
        let event = {} as MouseEvent;
        event = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        let onMouseUpSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseUp');

        component.onMouseUp(event);
        expect(onMouseUpSpy).toHaveBeenCalled();
    });

    it('should not call tool.onMouseUp when onMouseUp is called if mouseFired is true ', () => {
        let event = {} as MouseEvent;
        let onMouseUpSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseUp');
        (component as any).mouseFired = true;
        component.onMouseUp(event);
        expect(onMouseUpSpy).not.toHaveBeenCalled();
    });

    it('should not call tool.onMouseOut when onMouseOut is called and resizing is true ', () => {
        let target_ = { className: 'resizer right' };
        let event = { target: target_ } as any;
        let onMouseOutSpy = spyOn<any>((component as any).tools.currentTool, 'onMouseOut').and.callThrough();
        component.onMouseOut(event);
        expect(onMouseOutSpy).not.toHaveBeenCalled();
    });

    it('should call tool.onKeyUp when onKeyUp', () => {
        (matDialogSpy.openDialogs as any) = { length: 0 };
        let event = {} as KeyboardEvent;
        let onKeyUpSpy = spyOn<any>((component as any).tools.currentTool, 'onKeyUp');
        resizingServiceMock.resizing = true;
        component.onKeyUp(event);
        expect(onKeyUpSpy).toHaveBeenCalled();
    });

    it('should call newDrawing when ctrl-O is pressed', () => {
        (component as any).invoker.addToUndo(new PencilCommand([], pencilStub, drawServiceMock));
        let event = {
            key: 'o',
            ctrlKey: true,
            target: { className: 'no' } as Target,
            preventDefault: jasmine.createSpy() as any,
            stopPropagation: jasmine.createSpy() as any,
        } as KeyboardEvent;
        let newDrawingSpy = spyOn<any>(drawServiceMock, 'newDrawing');
        component.onkeyDownWindow(event);
        expect(newDrawingSpy).toHaveBeenCalled();
    });

    it('should not call newDrawing when another key is pressed', () => {
        let event = { target: { className: 'no' } as Target } as KeyboardEvent;
        let newDrawingSpy = spyOn<any>(drawServiceMock, 'newDrawing');
        component.onkeyDownWindow(event);
        expect(newDrawingSpy).not.toHaveBeenCalled();
    });

    it('should not call onKeyDown when ctrl-O is pressed', () => {
        let event = { key: 'o', ctrlKey: true } as KeyboardEvent;
        let onKeyDownSpy = spyOn<any>((component as any).tools.currentTool, 'onKeyDown');
        component.onKeyDown(event);
        expect(onKeyDownSpy).not.toHaveBeenCalled();
    });

    it('updateDegree should call selection updatedegree and redrawselection', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('selection');
        (component as any).tools.currentTool.updateDegree = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        (component as any).tools.currentTool.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.updateDegree({ deltaY: 1, } as WheelEvent);
        expect((component as any).tools.currentTool.updateDegree).toHaveBeenCalled();
    });



    it('updateDegree should call selection updatedegree and redrawselection', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('plume');
        (component as any).tools.currentTool.adjustAngle = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        (component as any).tools.currentTool.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.updateDegree({ deltaY: 1, } as WheelEvent);
        expect((component as any).tools.currentTool.adjustAngle).toHaveBeenCalled();
    });

    it('updateDegree should call selection updatedegree and redrawselection', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('stamp');
        (component as any).tools.currentTool.updateDegree = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        (component as any).tools.currentTool.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        const targetElement: any = { tagName: 'CANVAS' };
        const event: any = { deltaY: 1, target: targetElement };
        component.updateDegree(event);
        expect((component as any).tools.currentTool.updateDegree).toHaveBeenCalled();
    });

    it('should call onkeydown of clipboard', () => {
        const element = { className: "dds" };
        const event = { key: 'c', ctrlKey: true, target: element } as unknown as KeyboardEvent;
        (component as any).tools.currentTool = (component as any).tools.getTools().get('selection');
        (component as any).clipboard.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onkeyDownWindow(event);
        expect((component as any).clipboard.onKeyDown).toHaveBeenCalled();

    });

    it('should not call onkeydown of clipboard', () => {
        const element = { className: "dds" };
        const event = { key: 'c', ctrlKey: true, target: element } as unknown as KeyboardEvent;
        (component as any).tools.currentTool = (component as any).tools.getTools().get('stamp');
        (component as any).clipboard.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onkeyDownWindow(event);
        expect((component as any).clipboard.onKeyDown).not.toHaveBeenCalled();
    });

    it('should call onkeydown of invoker', () => {
        const element = { className: "dds" };
        let event = { key: 'z', ctrlKey: true, target: element } as unknown as KeyboardEvent;
        event.preventDefault = jasmine.createSpy().and.callFake(() => { });
        event.stopPropagation = jasmine.createSpy().and.callFake(() => { });
        (component as any).tools.currentTool = (component as any).tools.getTools().get('stamp');
        (component as any).invoker.onKeyDown = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.onkeyDownWindow(event as any);
        expect((component as any).invoker.onKeyDown).toHaveBeenCalled();
    });

    /*it('should call updateDegree of magicselectionObj', () => {
        (component as any).tools.getTools().get = jasmine.createSpy().and.callFake(() => { return {} as MagicWandService });
        (component as any).tools.currentTool = (component as any).tools.getTools().get('magic-wand');
        (component as any).tools.currentTool.magicSelectionObj = {} as MagicWandSelection;
        (component as any).tools.currentTool.magicSelectionObj.isActive = true;
        (component as any).tools.currentTool.magicSelectionObj.updateDegree = jasmine.createSpy().and.callThrough().and.callFake(() => { });
        component.updateDegree({ deltaY: 1, } as WheelEvent);
        expect((component as any).tools.currentTool.magicSelectionObj.updateDegree).toHaveBeenCalled();
    });*/
});
