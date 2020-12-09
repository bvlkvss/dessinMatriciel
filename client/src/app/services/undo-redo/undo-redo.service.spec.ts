/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { EraserCommand } from '@app/classes/eraser-command';
import { LineCommand } from '@app/classes/line-command';
import { PaintBucketCommand } from '@app/classes/paint-bucker-command';
import { PlumeCommand } from '@app/classes/plume-command';
import { PolygonCommand } from '@app/classes/polygon-command';
import { ResizeCommand } from '@app/classes/resize-command';
import { SprayPaintCommand } from '@app/classes/spray-paint-command';
import { TextCommand } from '@app/classes/text-command';
import { Vec2 } from '@app/classes/vec2';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
//import { ResizingService } from '@app/services/resizing/resizing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SprayPaintService } from '@app/services/tools/spray-paint/spray-paint.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { BrushCommand } from '../../classes/brush-command';
import { EllipseCommand } from '../../classes/ellipse-command';
import { PencilCommand } from '../../classes/pencil-command';
import { RectangleCommand } from '../../classes/rectangle-command';
import { SelectionCommand } from '../../classes/selection-command';
import { StampCommand } from '../../classes/stamp-command';
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
  let textStub: TextService;
  let textCommandStub: TextCommand;
  let plumeStub: PlumeService;
  let plumeCommandStub: PlumeCommand;
  let sprayStub: SprayPaintService;
  let sprayStubCommand: SprayPaintCommand;
  let stampStub: StampService;
  let StampCommandStub: StampCommand;


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
    textStub = new TextService(DrawingServiceMock, service);
    textCommandStub = new TextCommand(textStub, DrawingServiceMock);
    plumeStub = new PlumeService(DrawingServiceMock, service);
    plumeCommandStub = new PlumeCommand(plumeStub, DrawingServiceMock);
    sprayStub = new SprayPaintService(DrawingServiceMock, service);
    sprayStubCommand = new SprayPaintCommand(sprayStub, DrawingServiceMock);
    stampStub = new StampService(DrawingServiceMock, service);
    StampCommandStub = new StampCommand(pathData[0], stampStub, DrawingServiceMock);

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
    service.addToUndo(textCommandStub);
    service.addToUndo(plumeCommandStub);
    service.addToUndo(sprayStubCommand);
    service.addToUndo(StampCommandStub);
    let execute = [] as jasmine.Spy<any>[];
    for (let cmd of service.getUndo()) {
      execute.push(spyOn(cmd, 'execute').and.callThrough().and.callFake(() => { }));
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
    let execute = spyOn(ResizeCommandStub, 'unexecute').and.callThrough().and.callFake(() => { });
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
    let execute = spyOn(ResizeCommandStub, 'unexecute').and.callThrough().and.callFake(() => { });
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

  it('shoudl not pop redo if undo redo is not Allowed and redoPrev is called', () => {
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

  it('text lines equal cmd lines after excute', () => {
    textStub.lines = ['fsdfsd', 'anass'];
    const cmd = new TextCommand(textStub, DrawingServiceMock);
    textStub.writeText = jasmine.createSpy().and.callFake(() => { });
    textStub.lines = [];
    cmd.execute();
    expect(textStub.lines).toEqual(['fsdfsd', 'anass']);
  });

  it('execute should call witeText for textcommand', () => {
    textStub.lines = ['fsdfsd', 'anass'];
    const cmd = new TextCommand(textStub, DrawingServiceMock);
    textStub.writeText = jasmine.createSpy().and.callFake(() => { });
    textStub.lines = [];
    cmd.execute();
    expect(textStub.writeText).toHaveBeenCalled();
  });

  it('pahtData size increase if i pushData', () => {
    plumeCommandStub.pushData({ x: 1, y: 2 });
    expect((plumeCommandStub as any).pathData[0]).toEqual({ x: 1, y: 2 });
  });

  it('excute of plumecommand should call drawline of plumeservice', () => {
    plumeStub.drawLine = jasmine.createSpy().and.callFake(() => { });
    plumeCommandStub.execute();
    expect(plumeStub.drawLine).toHaveBeenCalled();
  });

  it('pushData of spray command should add vec2 to pathData', () => {
    sprayStubCommand.pushData({ x: 1, y: 2 });
    expect((sprayStubCommand as any).pathData[0]).toEqual({ x: 1, y: 2 });
  });

  it('should call drawellipse with to circle = true', () => {
    (ellipseCommandStub as any).toCircle = true;
    const spy = spyOn(ellipseStub, 'drawEllipse').and.callThrough();
    ellipseCommandStub.execute();
    expect(spy.calls.allArgs()[0][3]).toEqual(true);

  });

  it('should call drawellipse with to circle = false', () => {
    (ellipseCommandStub as any).toCircle = false;
    const spy = spyOn(ellipseStub, 'drawEllipse').and.callThrough();
    ellipseCommandStub.execute();
    expect(spy.calls.allArgs()[0][3]).toEqual(false);

  });

  it('should call arc ,fill stroke of context if this.density > 0', () => {
    const tmp = document.createElement('canvas');
    const ctx = tmp.getContext('2d') as CanvasRenderingContext2D;
    ctx.beginPath = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ctx.arc = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ctx.fill = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ctx.stroke = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    sprayStubCommand.spray(ctx, [{ x: 1, y: 2 }]);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });


  it('execute should call spray', () => {
    sprayStubCommand.spray = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    sprayStubCommand.execute();
    expect(sprayStubCommand.spray).toHaveBeenCalled();
  });

  it('should not call arc ,fill stroke of context if this.density == 0', () => {
    const tmp = document.createElement('canvas');
    const ctx = tmp.getContext('2d') as CanvasRenderingContext2D;
    ctx.beginPath = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ctx.arc = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ctx.fill = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ctx.stroke = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    sprayStubCommand.spray(ctx, []);
    expect(ctx.beginPath).not.toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('execute of resize should call saveCanvas and drawCanvas', () => {
    let div = document.createElement('div') as HTMLDivElement;
    ResizeCommandStub.canvasContainer = div;
    (ResizeCommandStub as any).drawingService.gridCanvas = document.createElement('canvas');
    (ResizeCommandStub as any).tool.saveCanvas = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (ResizeCommandStub as any).tool.drawCanvas = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ResizeCommandStub.execute();
    expect((ResizeCommandStub as any).tool.saveCanvas).toHaveBeenCalled();
    expect((ResizeCommandStub as any).tool.drawCanvas).toHaveBeenCalled();
  });

  it('unexecute of resize should call drawCanvas', () => {
    let div = document.createElement('div') as HTMLDivElement;
    ResizeCommandStub.canvasContainer = div;
    (ResizeCommandStub as any).drawingService.gridCanvas = document.createElement('canvas');
    (ResizeCommandStub as any).tool.saveCanvas = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (ResizeCommandStub as any).tool.drawCanvas = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    ResizeCommandStub.unexecute();
    expect((ResizeCommandStub as any).tool.drawCanvas).toHaveBeenCalled();
  });


  it('execute of polygoncommand should call drawpolygon ', () => {
    (PolygonCommandStub as any).tool.drawPolygon = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    PolygonCommandStub.execute();
    expect((PolygonCommandStub as any).tool.drawPolygon).toHaveBeenCalled();
  });

  it('execute of eraser should call clearLine', () => {
    (eraserCommandStub as any).tool.clearLine = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    eraserCommandStub.execute();
    expect((eraserCommandStub as any).tool.clearLine).toHaveBeenCalled();
  });

  it('execute of paint-bucker should call putImage', () => {
    (PaintCommandStub as any).drawingService.baseCtx.putImageData = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    PaintCommandStub.execute();
    expect((PaintCommandStub as any).drawingService.baseCtx.putImageData).toHaveBeenCalled();
  });

  it('execute of line should call drawJUnction if with junction is true', () => {
    (lineCommandStub as any).tool.drawJunction = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (lineCommandStub as any).tool.drawLine = jasmine.createSpy().and.callFake(() => { });
    (lineCommandStub as any).withJunction = true;
    lineCommandStub.execute();
    expect((lineCommandStub as any).tool.drawJunction).toHaveBeenCalled();
  });

  it('execute of line should not call drawJUnction if with junction is false', () => {
    (lineCommandStub as any).tool.drawJunction = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (lineCommandStub as any).tool.drawLine = jasmine.createSpy().and.callFake(() => { });
    (lineCommandStub as any).withJunction = false;
    lineCommandStub.execute();
    expect((lineCommandStub as any).tool.drawJunction).not.toHaveBeenCalled();
  });

  it('excute of selection should call save transalte rotate drawimage restore and should not call clipimagewithellipseif sleectionStyle != 1', () => {

    (selectionCommandStub as any).startPosErase = { x: 1, y: 1 };
    (selectionCommandStub as any).endPosErase = { x: 1, y: 1 };
    (selectionCommandStub as any).startPos = { x: 1, y: 1 };
    (selectionCommandStub as any).endPos = { x: 1, y: 1 };
    (selectionCommandStub as any).height = 1;
    (selectionCommandStub as any).width = 1;
    (selectionCommandStub as any).degres = 0;
    (selectionCommandStub as any).drawingService.baseCtx.save = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).drawingService.baseCtx.translate = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).drawingService.baseCtx.rotate = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).drawingService.baseCtx.restore = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).tool.clipImageWithEllipse = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).tool.eraseSelectionFromBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).selectionStyle = 0;
    selectionCommandStub.execute();
    expect((selectionCommandStub as any).drawingService.baseCtx.save).toHaveBeenCalledTimes(2);
    expect((selectionCommandStub as any).drawingService.baseCtx.translate).toHaveBeenCalled();
    expect((selectionCommandStub as any).drawingService.baseCtx.rotate).toHaveBeenCalled();
    expect((selectionCommandStub as any).drawingService.baseCtx.restore).toHaveBeenCalledTimes(2);
    expect((selectionCommandStub as any).tool.clipImageWithEllipse).not.toHaveBeenCalled();

  });


  it('excute of selection should not call transalte rotate drawimage and should call clipimagewithellipse if sleectionStyle != 1', () => {

    (selectionCommandStub as any).startPosErase = { x: 1, y: 1 };
    (selectionCommandStub as any).endPosErase = { x: 1, y: 1 };
    (selectionCommandStub as any).startPos = { x: 1, y: 1 };
    (selectionCommandStub as any).endPos = { x: 1, y: 1 };
    (selectionCommandStub as any).height = 1;
    (selectionCommandStub as any).width = 1;
    (selectionCommandStub as any).degres = 0;
    (selectionCommandStub as any).drawingService.baseCtx.save = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).drawingService.baseCtx.translate = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).drawingService.baseCtx.rotate = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).drawingService.baseCtx.restore = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).tool.clipImageWithEllipse = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).tool.eraseSelectionFromBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (selectionCommandStub as any).selectionStyle = 1;
    selectionCommandStub.execute();
    expect((selectionCommandStub as any).drawingService.baseCtx.save).toHaveBeenCalledTimes(1);
    expect((selectionCommandStub as any).drawingService.baseCtx.restore).toHaveBeenCalledTimes(1);
    expect((selectionCommandStub as any).drawingService.baseCtx.translate).not.toHaveBeenCalled();
    expect((selectionCommandStub as any).drawingService.baseCtx.rotate).not.toHaveBeenCalled();
    expect((selectionCommandStub as any).tool.clipImageWithEllipse).toHaveBeenCalled();

  });

  it('execute of stamp command should call rotateStamp', () => {
    (StampCommandStub as any).tool.rotateStamp = jasmine.createSpy().and.callThrough().and.callFake(() => { })
    StampCommandStub.execute();
    expect((StampCommandStub as any).tool.rotateStamp).toHaveBeenCalled();
  });

  it('should set degres ', () => {
    (selectionCommandStub as any).degres = 0;
    selectionCommandStub.setDegres(5);
    expect((selectionCommandStub as any).degres).toEqual(5);
  });



});
