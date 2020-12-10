import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from './stamp.service';
/* tslint:disable */
describe('StampService', () => {
  let service: StampService;
  let mouseEvent: MouseEvent;
  let drawServiceSpy: jasmine.SpyObj<DrawingService>;

  let baseCtxStub: CanvasRenderingContext2D;
  let previewCtxStub: CanvasRenderingContext2D;

  beforeEach(() => {
    baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

    TestBed.configureTestingModule({
      providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
    });
    service = TestBed.inject(StampService);
    service['drawingService'].baseCtx = baseCtxStub;
    service['drawingService'].previewCtx = previewCtxStub;

    mouseEvent = {
      offsetX: 25,
      offsetY: 25,
      button: 0,
    } as MouseEvent;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setDegree should set degree   to correct value', () => {
    service.setDegree(50);
    expect(service.degres).toEqual(50);
  });
  it('setStampSize should set image width/height to correct value', () => {
    service.image = new Image();
    service.lineWidth = 100;
    service.setStampSize(5, 2);
    expect(service.image.width).toEqual(250);
    expect(service.image.height).toEqual(250);

  });
  it('setDegree should set image width/height to 9 if value is greater then 9', () => {
    service.image = new Image();
    service.lineWidth = 100;
    service.setStampSize(20, 20);
    expect(service.image.width).toEqual(100); //9/9
    expect(service.image.height).toEqual(100);

  });
  it('onMouseMove should call rotateStamp with correct arguments', () => {
    const rotateSpy = spyOn(service, 'rotateStamp').and.stub();
    service.onMouseMove(mouseEvent);
    expect(rotateSpy).toHaveBeenCalledWith(previewCtxStub, { x: 25, y: 25 });
  });
  it('onClick should call rotateStamp with correct arguments', () => {
    const rotateSpy = spyOn(service, 'rotateStamp').and.stub();
    service.onClick(mouseEvent);
    expect(rotateSpy).toHaveBeenCalledWith(baseCtxStub, { x: 25, y: 25 });
  });
  it('should call right methodes', () => {
    const saveSpy = spyOn(baseCtxStub, 'save').and.stub();
    const translateSpy = spyOn(baseCtxStub, 'translate').and.stub();
    const rotateSpy = spyOn(baseCtxStub, 'rotate').and.stub();
    const restoreSpy = spyOn(baseCtxStub, 'restore').and.stub();
    service.rotateStamp(baseCtxStub, { x: 200, y: 122 });
    expect(saveSpy).toHaveBeenCalled();
    expect(restoreSpy).toHaveBeenCalled();
    expect(rotateSpy).toHaveBeenCalled();
    expect(baseCtxStub.drawImage).toHaveBeenCalled();
    expect(translateSpy).toHaveBeenCalledWith(200, 122);

  });

  it('onMouseUp should call addToUndo and set isAllowed to true if this.mouseDown = true', () => {
    service.mouseDown = true;
    (service as any).invoker.addToUndo = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onMouseUp({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
    expect((service as any).invoker.addToUndo).toHaveBeenCalled();
    expect((service as any).invoker.getIsAllowed()).toEqual(true);
  });


  it('onMouseUp should call addToUndo if this.mouseDown = true', () => {
    service.mouseDown = false;
    (service as any).invoker.addToUndo = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onMouseUp({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
    expect((service as any).invoker.addToUndo).not.toHaveBeenCalled();
  });

  it('onMouseDown should call clearRedo and set isAllowed to false if button = 0', () => {
    (service as any).invoker.ClearRedo = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onMouseDown({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
    expect((service as any).invoker.ClearRedo).toHaveBeenCalled();
    expect((service as any).invoker.getIsAllowed()).toEqual(false);
  });

  it('onMouseDown should not call clearRedo if button = 1', () => {
    (service as any).invoker.ClearRedo = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onMouseDown({ offsetX: 1, offsetY: 1, button: 1 } as MouseEvent);
    expect((service as any).invoker.ClearRedo).not.toHaveBeenCalled();
  });

});
