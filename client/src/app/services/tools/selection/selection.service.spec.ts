/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Movable } from '@app/classes/movable';
import { SelectionCommand } from '@app/classes/selection-command';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { GridService } from '../grid/grid.service';
//import { RectangleService } from '../rectangle/rectangle.service';
import { SelectionService } from './selection.service';

describe('SelectionService', () => {
    let service: SelectionService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionCommandStub: SelectionCommand;
    let selectionStub: SelectionService;
    let invokerStub: UndoRedoService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let DrawingServiceMock: MockDrawingService;
    GridService.squareSize = 25;
    beforeEach(() => {
        DrawingServiceMock = new MockDrawingService();
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(SelectionService);
        //drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();

        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas.width = canvasStub.width;
        service['drawingService'].canvas.height = canvasStub.height;
        service['drawingService'].baseCtx.canvas.width = baseCtxStub.canvas.width;
        service['drawingService'].previewCtx.canvas.width = previewCtxStub.canvas.width;
        service['drawingService'].baseCtx.canvas.height = baseCtxStub.canvas.height;
        service['drawingService'].previewCtx.canvas.height = previewCtxStub.canvas.height;
        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        Movable.magnetismActivated = false;

        invokerStub = new UndoRedoService(DrawingServiceMock);
        selectionStub = new SelectionService(DrawingServiceMock, invokerStub);
        selectionCommandStub = new SelectionCommand({ x: 0, y: 0 }, selectionStub, DrawingServiceMock);
        service.selectionCommand = selectionCommandStub;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change selectionData when saveSelection is called', () => {
        let tempCanvas: HTMLCanvasElement = document.createElement('canvas');
        service.selectionData = tempCanvas;
        service.selectionStartPoint = { x: 0, y: 0 };
        service.saveSelection();
        expect(service.selectionData).not.toEqual(tempCanvas);
    });

    it('should call rect the number of resizing handles we have', () => {
        service.selectionStartPoint = { x: 0, y: 0 };
        service.rectangleService.width = 100;
        service.rectangleService.height = 50;
        service.updateResizingHandles();
        let rectSpy = spyOn((service as any).drawingService.previewCtx, 'rect');
        service.drawResizingHandles();
        expect(rectSpy).toHaveBeenCalledTimes(8);
    });

    it('mousedownonhandle should return number of handle if mouse is down on handle', () => {
        //start point is the handle #1 so the method should return 1
        service.selectionStartPoint = { x: 15, y: 20 };
        service.selectionEndPoint = { x: 50, y: 10 };
        let mouseDownPos = { x: 15, y: 20 };
        service.rectangleService.width = 100;
        service.rectangleService.height = 50;
        service.updateResizingHandles();
        expect(service.mouseDownOnHandle(mouseDownPos)).toEqual(1);
    });
    it('mousedownonhandle should return -1 if mouse isnt down on anyhandle', () => {
        //start point is the handle #1 so the method should return 1
        service.selectionStartPoint = { x: 15, y: 20 };
        service.selectionEndPoint = { x: 50, y: 10 };
        let mouseDownPos = { x: 15, y: 25 };
        service.rectangleService.width = 100;
        service.rectangleService.height = 50;
        service.updateResizingHandles();
        expect(service.mouseDownOnHandle(mouseDownPos)).toEqual(-1);
    });
    it('selectAllCanvas should saveselection with canvas height and width', () => {
        let tempCanvas: HTMLCanvasElement = document.createElement('canvas');
        service.selectionData = tempCanvas;
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy();
        service.selectAllCanvas();

        expect(service.selectionData.width).toEqual(100);
        expect(service.selectionData.height).toEqual(100);
    });

    it('resizing handles should change when selectionstartpoint changes', () => {
        service.selectionStartPoint = { x: 16, y: 21 };
        service.updateResizingHandles();
        let handlesBeforeUpdate = (service as any).resizingHandles;

        service.selectionStartPoint = { x: 17, y: 21 };
        service.updateResizingHandles();

        expect((service as any).resizingHandles).not.toBe(handlesBeforeUpdate);
    });

    it('resizing handles should not change when selectionstartpoint changes', () => {
        service.selectionStartPoint = { x: 16, y: 21 };
        service.updateResizingHandles();
        let handlesBeforeUpdate = (service as any).resizingHandles;

        service.selectionStartPoint = { x: 16, y: 21 };
        service.updateResizingHandles();

        expect((service as any).resizingHandles).toEqual(handlesBeforeUpdate);
    });

    it('onmousemove should call eraseSelectionFromBase if its the first move', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let eraseSelectionFromBaseSpy = spyOn(service as any, 'eraseSelectionFromBase');
        service.width = 60;
        service.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.firstSelectionMove = true;
        service.mouseDownInsideSelection = true;

        service.onMouseMove(mouseEvent);

        expect(eraseSelectionFromBaseSpy).toHaveBeenCalled();
    });

    it('moveSelection should not call eraseSelectionFromBase if its the first move', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let eraseSelectionFromBaseSpy = spyOn(service as any, 'eraseSelectionFromBase');
        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.firstSelectionMove = false;
        let currentPos = { x: 30, y: 20 };

        service.moveSelection(currentPos);

        expect(eraseSelectionFromBaseSpy).not.toHaveBeenCalled();
    });

    it('redrawSelection should clip image', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let eraseSelectionMock = spyOn(service as any, 'eraseSelectionFromBase');
        eraseSelectionMock.and.callFake(function () { });
        let clipMock = spyOn((service as any).drawingService.previewCtx, 'clip');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.firstSelectionMove = false;
        service.mouseDownInsideSelection = true;
        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };

        service.redrawSelection();

        expect(clipMock).toHaveBeenCalled();
    });

    it('should call moveSelection if moveDelay is not active', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionMock = spyOn(service as any, 'moveSelection');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.moveDelayActive = false;

        service.moveSelectionWithKeys();

        expect(moveSelectionMock).toHaveBeenCalled();
    });

    it('should not call moveSelection if moveDelay is active', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionMock = spyOn(service as any, 'moveSelection');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.moveDelayActive = true;

        service.moveSelectionWithKeys();

        expect(moveSelectionMock).not.toHaveBeenCalled();
    });

    it('should add 3 to x coordinates of selectionStartPos and selectionEndPos on ArrowRight', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionMock = spyOn(service as any, 'moveSelection');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.keysDown['ArrowRight'] = true;

        service.moveSelectionWithKeys();

        expect(moveSelectionMock).toHaveBeenCalled();
        expect(service.selectionStartPoint.x).toEqual(33);
    });

    it('should substract 3 to y coordinates of selectionStartPos and selectionEndPos on ArrowUp', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionMock = spyOn(service as any, 'moveSelection');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 46, y: 45 };
        service.selectionEndPoint = { x: 26, y: 55 };
        service.keysDown['ArrowUp'] = true;

        service.moveSelectionWithKeys();

        expect(moveSelectionMock).toHaveBeenCalled();
        expect(service.selectionStartPoint.y).toEqual(42);
    });

    it('should add 3 to y coordinates of selectionStartPos and selectionEndPos on ArrowDown', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionMock = spyOn(service as any, 'moveSelection');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 46, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.keysDown['ArrowDown'] = true;

        service.moveSelectionWithKeys();

        expect(moveSelectionMock).toHaveBeenCalled();
        expect(service.selectionStartPoint.y).toEqual(69);
    });

    it('should sub 3 to x coordinates of selectionStartPos and selectionEndPos on ArrowLeft', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let moveSelectionMock = spyOn(service as any, 'moveSelection');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.keysDown['ArrowLeft'] = true;

        service.moveSelectionWithKeys();

        expect(moveSelectionMock).toHaveBeenCalled();
        expect(service.selectionStartPoint.x).toEqual(2);
    });

    it('onMouseDown should change mousedown inside selection to true if mousedown coords is inside the selection and its active', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionWithKeysMock = spyOn(service as any, 'moveSelectionWithKeys');
        moveSelectionWithKeysMock.and.callFake(function () { });

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.currenthandle = 1;
        service.selectionActivated = true;
        service.mouseDown = true;
        service.degres = 0;

        //initial state is false, should turn to true;
        service.mouseDownInsideSelection = false;
        let mouseDownEvent = {
            offsetX: 10,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.onMouseDown(mouseDownEvent);

        expect(service.mouseDownInsideSelection).toBeTrue();
        expect(service.mouseDown).toBeFalse();
    });

    it;

    it('onMouseDown should not change mousedown inside selection to true if mousedown coords is outside the selection and its active', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionWithKeysMock = spyOn(service as any, 'moveSelectionWithKeys');
        moveSelectionWithKeysMock.and.callFake(function () { });

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.currenthandle = 1;
        service.selectionActivated = true;

        //initial state is false, should stay false;
        service.mouseDownInsideSelection = false;
        let mouseDownEvent = {
            offsetX: 2,
            offsetY: 94,
            button: 0,
        } as MouseEvent;

        service.onMouseDown(mouseDownEvent);
        expect(service.mouseDownInsideSelection).toBeFalse();
        expect(service.mouseDown).toBeTrue();
    });

    it('onMouseDown should change current handle if the mouse is down on a resizingHandle', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionWithKeysMock = spyOn(service as any, 'moveSelectionWithKeys');
        moveSelectionWithKeysMock.and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.width = 26 - 5;
        service.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;

        //we set the mouse down to the endPos, which corresponds to the handle #8;
        //service.mouseDownInsideSelection=false;
        let mouseDownEvent = {
            offsetX: service.selectionEndPoint.x,
            offsetY: service.selectionEndPoint.y,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseDown(mouseDownEvent);
        expect(service.currenthandle).toEqual(8);
    });

    it('onMouseDown should not change current handle if the mouse is down on a resizingHandle', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;

        //we set the mouse down to the endPos, which corresponds to the handle #8;
        //service.mouseDownInsideSelection=false;
        let mouseDownEvent = {
            //out of canvas bounds
            offsetX: 103,
            offsetY: 200,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseDown(mouseDownEvent);
        expect(service.currenthandle).toEqual(-1);
    });

    it('onMouseDown should draw image on baseCtx if selection is activated and mouseDownCoords is out of selection', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;

        //we set the mouse down to the endPos, which corresponds to the handle #8;
        //service.mouseDownInsideSelection=false;
        let mouseDownEvent = {
            //out of canvas bounds
            offsetX: 3,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseDown(mouseDownEvent);
        expect((service as any).drawingService.baseCtx.drawImage).toHaveBeenCalled();
    });

    it('onMouseDown should not call clipImageWithEllipse if selection is confirmed and selection style is not ellipse', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let clipImageWithEllipseSpy = spyOn(service as any, 'clipImageWithEllipse');

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;
        service.selectionStyle = 0;

        //we set the mouse down to the endPos, which corresponds to the handle #8;
        //service.mouseDownInsideSelection=false;
        let mouseDownEvent = {
            //out of canvas bounds
            offsetX: 3,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseDown(mouseDownEvent);
        expect(clipImageWithEllipseSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should call resetSelection if current selection is confirmed', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let resetSelectionSpy = spyOn(service as any, 'resetSelection');

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;
        service.selectionStyle = 0;

        //we set the mouse down to the endPos, which corresponds to the handle #8;
        //service.mouseDownInsideSelection=false;
        let mouseDownEvent = {
            //out of canvas bounds
            offsetX: 3,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseDown(mouseDownEvent);
        expect(resetSelectionSpy).toHaveBeenCalled();
    });

    it('onMouseDown should not call resetSelection if current selection is not confirmed', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let resetSelectionSpy = spyOn(service as any, 'resetSelection');

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;
        service.selectionStyle = 0;

        let mouseDownEvent = {
            offsetX: service.selectionStartPoint.x,
            offsetY: service.selectionStartPoint.y,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseDown(mouseDownEvent);
        expect(resetSelectionSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should not call resetSelection if current selection is not confirmed', () => {
        let getPositionMock = spyOn(service as any, 'getPositionFromMouse');
        getPositionMock.and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = -1;
        service.selectionActivated = true;
        service.selectionStyle = 0;

        let mouseDownEvent = {
            offsetX: service.selectionStartPoint.x,
            offsetY: service.selectionStartPoint.y,
            button: 1,
        } as MouseEvent;

        service.onMouseDown(mouseDownEvent);
        expect(getPositionMock).not.toHaveBeenCalled();
    });

    it('start point should change to currentPos when resizing with handle #1', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 1;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.degres = 0;

        let mouseMoveEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionStartPoint).toEqual({ x: mouseMoveEvent.offsetX, y: mouseMoveEvent.offsetY });
    });

    it('selectionStartPoint.y should change to currentPos.y when resizing with handle #2 and selectionStartPoint.x shouldnt change', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        let initialStartPointx = 15;
        service.selectionStartPoint = { x: initialStartPointx, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 15;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 2;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;

        let mouseMoveEvent = {
            offsetX: 16,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionStartPoint.x).toEqual(initialStartPointx);
        expect(service.selectionStartPoint.y).toEqual(mouseMoveEvent.offsetY);
    });

    it('selectionStartPoint.y should change to currentPos.y and selectionEndPoint.x to currentpos.x when resizing with handle #3', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 15, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 15;
        service.rectangleService.height = 95 - 66;
        service.height = 95 - 66;
        service.width = 26 - 15;
        service.currenthandle = 3;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.degres = 0;

        let mouseMoveEvent = {
            offsetX: 16,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionStartPoint.y).toEqual(mouseMoveEvent.offsetY);
        expect(service.selectionEndPoint.x).toEqual(mouseMoveEvent.offsetX);
    });

    it('onMouseEnter should set isOut of rectangleService to false', () => {
        service.rectangleService.isOut = true;
        service.onMouseEnter(mouseEvent);
        expect(service.rectangleService.isOut).toBe(false);
    });

    it('selectionStartPoint.x should change to currentPos.x when resizing with handle #4 and selectionStartPoint.y shouldnt change', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        let initialStartPointy = 60;
        service.selectionStartPoint = { x: 15, y: initialStartPointy };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 15;
        service.rectangleService.height = 95 - 66;
        service.width = 26 - 15;
        service.height = 95 - 66;
        service.currenthandle = 4;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.degres = 0;

        let mouseMoveEvent = {
            offsetX: 16,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionStartPoint.x).toEqual(mouseMoveEvent.offsetX);
        expect(service.selectionStartPoint.y).toEqual(initialStartPointy);
    });
    it('selectionEndPoint.x should change to currentPos.x when resizing with handle #5 and selectionEndPoint.y shouldnt change', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        let initialEndPointy = 95;
        service.selectionStartPoint = { x: 15, y: 60 };
        service.selectionEndPoint = { x: 26, y: initialEndPointy };
        service.rectangleService.width = 26 - 15;
        service.rectangleService.height = 95 - 66;
        service.width = 26 - 15;
        service.height = 95 - 66;

        service.currenthandle = 5;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.degres = 0;

        let mouseMoveEvent = {
            offsetX: 16,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionEndPoint.x).toEqual(mouseMoveEvent.offsetX);
        expect(service.selectionEndPoint.y).toEqual(initialEndPointy);
    });

    it('selectionStartPoint.x should change to currentPos.x and selectionEndPoint.y to currentpos.y when resizing with handle #6', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 15, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 15;
        service.rectangleService.height = 95 - 66;
        service.width = 26 - 15;
        service.height = 95 - 66;
        service.currenthandle = 6;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.degres = 0;

        let mouseMoveEvent = {
            offsetX: 16,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionEndPoint.y).toEqual(mouseMoveEvent.offsetY);
        expect(service.selectionStartPoint.x).toEqual(mouseMoveEvent.offsetX);
    });

    it('selectionEndPoint.y should change to currentPos.y when resizing with handle #7 and selectionEndPoint.x shouldnt change', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        let initialEndPointx = 26;
        service.selectionStartPoint = { x: 15, y: 60 };
        service.selectionEndPoint = { x: initialEndPointx, y: 95 };
        service.rectangleService.width = 26 - 15;
        service.rectangleService.height = 95 - 66;
        service.width = 26 - 15;
        service.height = 95 - 66;
        service.currenthandle = 7;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.degres = 0;

        let mouseMoveEvent = {
            offsetX: 16,
            offsetY: 70,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionEndPoint.y).toEqual(mouseMoveEvent.offsetY);
        expect(service.selectionEndPoint.x).toEqual(initialEndPointx);
    });

    it('selectionEndPoint should change to currentPos when resizing with handle #8', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = true;

        let mouseMoveEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(service.selectionEndPoint).toEqual({ x: mouseMoveEvent.offsetX, y: mouseMoveEvent.offsetY });
    });

    it('onMouseMove should call moveSelection if mouse is down inside selection when its activated', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let moveSelectionSpy = spyOn(service as any, 'moveSelection');

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        service.mouseDown = false;
        service.mouseDownInsideSelection = true;

        let mouseMoveEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(moveSelectionSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call draw ellipse if mouse is when its activated and selection style is ellipse', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.selectionData.width = 26 - 5;
        service.selectionData.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = true;
        service.selectionStyle = 1;
        service.mouseDown = true;
        service.mouseDownInsideSelection = false;

        let mouseMoveEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(ellipseServiceDrawSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call rectServiceOnmouseMove if mouse is down and selection isnt activated', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let rectServiceOnMouseMoveSpy = spyOn((service as any).rectangleService, 'onMouseMove');
        rectServiceOnMouseMoveSpy.and.callFake(function () { });
        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () { });
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = false;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.mouseDownInsideSelection = false;

        let mouseMoveEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(rectServiceOnMouseMoveSpy).toHaveBeenCalled();
        expect(ellipseServiceDrawSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call drawEllipse if mouse is down and selection isnt activated and selection style is ellipse', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let rectServiceOnMouseMoveSpy = spyOn((service as any).rectangleService, 'onMouseMove');
        rectServiceOnMouseMoveSpy.and.callFake(function () { });

        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.selectionEndPoint = { x: 26, y: 95 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = false;
        service.selectionStyle = 1;
        service.mouseDown = true;
        service.mouseDownInsideSelection = false;

        let mouseMoveEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseMove(mouseMoveEvent);
        expect(rectServiceOnMouseMoveSpy).toHaveBeenCalled();
        expect(ellipseServiceDrawSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set selectionEndPoint to mouseUpCoord if selection isnt already activated', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.rectangleService.width = 20 - 5;
        service.rectangleService.height = 80 - 66;
        service.currenthandle = 8;
        service.selectionActivated = false;
        service.rectangleService.isOut = false;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.isOut = false;

        let mouseUpEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseUp(mouseUpEvent);
        expect(service.selectionEndPoint).toEqual({ x: mouseUpEvent.offsetX, y: mouseUpEvent.offsetY });
    });

    it('onMouseUp should set selectionEndPoint to mouseOutCoord if selection is activated', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = false;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.rectangleService.isOut = true;
        service.rectangleService.mouseOutCoord = { x: 100, y: 5 };

        let mouseUpEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseUp(mouseUpEvent);
        expect(service.selectionEndPoint).toEqual(service.rectangleService.mouseOutCoord);
    });

    it('onMouseUp should call updateSelectionNodes and saveSelection', () => {
        (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let saveSelectionSpy = spyOn(service as any, 'saveSelection');
        let updateSelectionNodes = spyOn(service as any, 'updateSelectionNodes');

        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 5, y: 66 };
        service.rectangleService.width = 26 - 5;
        service.rectangleService.height = 95 - 66;
        service.currenthandle = 8;
        service.selectionActivated = false;
        service.selectionStyle = 0;
        service.mouseDown = true;
        service.rectangleService.isOut = true;
        service.rectangleService.mouseOutCoord = { x: 100, y: 5 };

        let mouseUpEvent = {
            offsetX: 20,
            offsetY: 80,
            button: 0,
        } as MouseEvent;

        service.updateResizingHandles();

        service.onMouseUp(mouseUpEvent);
        expect(saveSelectionSpy).toHaveBeenCalled();
        expect(updateSelectionNodes).toHaveBeenCalled();
    });

    it('onkeyUp should call rectangle service KeyUp', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;

        let rectServiceOnKeyUpSpy = spyOn((service as any).rectangleService, 'onKeyUp');
        rectServiceOnKeyUpSpy.and.callFake(function () { });

        const event = new KeyboardEvent('document:keyup', {
            key: 'Shift',
            shiftKey: true,
        });

        service.onKeyUp(event);
        expect(rectServiceOnKeyUpSpy).toHaveBeenCalled();
    });

    /*it('onkeyUp should call draw ellipse if mouse is down and shiftKey is up', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;

        let rectServiceOnKeyUpSpy = spyOn((service as any).rectangleService, 'onKeyUp');
        rectServiceOnKeyUpSpy.and.callFake(function () {});

        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () {});

        const event = new KeyboardEvent('document:keyup', {
            key: 'Shift',
            shiftKey: false,
        });

        service.onKeyUp(event);
        expect(ellipseServiceDrawSpy).toHaveBeenCalled();
    });*/

    it('onkeyUp should not call draw ellipse if mouse isnt down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = false;

        let rectServiceOnKeyUpSpy = spyOn((service as any).rectangleService, 'onKeyUp');
        rectServiceOnKeyUpSpy.and.callFake(function () { });

        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () { });

        const event = new KeyboardEvent('document:keyup', {
            key: 'Shift',
            shiftKey: false,
        });

        service.onKeyUp(event);
        expect(ellipseServiceDrawSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call selectAllCanvas if the keys ctrl and a are down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        let selectAllCanvas = spyOn(service as any, 'selectAllCanvas');

        const event = new KeyboardEvent('document:keydown', {
            key: 'a',
            ctrlKey: true,
        });

        service.onKeyDown(event);
        expect(selectAllCanvas).toHaveBeenCalled();
    });

    it('onKeyDown should not call selectAllCanvas if one of the keys ctrl and a isnt down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        let selectAllCanvas = spyOn(service as any, 'selectAllCanvas');

        const event = new KeyboardEvent('document:keydown', {
            key: 'a',
            ctrlKey: false,
        });

        service.onKeyDown(event);
        expect(selectAllCanvas).not.toHaveBeenCalled();
    });

    it('onKeyDown should call drawSelectionOnBase if selection is activated and key down is Escape ', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        service.selectionActivated = true;
        let drawSelectionOnBaseSpy = spyOn(service as any, 'drawSelectionOnBase');

        const event = new KeyboardEvent('document:keydown', {
            key: 'Escape',
        });

        service.onKeyDown(event);
        expect(drawSelectionOnBaseSpy).toHaveBeenCalled();
    });

    /*it('onKeyDown should call rectServiceKeyDown if key isnt escape or ctrl+a ', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        service.selectionActivated = true;

        let rectServiceOnKeyDownSpy = spyOn((service as any).rectangleService, 'onKeyDown');
        rectServiceOnKeyDownSpy.and.callFake(function () {});

        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });

        service.onKeyDown(event);
        expect(rectServiceOnKeyDownSpy).toHaveBeenCalled();
    });*/

    /*it('onKeyDown should call drawEllipse if key is shift and mouse is down style is ellipse ', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        service.selectionActivated = true;
        service.selectionStyle = 1;

        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () {});

        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });

        service.onKeyDown(event);
        expect(ellipseServiceDrawSpy).toHaveBeenCalled();
    });*/

    it('onKeyDown should call moveSelectionWithKey if key is an arrow ', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        service.selectionActivated = true;
        service.selectionStyle = 0;
        let redrawSelectionMock = spyOn(service as any, 'redrawSelection');
        redrawSelectionMock.and.callFake(function () { });

        let moveSelectionWithKeysSpy = spyOn(service as any, 'moveSelectionWithKeys');

        const event = new KeyboardEvent('document:keydown', {
            key: 'ArrowLeft',
            shiftKey: false,
        });

        service.onKeyDown(event);
        expect(moveSelectionWithKeysSpy).toHaveBeenCalled();
    });

    it('onMouseOut should call rectService onMouseOut', () => {
        let rectServiceOnMouseOutSpy = spyOn((service as any).rectangleService, 'onMouseOut');
        rectServiceOnMouseOutSpy.and.callFake(function () { });
        service.selectionStyle = 0;
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseOut(mouseEvent);
        expect(rectServiceOnMouseOutSpy).toHaveBeenCalled();
    });

    it('onMouseOut should call drawEllipse if selection isnt activated and mouse is down and selection is with ellipse', () => {
        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () { });

        service.selectionStyle = 1;
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseOut(mouseEvent);
        expect(ellipseServiceDrawSpy).toHaveBeenCalled();
    });

    it('updateSelectionNodes should swap selection startpoint and endpoint if endpoint.y<startPoint.y endpoint.x<startPoint.x', () => {
        /*
    start point should always be here -> 1 2 3
                                         4   5
                                         6 7 8 <- and endpoint here
    */
        let initialStartPoint = { x: 26, y: 60 };
        let initialEndPoint = { x: 5, y: 30 };
        service.width = 21;
        service.height = 30;

        service.selectionStartPoint = { x: initialStartPoint.x, y: initialStartPoint.y };
        service.selectionEndPoint = { x: initialEndPoint.x, y: initialEndPoint.y };
        service.updateSelectionNodes();

        expect(service.selectionStartPoint).toEqual(initialEndPoint);
        expect(service.selectionEndPoint).toEqual(initialStartPoint);
    });

    it('moveSelectionWithKeys should delay by 500 if it isnt already in continuous movement', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });
        let moveSelectionMock = spyOn(service as any, 'moveSelection');
        moveSelectionMock.and.callFake(function () { });

        let delayMock = spyOn(service as any, 'delay');
        delayMock.and.callFake(function () { });

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.moveDelayActive = false;
        service.continuousMove = false;

        service.moveSelectionWithKeys();

        expect(delayMock).toHaveBeenCalledWith(500);
    });

    it('moveSelectionWithKeys should delay by 100 if it is already in continuous movement', () => {
        (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () { });

        let moveSelectionMock = spyOn(service as any, 'moveSelection');
        moveSelectionMock.and.callFake(function () { });

        let delayMock = spyOn(service as any, 'delay');
        delayMock.and.callFake(function () { });

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;
        service.offsetX = 15;
        service.offsetY = 6;
        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.moveDelayActive = false;
        service.continuousMove = true;

        service.moveSelectionWithKeys();

        expect(delayMock).toHaveBeenCalledWith(100);
    });
    it('eraseSelectionFromBase should call rect if selection is with rect', () => {
        let ctxRectMock = spyOn((service as any).drawingService.baseCtx, 'rect');

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;

        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.selectionStyle = 0;

        service.eraseSelectionFromBase(service.selectionStartPoint);

        expect(ctxRectMock).toHaveBeenCalled();
    });

    it('eraseSelectionFromBase should call drawEllipse if selection is with ellipse', () => {
        let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, 'drawEllipse');
        ellipseServiceDrawSpy.and.callFake(function () { });

        service.rectangleService.width = 60;
        service.rectangleService.height = 50;

        service.selectionStartPoint = { x: 30, y: 20 };
        service.selectionEndPoint = { x: 70, y: 35 };
        service.selectionStyle = 1;

        service.eraseSelectionFromBase(service.selectionStartPoint);

        expect(ellipseServiceDrawSpy).toHaveBeenCalled();
    });

    it('getRotatedGenir should return the rotated Point dependly of the centre of rotation', () => {
        const point = { x: 0, y: 1 };
        const centre = { x: 0, y: 0 };
        const angle = Math.PI;
        const newPoint = service.getRotatedGeniric(point, centre, angle);
        expect(Math.round(newPoint.x) === 0).toBeTruthy();
        expect(Math.round(newPoint.y) === -1).toBeTruthy();
    });

    it('getRotatedGenir should return the rotated Point dependly of the centre of rotation', () => {
        const point = { x: 0, y: 1 };
        const centre = { x: 1, y: 1 };
        const angle = Math.PI;
        const newPoint = service.getRotatedGeniric(point, centre, angle);
        expect(Math.round(newPoint.x) === 2).toBeTruthy();
        expect(Math.round(newPoint.y) === 1).toBeTruthy();
    });

    it('getRotatedPos should return the rotated Pos dependly of the centre calculated by start and end pos', () => {
        const point = { x: 0, y: 1 };
        service.selectionStartPoint = { x: -1, y: 1 };
        service.selectionEndPoint = { x: 1, y: -1 };
        service.width = service.selectionEndPoint.x - service.selectionStartPoint.x;
        service.height = service.selectionEndPoint.y - service.selectionStartPoint.y;
        service.degres = 180;
        const newPoint = service.getRotatedPos(point);
        expect(Math.round(newPoint.x) === 0).toBeTruthy();
        expect(Math.round(newPoint.y) === -1).toBeTruthy();
    });

    it('getUnRotatedPos should return the unrotated Pos dependly of the centre calculated by start and end pos', () => {
        const point = { x: 0, y: -1 };
        service.selectionStartPoint = { x: -1, y: 1 };
        service.selectionEndPoint = { x: 1, y: -1 };
        service.width = service.selectionEndPoint.x - service.selectionStartPoint.x;
        service.height = service.selectionEndPoint.y - service.selectionStartPoint.y;
        service.degres = 180;
        const newPoint = service.getUnrotatedPos(point);
        expect(Math.round(newPoint.x) === 0).toBeTruthy();
        expect(Math.round(newPoint.y) === 1).toBeTruthy();
    });

    it('should increment degree by 15 if scrol deltaY <0 and alt is false', () => {
        const mouse = {
            deltaY: -1,
            altKey: false,
        } as WheelEvent;
        service.degres = 0;
        service.updateDegree(mouse);
        expect(service.degres).toEqual(15);
    });

    it('should increment degree by 1 if scrol deltaY <0 and alt is true', () => {
        const mouse = {
            deltaY: -1,
            altKey: true,
        } as WheelEvent;
        service.degres = 0;
        service.updateDegree(mouse);
        expect(service.degres).toEqual(1);
    });

    it('should decrement degree by 15 if scrol deltaY >0 and alt is false', () => {
        const mouse = {
            deltaY: 1,
            altKey: false,
        } as WheelEvent;
        service.degres = 0;
        service.updateDegree(mouse);
        expect(service.degres).toEqual(-15);
    });

    it('should decrement degree by 1 if scrol deltaY >0 and alt is true', () => {
        const mouse = {
            deltaY: 1,
            altKey: true,
        } as WheelEvent;
        service.degres = 0;
        service.updateDegree(mouse);
        expect(service.degres).toEqual(-1);
    });

    it('should not change degree if deltaY = 0', () => {
        const mouse = {
            deltaY: 0,
            altKey: true,
        } as WheelEvent;
        service.degres = 0;
        service.updateDegree(mouse);
        expect(service.degres).toEqual(0);
    });

    it('should return the coordinate of the end point of the projection on the passed direction', () => {
        service.selectionStartPoint = { x: 0, y: 0 };
        service.selectionEndPoint = { x: 20, y: 20 };
        service.degres = 0;
        const point = { x: 0, y: 0 };
        const direction = { x: 1, y: 0 };
        service.currentPos = { x: 2, y: 1 };
        const newPos = service.handleNewPos(point, direction);
        expect(newPos.x).toEqual(2);
        expect(newPos.y).toEqual(0);
    });

    it('should return the coordinate of the end point of the projection on the passed direction', () => {
        service.selectionStartPoint = { x: 0, y: 0 };
        service.selectionEndPoint = { x: 20, y: 20 };
        service.degres = 90;
        const point = { x: 0, y: 0 };
        const direction = { x: 1, y: 0 };
        service.currentPos = { x: 2, y: 1 };
        const newPos = service.handleNewPos(point, direction);
        expect(newPos.x).toEqual(20);
        expect(newPos.y).toEqual(1);
    });

    it('should keep the same rotated pos exemple rotated selectionStartPoint keep the same value if we resizing from handle 5', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.width = 3;
        service.height = 2;
        service.currentPos = { x: 5, y: 10 };
        service.degres = 15;
        service.currenthandle = 5;
        const rotatedStart = service.getRotatedPos(service.selectionStartPoint);
        const spy = spyOn(service, 'adjustRectangle').and.callThrough();
        //const spy1 = spyOn(service as Movable, 'redrawSelection')
        service.redrawSelection = jasmine.createSpy().and.callFake(function () { });
        service.resizeSelection();
        expect(spy).toHaveBeenCalled();
        expect(rotatedStart.x).toEqual(service.getRotatedPos(service.selectionStartPoint).x);
        expect(rotatedStart.y).toEqual(service.getRotatedPos(service.selectionStartPoint).y);
    });

    it('should calculate the same unrotated start and endPoint', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.degres = 15;
        service.adjustRectangle(service.selectionStartPoint, service.selectionEndPoint, 3);
        expect(service.selectionEndPoint.x).toEqual(4);
        expect(service.selectionEndPoint.y).toEqual(4);
        expect(Math.round(service.selectionStartPoint.x)).toEqual(1);
        expect(service.selectionStartPoint.y).toEqual(2);
    });

    it('should call getRotatedGeniric 3 times', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.degres = 15;
        const spy = spyOn(service, 'getRotatedGeniric').and.callThrough();
        service.adjustRectangle(service.selectionStartPoint, service.selectionEndPoint, 1);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should call getRotatedGeniric 3 times', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.degres = 15;
        const spy = spyOn(service, 'getRotatedGeniric').and.callThrough();
        service.adjustRectangle(service.selectionStartPoint, service.selectionEndPoint, 0);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should call getRotatedGeniric 4 times', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.degres = 15;
        const spy = spyOn(service, 'getRotatedGeniric').and.callThrough();
        service.adjustRectangle(service.selectionStartPoint, service.selectionEndPoint, 3);
        expect(spy).toHaveBeenCalledTimes(4);
    });

    it('should call getRotatedGeniric with selectionStartPoint', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.degres = 15;
        const spy = spyOn(service, 'getRotatedGeniric').and.callThrough();
        service.adjustRectangle(service.selectionStartPoint, service.selectionEndPoint, 1);
        expect(spy.calls.first().args[0]).toEqual({ x: 1, y: 2 });
    });

    it('should call getRotatedGeniric with seletionEndPoint', () => {
        service.selectionStartPoint = { x: 1, y: 2 };
        service.selectionEndPoint = { x: 4, y: 4 };
        service.degres = 15;
        const spy = spyOn(service, 'getRotatedGeniric').and.callThrough();
        service.adjustRectangle(service.selectionStartPoint, service.selectionEndPoint, 0);
        expect(spy.calls.first().args[0]).toEqual({ x: 4, y: 4 });
    });

    it('should flip selection horizontally if startpoint and endpoint are crossed horizontally and selection hasnt been flipped', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 10, y: 50 };
        service.flipedH = false;
        expect(service.checkFlip()).toEqual(1);
    });

    it('should flip selection horizontally if startpoint and endpoint are not crossed horizontally but selection has been flipped', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 30, y: 50 };
        service.flipedH = true;
        expect(service.checkFlip()).toEqual(1);
    });

    it('should not flip selection horizontally if startpoint and endpoint are crossed horizontally and selection has been flipped', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 10, y: 50 };
        service.flipedH = true;
        expect(service.checkFlip()).toEqual(0);
    });

    it('should flip selection vertically if startpoint and endpoint are crossed vertically and selection hasnt been flipped', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 30, y: 20 };
        service.flipedV = false;
        expect(service.checkFlip()).toEqual(2);
    });

    it('should flip selection vertically if startpoint and endpoint are not crossed vertically but selection has been flipped', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 30, y: 45 };
        service.flipedV = true;
        expect(service.checkFlip()).toEqual(2);
    });

    it('should not flip selection vertically if startpoint and endpoint are crossed vertically and selection has been flipped', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 30, y: 20 };
        service.flipedV = true;
        expect(service.checkFlip()).toEqual(0);
    });

    it('should be translated horizontally with a scale of -1,1 if selection is to be flipped horizontally', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 10, y: 40 };
        service.flipedH = false;
        const spy = spyOn(service, 'flipData').and.callThrough();
        service.flipSelection();
        expect(spy).toHaveBeenCalledWith({ x: service.selectionData.width, y: 0 }, { x: -1, y: 1 });
    });

    it('should be translated vertically with a scale of 1,-1 if selection is to be flipped vertically', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 30, y: 10 };
        service.flipedV = false;
        const spy = spyOn(service, 'flipData').and.callThrough();
        service.flipSelection();
        expect(spy).toHaveBeenCalledWith({ x: 0, y: service.selectionData.height }, { x: 1, y: -1 });
    });

    it('should be translated vertically and horizontally with a scale of -1,-1 if selection is to be flipped diagonally', () => {
        service.selectionStartPoint = { x: 20, y: 30 };
        service.selectionEndPoint = { x: 10, y: 10 };
        service.flipedV = false;
        service.flipedH = false;
        const spy = spyOn(service, 'flipData').and.callThrough();
        service.flipSelection();
        expect(spy).toHaveBeenCalledWith({ x: service.selectionData.width, y: service.selectionData.height }, { x: -1, y: -1 });
    });

    it('should keep endpoint.x rectangle side static and change startpoint.x instead when resizing from startpoint.x side and forcing rectangle to square', () => {
        const initialStartpoint = { x: 10, y: 30 };
        service.selectionStartPoint = { x: 10, y: 30 };
        const initialEndpoint = { x: 60, y: 40 };
        service.selectionEndPoint = { x: 60, y: 40 };
        service.flipedV = false;
        service.flipedH = false;
        service.currenthandle = 4;
        service.rectangleService.toSquare = true;
        service.redrawSelection(false,true);
        expect(service.selectionEndPoint.x).toEqual(initialEndpoint.x);
        expect(service.selectionStartPoint.x).not.toEqual(initialStartpoint.x);
    });

    it('should keep endpoint.y rectangle side static and change startpoint.y instead when resizing from startpoint.y side and forcing rectangle to square', () => {
        const initialStartpoint = { x: 10, y: 30 };
        service.selectionStartPoint = { x: 10, y: 30 };
        const initialEndpoint = { x: 60, y: 120 };
        service.selectionEndPoint = { x: 60, y: 120 };
        service.flipedV = false;
        service.flipedH = false;
        service.currenthandle = 2;
        service.rectangleService.toSquare = true;
        service.redrawSelection(false,true);
        expect(service.selectionEndPoint.y).toEqual(initialEndpoint.y);
        expect(service.selectionStartPoint.y).not.toEqual(initialStartpoint.y);
    });


    it('should align startpoint to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 40 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 40 + 50 }
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 1;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;
        service.moveSelection(currentPos);

        expect(service.selectionStartPoint).toEqual({ x: 0, y: 50 });

    });



    it('should not align startpoint when selection is moved and magnetism is not activated', () => {

        service.selectionStartPoint = { x: 11, y: 40 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 40 + 50 }
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 1;
        service.degres = 0;
        Movable.magnetismActivated = false;
        Movable.shouldAlign = true;
        service.moveSelection(currentPos);
        expect(service.selectionStartPoint).toEqual({ x: 11, y: 40 });
    });

    it('moveselection with key should shift selectionstartpoint by grid size if magnetism is activated', () => {

        service.selectionStartPoint = { x: 25, y: 100 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 40 + 50 }
        Movable.magnetismAnchorPoint = 1;
        service.degres = 0;
        Movable.magnetismActivated = true;
        service.keysDown['ArrowRight'] = true;
        Movable.shouldAlign = true;

        service.moveSelectionWithKeys();
        expect(service.selectionStartPoint).toEqual({ x: 50, y: 100 });
    });

    it('moveselection with key should shift selectionstartpoint by 3px size if magnetism is not activated', () => {

        service.selectionStartPoint = { x: 25, y: 100 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 40 + 50 }
        Movable.magnetismAnchorPoint = 1;
        service.degres = 0;
        Movable.magnetismActivated = false;
        service.keysDown['ArrowRight'] = true;
        service.moveSelectionWithKeys();
        expect(service.selectionStartPoint).toEqual({ x: 28, y: 100 });
    });

    //all alignment tests take into account handle offset for the expected new pos
    it('should align 2nd handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };

        //expected pos of second handle before alignment
        let secondHandlePos = { x: 23, y: 67 };
        //expect pos of second handle after alignment
        secondHandlePos = { x: 22, y: 72 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 2;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[1]).toEqual(secondHandlePos);

    });



    it('should align 3rd handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };
        GridService.squareSize = 25;
        //expected pos of third handle before alignment
        let thirdHandlePos = { x: 38, y: 67 };
        //expect pos of third handle after alignment\
        thirdHandlePos = { x: 47, y: 72 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 3;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[2]).toEqual(thirdHandlePos);

    });


    it('should align 4th handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };
        GridService.squareSize = 25;
        //expected pos of fourth handle before alignment
        let fourthHandlePos = { x: 8, y: 92 };
        //expect pos of fourth handle after alignment\
        fourthHandlePos = { x: -3, y: 97 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 4;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[3]).toEqual(fourthHandlePos);

    });


    it('should align 5th handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };
        GridService.squareSize = 25;
        //expected pos of fifth handle before alignment
        let fifthHandlePos = { x: 38, y: 92 };
        //expect pos of fifth handle after alignment\
        fifthHandlePos = { x: 47, y: 97 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 5;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[4]).toEqual(fifthHandlePos);

    });

    it('should align 6th handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };
        GridService.squareSize = 25;
        //expected pos of sixth handle before alignment
        let sixthHandlePos = { x: 8, y: 117 };
        //expect pos of sixth handle after alignment\
        sixthHandlePos = { x: -3, y: 122 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 6;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[5]).toEqual(sixthHandlePos);

    });

    it('should align 7th handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };

        //expected pos of seventh handle before alignment
        let seventhHandlePos = { x: 23, y: 118 };
        //expect pos of seventh handle after alignment\
        seventhHandlePos = { x: 22, y: 122 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 7;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[6]).toEqual(seventhHandlePos);

    });


    it('should align 8th handle to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 11, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 11 + 30, y: 70 + 50 };
        GridService.squareSize = 25;
        //expected pos of third handle before alignment
        let eighthHandlePos = { x: 38, y: 117 };
        //expect pos of third handle after alignment\
        eighthHandlePos = { x: 47, y: 122 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 8;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect(service.resizingHandles[7]).toEqual(eighthHandlePos);

    });


    it('should align center to closest alignment point if selection is moved and it isnt aligned when magnetism is activated', () => {

        service.selectionStartPoint = { x: 10, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 10 + 30, y: 70 + 50 };
        GridService.squareSize = 25;
        //expected pos of third handle before alignment
        let centerPos = { x: 20, y: 85 };
        //expect pos of third handle after alignment\
        centerPos = { x: 25, y: 100 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 9;
        service.degres = 0;
        Movable.magnetismActivated = true;
        Movable.shouldAlign = true;

        service.moveSelection(currentPos);
        service.updateResizingHandles();
        expect({x:service.selectionStartPoint.x+service.width/2,y:service.selectionStartPoint.y+service.height/2}).toEqual(centerPos);

    });

    it('should call switchHandlesHorizontal if shift key is pressed while resizing and selection is flipped horizontally', () => {

        let switchHorizontalMock =spyOn(service, 'switchHandlesHorizontal').and.callThrough();

        service.selectionStartPoint = { x: 10, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 10 + 30, y: 70 + 50 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 9;
        service.currenthandle=1;
        service.degres = 0;
        service.rectangleService.toSquare=true;
        service.flipedH=true;
        service.redrawSelection(false,true);
        expect(switchHorizontalMock).toHaveBeenCalled();
    });


    it('should call switchHandlesVertical if shift key is pressed while resizing and selection is flipped vertically', () => {

        let switchVerticalMock =spyOn(service, 'switchHandlesVertical').and.callThrough();
        service.rectangleService.toSquare=true;
        service.selectionStartPoint = { x: 10, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 10 + 30, y: 70 + 50 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 9;
        service.degres = 0;
        service.currenthandle=3;
        service.flipedV=true;
        service.redrawSelection(false,true);
        expect(switchVerticalMock).toHaveBeenCalled();
    });

    it('should call switchHandlesVertical and horizontal if shift key is pressed while resizing and selection is flipped in both directions', () => {

        let switchVerticalMock =spyOn(service, 'switchHandlesVertical').and.callThrough();
        let switchHorizontalMock =spyOn(service, 'switchHandlesHorizontal').and.callThrough();
        service.rectangleService.toSquare=true;
        service.selectionStartPoint = { x: 10, y: 70 };
        service.width = 30;
        service.height = 50;
        service.selectionEndPoint = { x: 10 + 30, y: 70 + 50 };
        service.updateResizingHandles();
        let currentPos = { x: 20, y: 42 };
        service.offsetX = currentPos.x - service.selectionStartPoint.x;
        service.offsetY = currentPos.y - service.selectionStartPoint.y;
        Movable.magnetismAnchorPoint = 9;
        service.degres = 0;
        service.currenthandle=5;
        service.flipedV=true;
        service.flipedH=true;
        service.redrawSelection(false,true);
        expect(switchVerticalMock).toHaveBeenCalled();
        expect(switchHorizontalMock).toHaveBeenCalled();
    });


    it('clearPreview should call drawing service clear canvas', () => {

        //let clearPreviewMock =spyOn(drawServiceSpy. 'clearCanvas').and.callThrough();
        service.clearPreview()
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();

    });




});
