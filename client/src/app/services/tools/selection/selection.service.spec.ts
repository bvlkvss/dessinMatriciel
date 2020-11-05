/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
//import { RectangleService } from '../rectangle/rectangle.service';
import { SelectionService } from './selection.service';

describe('SelectionService', () => {
  let service: SelectionService;
  let mouseEvent: MouseEvent;
  let drawServiceSpy: jasmine.SpyObj<DrawingService>;

  let baseCtxStub: CanvasRenderingContext2D;
  let previewCtxStub: CanvasRenderingContext2D;
  let canvasStub: HTMLCanvasElement;
  //let drawRectangleSpy: jasmine.Spy<any>;

  beforeEach(() => {
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
    let tempCanvas: HTMLCanvasElement = document.createElement("canvas");
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
    let rectSpy = spyOn((service as any).drawingService.previewCtx, "rect");
    service.drawResizingHandles();
    expect(rectSpy).toHaveBeenCalledTimes(8);
  });

  it('mousedownonhandle should return number of handle if mouse is down on handle', () => {
    //start point is the handle #1 so the method should return 1
    service.selectionStartPoint = { x: 15, y: 20 };
    let mouseDownPos = { x: 15, y: 20 };
    service.rectangleService.width = 100;
    service.rectangleService.height = 50;
    service.updateResizingHandles();
    expect(service.mouseDownOnHandle(mouseDownPos)).toEqual(1);
  });
  it('mousedownonhandle should return -1 if mouse isnt down on anyhandle', () => {
    //start point is the handle #1 so the method should return 1
    service.selectionStartPoint = { x: 15, y: 20 };
    let mouseDownPos = { x: 15, y: 25 };
    service.rectangleService.width = 100;
    service.rectangleService.height = 50;
    service.updateResizingHandles();
    expect(service.mouseDownOnHandle(mouseDownPos)).toEqual(-1);
  });
  it('selectAllCanvas should saveselection with canvas height and width', () => {
    let tempCanvas: HTMLCanvasElement = document.createElement("canvas");
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

  it('moveSelection should call eraseSelectionFromBase if its the first move', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let eraseSelectionFromBaseSpy = spyOn((service as any), "eraseSelectionFromBase");
    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.firstSelectionMove = true;
    let currentPos = { x: 30, y: 20 };

    service.moveSelection(currentPos);

    expect(eraseSelectionFromBaseSpy).toHaveBeenCalled();

  });

  it('moveSelection should not call eraseSelectionFromBase if its the first move', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let eraseSelectionFromBaseSpy = spyOn((service as any), "eraseSelectionFromBase");
    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.firstSelectionMove = false;
    let currentPos = { x: 30, y: 20 };

    service.moveSelection(currentPos);

    expect(eraseSelectionFromBaseSpy).not.toHaveBeenCalled();

  });

  it('moveSelection should clip image', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let eraseSelectionMock = spyOn((service as any), "eraseSelectionFromBase");
    eraseSelectionMock.and.callFake(function () {
    });
    let clipMock = spyOn((service as any).drawingService.previewCtx, "clip");

    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    let currentPos = { x: 30, y: 20 };
    service.firstSelectionMove = false;

    service.moveSelection(currentPos);

    expect(clipMock).toHaveBeenCalled();

  });

  it('should call moveSelection', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionMock = spyOn((service as any), "moveSelection");


    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 30, y: 20 };
    service.selectionEndPoint = { x: 70, y: 35 };

    service.moveSelectionWithKeys();

    expect(moveSelectionMock).toHaveBeenCalled();

  });

  it('should add 3 to x coordinates of selectionStartPos and selectionEndPos on ArrowRight', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionMock = spyOn((service as any), "moveSelection");


    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 30, y: 20 };
    service.selectionEndPoint = { x: 70, y: 35 };
    service.keysDown["ArrowRight"] = true;

    service.moveSelectionWithKeys();

    expect(moveSelectionMock).toHaveBeenCalled();
    expect(service.selectionStartPoint.x).toEqual(33);

  });

  it('should substract 3 to y coordinates of selectionStartPos and selectionEndPos on ArrowUp', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionMock = spyOn((service as any), "moveSelection");


    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 46, y: 45 };
    service.selectionEndPoint = { x: 26, y: 55 };
    service.keysDown["ArrowUp"] = true;

    service.moveSelectionWithKeys();

    expect(moveSelectionMock).toHaveBeenCalled();
    expect(service.selectionStartPoint.y).toEqual(42);

  });

  it('should add 3 to y coordinates of selectionStartPos and selectionEndPos on ArrowDown', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionMock = spyOn((service as any), "moveSelection");


    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 46, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.keysDown["ArrowDown"] = true;

    service.moveSelectionWithKeys();

    expect(moveSelectionMock).toHaveBeenCalled();
    expect(service.selectionStartPoint.y).toEqual(69);

  });

  it('should sub 3 to x coordinates of selectionStartPos and selectionEndPos on ArrowLeft', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let moveSelectionMock = spyOn((service as any), "moveSelection");


    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 5, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.keysDown["ArrowLeft"] = true;

    service.moveSelectionWithKeys();

    expect(moveSelectionMock).toHaveBeenCalled();
    expect(service.selectionStartPoint.x).toEqual(2);

  });

  it('onMouseDown should change mousedown inside selection to true if mousedown coords is inside the selection and its active', () => {

    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionWithKeysMock = spyOn((service as any), "moveSelectionWithKeys");
    moveSelectionWithKeysMock.and.callFake(function () {
    });

    service.rectangleService.width = 60;
    service.rectangleService.height = 50;
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 5, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.currenthandle = 1;
    service.selectionActivated = true;
    service.mouseDown = true;

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


  it('onMouseDown should not change mousedown inside selection to true if mousedown coords is outside the selection and its active', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionWithKeysMock = spyOn((service as any), "moveSelectionWithKeys");
    moveSelectionWithKeysMock.and.callFake(function () {
    });



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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionWithKeysMock = spyOn((service as any), "moveSelectionWithKeys");
    moveSelectionWithKeysMock.and.callFake(function () {
    });



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
      offsetX: service.selectionEndPoint.x,
      offsetY: service.selectionEndPoint.y,
      button: 0,
    } as MouseEvent;

    service.updateResizingHandles();

    service.onMouseDown(mouseDownEvent);
    expect(service.currenthandle).toEqual(8);


  });

  it('onMouseDown should not change current handle if the mouse is down on a resizingHandle', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });




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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

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


  it('onMouseDown should call clipImageWithEllipse if selection is cofirmed and selection style is ellipse', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });



    let clipImageWithEllipseSpy = spyOn((service as any), "clipImageWithEllipse");



    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 5, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.rectangleService.width = 26 - 5;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = -1;
    service.selectionActivated = true;
    service.selectionStyle = 1;

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
    expect(clipImageWithEllipseSpy).toHaveBeenCalled();


  });


  it('onMouseDown should not call clipImageWithEllipse if selection is cofirmed and selection style is not ellipse', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });



    let clipImageWithEllipseSpy = spyOn((service as any), "clipImageWithEllipse");



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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });



    let resetSelectionSpy = spyOn((service as any), "resetSelection");



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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });


    let resetSelectionSpy = spyOn((service as any), "resetSelection");



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

    let getPositionMock = spyOn((service as any), "getPositionFromMouse");
    getPositionMock.and.callFake(function () {
    });

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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 15, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.rectangleService.width = 26 - 15;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 3;
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
    expect(service.selectionStartPoint.y).toEqual(mouseMoveEvent.offsetY);
    expect(service.selectionEndPoint.x).toEqual(mouseMoveEvent.offsetX);
  });



  it('onMouseEnter should set isOut of rectangleService to false', () => {
    service.rectangleService.isOut = true;
    service.onMouseEnter(mouseEvent);
    expect(service.rectangleService.isOut).toBe(false);
  });

  it('selectionStartPoint.x should change to currentPos.x when resizing with handle #4 and selectionStartPoint.y shouldnt change', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    service.offsetX = 15;
    service.offsetY = 6;
    let initialStartPointy = 60;
    service.selectionStartPoint = { x: 15, y: initialStartPointy };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.rectangleService.width = 26 - 15;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 4;
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
    expect(service.selectionStartPoint.x).toEqual(mouseMoveEvent.offsetX);
    expect(service.selectionStartPoint.y).toEqual(initialStartPointy);
  });
  it('selectionEndPoint.x should change to currentPos.x when resizing with handle #5 and selectionEndPoint.y shouldnt change', () => {
    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    service.offsetX = 15;
    service.offsetY = 6;
    let initialEndPointy = 95;
    service.selectionStartPoint = { x: 15, y: 60 };
    service.selectionEndPoint = { x: 26, y: initialEndPointy };
    service.rectangleService.width = 26 - 15;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 5;
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
    expect(service.selectionEndPoint.x).toEqual(mouseMoveEvent.offsetX);
    expect(service.selectionEndPoint.y).toEqual(initialEndPointy);
  });


  it('selectionStartPoint.x should change to currentPos.x and selectionEndPoint.y to currentpos.y when resizing with handle #6', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 15, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.rectangleService.width = 26 - 15;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 6;
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
    expect(service.selectionEndPoint.y).toEqual(mouseMoveEvent.offsetY);
    expect(service.selectionStartPoint.x).toEqual(mouseMoveEvent.offsetX);
  });

  it('selectionEndPoint.y should change to currentPos.y when resizing with handle #7 and selectionEndPoint.x shouldnt change', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    service.offsetX = 15;
    service.offsetY = 6;
    let initialEndPointx = 26;
    service.selectionStartPoint = { x: 15, y: 60 };
    service.selectionEndPoint = { x: initialEndPointx, y: 95 };
    service.rectangleService.width = 26 - 15;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 7;
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
    expect(service.selectionEndPoint.y).toEqual(mouseMoveEvent.offsetY);
    expect(service.selectionEndPoint.x).toEqual(initialEndPointx);
  });

  it('selectionEndPoint should change to currentPos when resizing with handle #8', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let moveSelectionSpy = spyOn((service as any), "moveSelection");


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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 5, y: 66 };
    service.selectionEndPoint = { x: 26, y: 95 };
    service.rectangleService.width = 26 - 5;
    service.rectangleService.height = 95 - 66;
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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let rectServiceOnMouseMoveSpy = spyOn((service as any).rectangleService, "onMouseMove");
    rectServiceOnMouseMoveSpy.and.callFake(function () {
    });
    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });
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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let rectServiceOnMouseMoveSpy = spyOn((service as any).rectangleService, "onMouseMove");
    rectServiceOnMouseMoveSpy.and.callFake(function () {
    });

    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 5, y: 66 };
    service.rectangleService.width = 26 - 5;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 8;
    service.selectionActivated = false;
    service.rectangleService.isOut = false;
    service.selectionStyle = 0;
    service.mouseDown = true;


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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

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

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let saveSelectionSpy = spyOn((service as any), "saveSelection");
    let updateSelectionNodes = spyOn((service as any), "updateSelectionNodes");

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


  it('onMouseUp should call clipImageWithEllipse if selection style is with ellipse', () => {

    (service as any).drawingService.baseCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let clipImageWithEllipseSpy = spyOn((service as any), "clipImageWithEllipse");
    clipImageWithEllipseSpy.and.callFake(function () {
    });



    service.offsetX = 15;
    service.offsetY = 6;
    service.selectionStartPoint = { x: 5, y: 66 };
    service.rectangleService.width = 26 - 5;
    service.rectangleService.height = 95 - 66;
    service.currenthandle = 8;
    service.selectionActivated = false;
    service.selectionStyle = 1;
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
    expect(clipImageWithEllipseSpy).toHaveBeenCalled();


  });

  it('onkeyUp should call rectangle service KeyUp', () => {
    service.mouseDownCoord = { x: 6, y: 20 };
    service.currentPos = { x: 20, y: 54 };
    service.mouseDown = true;

    let rectServiceOnKeyUpSpy = spyOn((service as any).rectangleService, "onKeyUp");
    rectServiceOnKeyUpSpy.and.callFake(function () {
    });

    const event = new KeyboardEvent('document:keyup', {
      key: 'Shift',
      shiftKey: true,
    });

    service.onKeyUp(event);
    expect(rectServiceOnKeyUpSpy).toHaveBeenCalled();
  });

  it('onkeyUp should call draw ellipse if mouse is down and shiftKey is up', () => {
    service.mouseDownCoord = { x: 6, y: 20 };
    service.currentPos = { x: 20, y: 54 };
    service.mouseDown = true;

    let rectServiceOnKeyUpSpy = spyOn((service as any).rectangleService, "onKeyUp");
    rectServiceOnKeyUpSpy.and.callFake(function () {
    });

    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

    const event = new KeyboardEvent('document:keyup', {
      key: 'Shift',
      shiftKey: false,
    });

    service.onKeyUp(event);
    expect(ellipseServiceDrawSpy).toHaveBeenCalled();
  });

  it('onkeyUp should not call draw ellipse if mouse isnt down', () => {
    service.mouseDownCoord = { x: 6, y: 20 };
    service.currentPos = { x: 20, y: 54 };
    service.mouseDown = false;

    let rectServiceOnKeyUpSpy = spyOn((service as any).rectangleService, "onKeyUp");
    rectServiceOnKeyUpSpy.and.callFake(function () {
    });

    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

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
    let selectAllCanvas = spyOn((service as any), "selectAllCanvas");

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
    let selectAllCanvas = spyOn((service as any), "selectAllCanvas");

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
    let drawSelectionOnBaseSpy = spyOn((service as any), "drawSelectionOnBase");

    const event = new KeyboardEvent('document:keydown', {
      key: 'Escape',
    });

    service.onKeyDown(event);
    expect(drawSelectionOnBaseSpy).toHaveBeenCalled();
  });

  it('onKeyDown should call rectServiceKeyDown if key isnt escape or ctrl+a ', () => {
    service.mouseDownCoord = { x: 6, y: 20 };
    service.currentPos = { x: 20, y: 54 };
    service.mouseDown = true;
    service.selectionActivated = true;

    let rectServiceOnKeyDownSpy = spyOn((service as any).rectangleService, "onKeyDown");
    rectServiceOnKeyDownSpy.and.callFake(function () {
    });

    const event = new KeyboardEvent('document:keydown', {
      key: 'Shift',
      shiftKey: true,
    });

    service.onKeyDown(event);
    expect(rectServiceOnKeyDownSpy).toHaveBeenCalled();
  });


  it('onKeyDown should call drawEllipse if key is shift and mouse is down style is ellipse ', () => {
    service.mouseDownCoord = { x: 6, y: 20 };
    service.currentPos = { x: 20, y: 54 };
    service.mouseDown = true;
    service.selectionActivated = true;
    service.selectionStyle = 1;

    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

    const event = new KeyboardEvent('document:keydown', {
      key: 'Shift',
      shiftKey: true,
    });

    service.onKeyDown(event);
    expect(ellipseServiceDrawSpy).toHaveBeenCalled();
  });


  it('onKeyDown should call moveSelectionWithKey if key is an arrow ', () => {
    service.mouseDownCoord = { x: 6, y: 20 };
    service.currentPos = { x: 20, y: 54 };
    service.mouseDown = true;
    service.selectionActivated = true;
    service.selectionStyle = 1;

    let moveSelectionWithKeysSpy = spyOn((service as any), "moveSelectionWithKeys");


    const event = new KeyboardEvent('document:keydown', {
      key: 'ArrowLeft',
      shiftKey: true,
    });

    service.onKeyDown(event);
    expect(moveSelectionWithKeysSpy).toHaveBeenCalled();
  });

  it('onMouseOut should call rectService onMouseOut', () => {

    let rectServiceOnMouseOutSpy = spyOn((service as any).rectangleService, "onMouseOut");
    rectServiceOnMouseOutSpy.and.callFake(function () {
    });
    service.selectionStyle = 0;
    service.mouseDownCoord = { x: 6, y: 20 };
    service.mouseDown = true;
    service.isOut = false;
    service.onMouseOut(mouseEvent);
    expect(rectServiceOnMouseOutSpy).toHaveBeenCalled();
  });

  it('onMouseOut should call drawEllipse if selection isnt activated and mouse is down and selection is with ellipse', () => {

    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

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

    expect(service.selectionStartPoint).toEqual(initialEndPoint)
    expect(service.selectionEndPoint).toEqual(initialStartPoint);
  });

  it('moveSelectionWithKeys should delay by 500 if it isnt already in continuous movement', () => {
    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });
    let moveSelectionMock = spyOn((service as any), "moveSelection");
    moveSelectionMock.and.callFake(function () {

    });

    let delayMock = spyOn((service as any), "delay");
    delayMock.and.callFake(function () {

    });


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
    (service as any).drawingService.previewCtx.drawImage = jasmine.createSpy().and.callFake(function () {
    });

    let moveSelectionMock = spyOn((service as any), "moveSelection");
    moveSelectionMock.and.callFake(function () {

    });

    let delayMock = spyOn((service as any), "delay");
    delayMock.and.callFake(function () {

    });


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



    let ctxRectMock = spyOn((service as any).drawingService.baseCtx, "rect");


    service.rectangleService.width = 60;
    service.rectangleService.height = 50;

    service.selectionStartPoint = { x: 30, y: 20 };
    service.selectionEndPoint = { x: 70, y: 35 };
    service.selectionStyle = 0;

    service.eraseSelectionFromBase(service.selectionEndPoint);

    expect(ctxRectMock).toHaveBeenCalled();

  });

  it('eraseSelectionFromBase should call drawEllipse if selection is with ellipse', () => {



    let ellipseServiceDrawSpy = spyOn((service as any).ellipseService, "drawEllipse");
    ellipseServiceDrawSpy.and.callFake(function () {
    });

    service.rectangleService.width = 60;
    service.rectangleService.height = 50;

    service.selectionStartPoint = { x: 30, y: 20 };
    service.selectionEndPoint = { x: 70, y: 35 };
    service.selectionStyle = 1;

    service.eraseSelectionFromBase(service.selectionEndPoint);

    expect(ellipseServiceDrawSpy).toHaveBeenCalled();

  });




});
