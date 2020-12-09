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
  /**    this.drawingService.clearCanvas(this.drawingService.previewCtx);
      ctx.save();
      ctx.translate(centerPosition.x, centerPosition.y);
      ctx.rotate((this.degres * Math.PI) / 180);
      ctx.canvas.style.cursor = "none";
      ctx.drawImage(this.image, -this.image.width / 2, -this.image.width / 2, this.image.width, this.image.height);
      ctx.restore(); */

});
