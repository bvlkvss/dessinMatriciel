/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { LineCommand } from '@app/classes/lineCommand';
import { ResizeCommand } from '@app/classes/resizeCommand';
import { Vec2 } from '@app/classes/vec2';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
//import { ResizingService } from '@app/services/resizing/resizing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { BrushCommand } from '../../classes/brushCommand';
import { EllipseCommand } from '../../classes/ellipseCommand';
import { PencilCommand } from '../../classes/pencilCommand';
import { RectangleCommand } from '../../classes/rectangleCommand';
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
  let ResizeCommandStub: ResizeCommand;
  let pathData: Vec2[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 3 }];
  let pencilStub: PencilService;
  let brushStub: BrushService;
  let rectangleStub: RectangleService;
  let ellipseStub: EllipseService;
  let lineStub: LineService;
  let resizeStub: ResizingService;
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

  it('should call undoLast if shortcut ctrl+z is pressed and undo-redo is allowed', () => {
    service.setIsAllowed(true);
    service.onKeyDown(shortCutUndo);
    expect(undoLastSpy).toHaveBeenCalled();
  });

  it('shoudl call redoPrev if shortcut ctrl+shift+z is pressed and undo-redo is allowed', () => {
    service.setIsAllowed(true);
    service.onKeyDown(shortCutRedo);
    expect(redoPrevSpy).toHaveBeenCalled();
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
    expect(ResizeCommandStub.preview !== tmp && ResizeCommandStub.preview === tmp2).toBeTruthy;
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

});
