/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from '@app/services/resizing/resizing.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { LineService } from '@app/services/tools/line/line.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { MockUndoRedoService } from '../attributebar/attributebar.component.spec';



export class MockDrawingService extends DrawingService {
    resizeCanvas(): void {
        console.log('RESIZE CANVAS CALLED');
    }
}

class MockResizingService extends ResizingService {
    initResizing(event: MouseEvent) {
        console.log('INIT RESIZING CALLED');
    }
}

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let paintBucketStub: PaintBucketService;
    let drawServiceMock: MockDrawingService;
    let undoRedoServiceMock: MockUndoRedoService;
    let resizingServiceMock: MockResizingService;

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
        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: DrawingService, useValue: drawServiceMock },
                { provide: ToolsManagerService, useValue: toolManagerStub },
                { provide: ResizingService, useValue: resizingServiceMock },
            ],
        }).compileComponents();
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
        const event = {} as KeyboardEvent;
        const KeyboardEventSpy = spyOn(toolManagerStub.currentTool, 'onKeyUp').and.callThrough();
        component.onKeyUp(event);
        expect(KeyboardEventSpy).toHaveBeenCalled();
        expect(KeyboardEventSpy).toHaveBeenCalledWith(event);
    });

    it('on key w pressed current tool should change to brush ', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'w',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('brush') as Tool);
    });

    it('on key e pressed current tool should change to eraser ', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'e',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('eraser') as Tool);
    });

    it('on key c pressed current tool should change to pencil ', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'c',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('pencil') as Tool);
    });

    it('on key 1 pressed current tool should change to rectangle ', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: '1',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('rectangle') as Tool);
    });

    it('on key 2 pressed current tool should change to ellipse ', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: '2',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('ellipse') as Tool);
    });
    it('on key l pressed current tool should change to line ', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'l',
        });
        component.onKeyDown(event);
        expect(toolManagerStub.currentTool).toEqual(toolManagerStub.getTools().get('line') as Tool);
    });

    it('on another key down, current tool should call tool on key down', () => {
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
        let event = {} as KeyboardEvent;
        let onKeyUpSpy = spyOn<any>((component as any).tools.currentTool, 'onKeyUp');
        resizingServiceMock.resizing = true;
        component.onKeyUp(event);
        expect(onKeyUpSpy).toHaveBeenCalled();
    });

    it('should call newDrawing when ctrl-O is pressed', () => {
        let event = {
            key: 'o',
            ctrlKey: true,
            preventDefault: jasmine.createSpy() as any,
            stopPropagation: jasmine.createSpy() as any,
        } as KeyboardEvent;
        let newDrawingSpy = spyOn<any>(drawServiceMock, 'newDrawing');
        component.onkeyDownWindow(event);
        expect(newDrawingSpy).toHaveBeenCalled();
    });

    it('should not call newDrawing when another key is pressed', () => {
        let event = {} as KeyboardEvent;
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
});
