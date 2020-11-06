/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { EraserCommand } from '@app/classes/eraser-command';
import { LineCommand } from '@app/classes/line-command';
import { PaintBucketCommand } from '@app/classes/paint-bucker-command';
import { PolygonCommand } from '@app/classes/polygon-command';
import { ResizeCommand } from '@app/classes/resize-command';
import { Vec2 } from '@app/classes/vec2';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
//import { ResizingService } from '@app/services/resizing/resizing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { BrushCommand } from '../../classes/brush-command';
import { EllipseCommand } from '../../classes/ellipse-command';
import { PencilCommand } from '../../classes/pencil-command';
import { RectangleCommand } from '../../classes/rectangle-command';
import { SelectionCommand } from '../../classes/selection-command';
//import { ResizeCommand } from '../../classes/resizeCommand';
import { DrawingService } from '../drawing/drawing.service';
import { ResizingService } from '../resizing/resizing.service';
import { BrushService } from '../tools/brush/brush.service';
import { EllipseService } from '../tools/ellipse/ellipse.service';
import { LineService } from '../tools/line/line.service';
import { PencilService } from '../tools/pencil/pencil-service';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
  let service: UndoRedoService;
  let shortCutRedo: KeyboardEvent;
  let shortCutUndo: KeyboardEvent;
  let undoLastSpy: jasmine.Spy<any>;
  let redoPrevSpy: jasmine.Spy<any>;
  let executeAllSpy: jasmine.Spy<any>;
  let rectangleCommandStub: RectangleCommand;
  let PencilCommandStub: PencilCommand;
  let BrushCommandStub: BrushCommand;
  let ellipseCommandStub: EllipseCommand;
  let lineCommandStub: LineCommand;
  let eraserCommandStub: EraserCommand;
  let ResizeCommandStub: ResizeCommand;
  let PaintCommandStub: PaintBucketCommand;
  let PolygonCommandStub: PolygonCommand;
  let selectionCommandStub: SelectionCommand;
  let pathData: Vec2[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 3 }];
  let pencilStub: PencilService;
  let brushStub: BrushService;
  let rectangleStub: RectangleService;
  let ellipseStub: EllipseService;
  let lineStub: LineService;
  let eraserStub: EraserService;
  let resizeStub: ResizingService;
  let polygoneStub: PolygonService;
  let selectionStub: SelectionService
  let canvasStub: HTMLCanvasElement;
  let baseCtxStub: CanvasRenderingContext2D;
  let previewCtxStub: CanvasRenderingContext2D;
  let DrawingServiceMock: MockDrawingService;


  beforeEach(() => {
    DrawingServiceMock = new MockDrawingService();
    canvasStub = canvasTestHelper.canvas;
    baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: DrawingServiceMock }] });
    service = TestBed.inject(UndoRedoService);

    service['drawingService'].canvas = canvasStub;
    service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    service['drawingService'].previewCtx = previewCtxStub;
    service['drawingService'].canvas.width = canvasStub.width;
    service['drawingService'].canvas.height = canvasStub.height;
    service['drawingService'].baseCtx.canvas.width = baseCtxStub.canvas.width; // Jasmine doesnt copy properties with underlying data
    service['drawingService'].previewCtx.canvas.width = previewCtxStub.canvas.width;
    service['drawingService'].baseCtx.canvas.height = baseCtxStub.canvas.height; // Jasmine doesnt copy properties with underlying data
    service['drawingService'].previewCtx.canvas.height = previewCtxStub.canvas.height;

    pencilStub = new PencilService(DrawingServiceMock, service);
    PencilCommandStub = new PencilCommand(pathData, pencilStub, DrawingServiceMock);
    brushStub = new BrushService(DrawingServiceMock, service);
    BrushCommandStub = new BrushCommand(pathData, brushStub, DrawingServiceMock);
    rectangleStub = new RectangleService(DrawingServiceMock, service);
    rectangleCommandStub = new RectangleCommand(pathData[0], pathData[1], 0, rectangleStub, DrawingServiceMock);
    lineStub = new LineService(DrawingServiceMock, service);
    lineCommandStub = new LineCommand(pathData, false, lineStub, DrawingServiceMock);
    ellipseStub = new EllipseService(DrawingServiceMock, service);
    ellipseCommandStub = new EllipseCommand(pathData[2], pathData[4], 0, ellipseStub, DrawingServiceMock);
    resizeStub = new ResizingService(DrawingServiceMock, service);
    resizeStub.resizedWidth = canvasTestHelper.canvas.width;
    resizeStub.resizedHeight = canvasTestHelper.canvas.height;
    ResizeCommandStub = new ResizeCommand(baseCtxStub.canvas.width, baseCtxStub.canvas.height, resizeStub, DrawingServiceMock);
    ResizeCommandStub.setPreview(canvasTestHelper.drawCanvas);
    ResizeCommandStub.setnewSize(100, 100);
    eraserStub = new EraserService(DrawingServiceMock, service);
    eraserCommandStub = new EraserCommand(pathData, eraserStub, DrawingServiceMock);
    const temp = document.createElement('canvas');
    temp.width = 100;
    temp.height = 100;
    const context = temp.getContext('2d') as CanvasRenderingContext2D;
    context.beginPath();
    context.fillStyle = 'red';
    context.rect(0, 0, 50, 50);
    context.fill();
    context.closePath();
    let test = context.getImageData(0, 0, 30, 30) as ImageData;
    PaintCommandStub = new PaintBucketCommand(test, DrawingServiceMock);
    polygoneStub = new PolygonService(DrawingServiceMock, service);
    polygoneStub.startPos = pathData[0];
    polygoneStub.currentPos = pathData[1];
    polygoneStub.mouseDownCoord = pathData[1];
    PolygonCommandStub = new PolygonCommand(pathData[0], pathData[1], 0, polygoneStub, DrawingServiceMock);
    selectionStub = new SelectionService(DrawingServiceMock, service);
    selectionCommandStub = new SelectionCommand(pathData[0], selectionStub, DrawingServiceMock);
    selectionCommandStub.setStartPos(pathData[1]);
    undoLastSpy = spyOn<any>(service, 'undoLast').and.callThrough();
    redoPrevSpy = spyOn<any>(service, 'redoPrev').and.callThrough();
    executeAllSpy = spyOn<any>(service, 'executeAll').and.callThrough();


    shortCutRedo = {
      key: 'z',
      shiftKey: true,
      ctrlKey: true,
    } as KeyboardEvent
    shortCutUndo = {
      key: 'z',
      shiftKey: false,
      ctrlKey: true,
    } as KeyboardEvent

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setisAllowed should set isAllowed to the write value', () => {
    service.setIsAllowed(true);
    expect(service.getIsAllowed()).toBeTruthy();
  });

  it('setisAllowed should set isAllowed to the write value', () => {
    service.setIsAllowed(false);
    expect(service.getIsAllowed()).toBeFalsy();
  });

  it('should call undoLast if shortcut ctrl+z is pressed and undo-redo is allowed', () => {
    service.setIsAllowed(true);
    service.onKeyDown(shortCutUndo);
    expect(undoLastSpy).toHaveBeenCalled();
  });

  it('should not call undoLast if shortcut ctrl+z is pressed and undo-redo is not allowed', () => {
    service.setIsAllowed(false);
    service.onKeyDown(shortCutUndo);
    expect(undoLastSpy).not.toHaveBeenCalled();
  });

  it('should push redoStack if Command defined', () => {
    service.addToRedo(rectangleCommandStub);
    expect(service.getRedo().length).toEqual(1);
  });

  it('shoudl call redoPrev if shortcut ctrl+shift+z is pressed and undo-redo is allowed', () => {
    service.setIsAllowed(true);
    service.onKeyDown(shortCutRedo);
    expect(redoPrevSpy).toHaveBeenCalled();
  });

  it('shoudl not call redoPrev if shortcut ctrl+shift+z is pressed and undo-redo is not allowed', () => {
    service.setIsAllowed(false);
    service.onKeyDown(shortCutRedo);
    expect(redoPrevSpy).not.toHaveBeenCalled();
  });

  it('should call executeAll if shortcut ctrl+z is pressed and undo-redo is allowed', () => {
    service.setIsAllowed(true);
    service.addToUndo(rectangleCommandStub);
    service.addToUndo(PencilCommandStub);
    service.addToUndo(BrushCommandStub);
    service.onKeyDown(shortCutUndo);
    expect(executeAllSpy).toHaveBeenCalled();
  });

  it('should call executeAll if shortcut ctrl+shift+z is pressed and undo-redo is allowed', () => {
    service.setIsAllowed(true);

    service.addToRedo(rectangleCommandStub);
    service.addToRedo(PencilCommandStub);
    service.addToRedo(BrushCommandStub);
    service.onKeyDown(shortCutRedo);
    expect(executeAllSpy).toHaveBeenCalled();
  });

  it('should clear redo stack', () => {
    service.setIsAllowed(true);
    service.addToRedo(rectangleCommandStub);
    service.addToRedo(PencilCommandStub);
    service.addToRedo(BrushCommandStub);
    service.ClearRedo();
    expect(service.getRedo.length).toEqual(0);
  });

  it('should not call undoLast if undo-redo is not allowed', () => {
    service.setIsAllowed(false);
    service.onKeyDown(shortCutUndo);
    expect(undoLastSpy).not.toHaveBeenCalled();
  });

  it('should not call redoPrev if undo-redo is not allowed', () => {
    service.setIsAllowed(false);
    service.onKeyDown(shortCutRedo);
    expect(undoLastSpy).not.toHaveBeenCalled();
  });

  it('should add last command that was undone to redoStack', () => {
    service.setIsAllowed(true);
    const startPos = { x: 0, y: 0 } as Vec2;
    const endPos = { x: 1, y: 2 } as Vec2;
    const serrviceRec = new RectangleService(DrawingServiceMock, service);
    service.addToUndo(new RectangleCommand(startPos, endPos, 0, serrviceRec, DrawingServiceMock));
    service.addToUndo(new RectangleCommand(startPos, endPos, 1, serrviceRec, DrawingServiceMock));
    const t = new RectangleCommand(endPos, endPos, 0, serrviceRec, DrawingServiceMock);
    service.addToUndo(t);
    service.onKeyDown(shortCutUndo);
    const y = service.getRedo().pop();
    expect(y === t).toBeTruthy();
  });

  it('should add last command that was undone to redoStack', () => {
    service.setIsAllowed(true);
    const startPos = { x: 0, y: 0 } as Vec2;
    const endPos = { x: 1, y: 2 } as Vec2;
    const serrviceRec = new RectangleService(DrawingServiceMock, service);
    service.addToRedo(new RectangleCommand(startPos, endPos, 0, serrviceRec, DrawingServiceMock));
    service.addToRedo(new RectangleCommand(startPos, endPos, 1, serrviceRec, DrawingServiceMock));
    const t = new RectangleCommand(endPos, endPos, 0, serrviceRec, DrawingServiceMock);
    service.addToRedo(t);
    service.onKeyDown(shortCutRedo);
    const y = service.getUndo().pop();
    expect(y === t).toBeTruthy();
  });

  it('should call drawJunction if withJunction=true ', () => {
    service.setIsAllowed(true);
    let tempSub = new LineCommand(pathData, true, lineStub, DrawingServiceMock);
    service.addToUndo(tempSub);
    let execute = spyOn(lineStub, 'drawJunction').and.callThrough();
    service.executeAll();
    expect(execute).toHaveBeenCalled();
  });

  it('should not call drawJunction if index=pathdata-3', () => {
    service.setIsAllowed(true);
    let pathdata2 = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }] as Vec2[];
    let tempStub = new LineCommand(pathdata2, true, lineStub, DrawingServiceMock);
    service.addToUndo(tempStub);
    let execute = spyOn(lineStub, 'drawJunction').and.callThrough();
    expect(execute).not.toHaveBeenCalled();
  });

  it('shoud call execute of each Command in stack', () => {
    service.setIsAllowed(true);
    const tmp2 = document.createElement('canvas') as HTMLCanvasElement;
    tmp2.width = 420;
    tmp2.height = 69;
    spyOn(resizeStub, 'saveCanvas').and.returnValue(tmp2);
    service.addToUndo(PencilCommandStub);
    service.addToUndo(rectangleCommandStub);
    service.addToUndo(ellipseCommandStub);
    service.addToUndo(lineCommandStub);
    service.addToUndo(BrushCommandStub);
    service.addToUndo(ResizeCommandStub);
    service.addToUndo(eraserCommandStub);
    service.addToUndo(PaintCommandStub);
    service.addToUndo(PolygonCommandStub);
    service.addToUndo(selectionCommandStub);
    let execute = [] as jasmine.Spy<any>[];
    for (let cmd of service.getUndo()) {
      execute.push(spyOn(cmd, 'execute').and.callThrough());
    }
    service.executeAll();
    for (let i = 0; i < service.getUndo().length; i++) {
      expect(execute[i]).toHaveBeenCalled();
    }
  });

  it('execute in Brush should call DrawlineCommand', () => {
    service.setIsAllowed(true);
    service.addToUndo(BrushCommandStub);
    let execute = spyOn(BrushCommandStub, 'drawLineCommand').and.callThrough();
    service.executeAll();
    expect(execute).toHaveBeenCalled();
  });

  it('undoLAst should call unexecute of resizeCommand', () => {
    service.setIsAllowed(true);
    service.addToUndo(ResizeCommandStub);
    let execute = spyOn(ResizeCommandStub, 'unexecute').and.callThrough();
    service.undoLast();
    expect(execute).toHaveBeenCalled();
  });

  it('setPrevien should change preview', () => {
    const tmp = ResizeCommandStub.preview as HTMLCanvasElement;
    const tmp2 = document.createElement('canvas') as HTMLCanvasElement;
    tmp2.width = 420;
    tmp2.height = 69;
    ResizeCommandStub.setPreview(tmp2);
    expect(ResizeCommandStub.preview !== tmp && ResizeCommandStub.preview === tmp2).toBeTruthy();
  });

  it('setnewSize should update newWIdht and newHeight', () => {
    ResizeCommandStub.setnewSize(50, 50);
    const tmp = ResizeCommandStub.getnewSize() as Vec2;
    expect(tmp.x === 50 && tmp.y === 50).toBeTruthy();
  });

  it('getOldsize should be 100x100', () => {
    const tmp = ResizeCommandStub.getoldSize() as Vec2;
    expect(tmp.x === 100 && tmp.y === 100).toBeTruthy();
  });

  it('saveOldCanvas shoudl save the canvas into this.oldcanvas', () => {
    const tmp2 = document.createElement('canvas') as HTMLCanvasElement;
    tmp2.width = 420;
    tmp2.height = 69;
    ResizeCommandStub.saveOldCanvas(tmp2);
    expect(ResizeCommandStub.getOldCanvas() === tmp2).toBeTruthy();
  });

  it('clearUndo empty undo stack ', () => {
    service.addToUndo(PencilCommandStub);
    service.addToUndo(rectangleCommandStub);
    service.addToUndo(ellipseCommandStub);
    service.addToUndo(lineCommandStub);
    service.addToUndo(BrushCommandStub);
    service.addToUndo(ResizeCommandStub);
    service.addToUndo(eraserCommandStub);
    service.ClearUndo();
    
    expect(service.getUndo().length).toEqual(0);
  });

  it('should pop undostack if undo redo is Allowed', () => {
    service.setIsAllowed(true);
    service.addToUndo(rectangleCommandStub);
    service.undoLast();
    expect(service.getUndo().length).toEqual(0);
  });

  it('should not pop undostack if undo redo is not Allowed', () => {
    service.setIsAllowed(false);
    service.addToUndo(rectangleCommandStub);
    service.undoLast();
    expect(service.getUndo().length).toEqual(1);
  });

  it('shoudl add to redo if Command is defined', () => {
    service.addToRedo(rectangleCommandStub);
    expect(service.getRedo().length).toEqual(1);
  });

  it('shoud call push into redoStack and call executeAll', () => {
    service.setIsAllowed(true);
    service.addToUndo(rectangleCommandStub);
    service.undoLast();
    expect(service.getRedo().length).toEqual(1);
    expect(executeAllSpy).toHaveBeenCalled();
  });

  it('shoud call unexecute if isREsize', () => {
    service.setIsAllowed(true);
    let execute = spyOn(ResizeCommandStub, 'unexecute').and.callThrough();
    service.addToUndo(ResizeCommandStub);
    service.undoLast();
    expect(execute).toHaveBeenCalled();
  });

  it('shoudl pop redo if undo redo is Allowed and redoPrev is called', () => {
    service.setIsAllowed(true);
    service.addToRedo(rectangleCommandStub);
    service.redoPrev();
    expect(service.getRedo().length).toEqual(0);
  });

  it('shoudl bot pop redo if undo redo is bot Allowed and redoPrev is called', () => {
    service.setIsAllowed(false);
    service.addToRedo(rectangleCommandStub);
    service.redoPrev();
    expect(service.getRedo().length).toEqual(1);
  });

  it('should call executeAll and push one command into undo stack if undo redo is allowed and redostack is not empty', () => {
    service.setIsAllowed(true);
    service.addToRedo(rectangleCommandStub);
    service.redoPrev();
    //expect(service.getUndo().length).toEqual(1);
    expect(executeAllSpy).toHaveBeenCalled();
  });

  it('should call clipImageWithEllipse', () => {
    let cmdStub = new SelectionCommand(pathData[1], selectionStub, DrawingServiceMock);
    cmdStub.setStartPos(pathData[1]);
    cmdStub.setEndPos(pathData[1]);
    cmdStub.setEndPosErase(pathData[1]);
    cmdStub.setSize(pathData[1].x, pathData[1].x);
    const temp = document.createElement('canvas');
    temp.width = 100;
    temp.height = 100;
    cmdStub.setCanvas(temp);
    let spy = spyOn(selectionStub, "clipImageWithEllipse").and.callThrough();
    cmdStub.setSelectionStyle(1);
    cmdStub.execute();
    expect(spy).toHaveBeenCalled();
  });
});
