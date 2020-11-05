/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from "@app/classes/color";
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PipetteService } from "./pipette.service";
describe('PipetteService', () => {
  let service: PipetteService;
  let mouseEvent: MouseEvent;
  let drawServiceSpy: jasmine.SpyObj<DrawingService>;
  let baseCtxStub: CanvasRenderingContext2D;
  let canvasStub: HTMLCanvasElement;
  let validateColorSpy: jasmine.SpyObj<any>;

  beforeEach(() => {
    canvasStub = canvasTestHelper.canvas;
    baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);


    TestBed.configureTestingModule({
      providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
    });
    service = TestBed.inject(PipetteService);
    validateColorSpy = spyOn<any>(service, 'validateColor').and.callThrough();
    service['drawingService'].canvas = canvasStub;
    service['drawingService'].baseCtx = baseCtxStub;
    service['drawingService'].canvas.width = canvasStub.width;
    service['drawingService'].canvas.height = canvasStub.height;
    service['drawingService'].baseCtx.canvas.width = baseCtxStub.canvas.width;
    service['drawingService'].baseCtx.canvas.height = baseCtxStub.canvas.height;


  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(' the rgba color returned should be equal to the rgba color from the created Data', () => {
    let imageData: ImageData = new ImageData(1, 1);
    imageData.data[0] = 255; // red
    imageData.data[1] = 20;// green
    imageData.data[2] = 200;// blue
    imageData.data[3] = 255; // opacity
    expect(service.getColorFromData(imageData)).toEqual({ red: 255, green: 20, blue: 200, opacity: 255 });
    imageData.data[0] = 0; // red
    imageData.data[1] = 0;// green
    imageData.data[2] = 200;// blue
    imageData.data[3] = 55; // opacity
    expect(service.getColorFromData(imageData)).toEqual({ red: 0, green: 0, blue: 200, opacity: 55 });
  });
  it(' it should convert the rgba color to the right hex color', () => {
    let rgbaColor: Color = { red: 255, green: 0, blue: 255, opacity: 255 };
    expect(service.rgbaToHex(rgbaColor)).not.toEqual("0000ffff");
    expect(service.rgbaToHex(rgbaColor)).toEqual("ff00ffff");


  });
  it(' rgbaToHex should call validateColor and if the color is undefinded it should throw an error', () => {
    let rgbaColor: Color = { red: 455, green: 40, blue: 255, opacity: 255 };
    // test with a wrong value, red is 455 and max value is 255.
    expect(function () { service.rgbaToHex(rgbaColor); }).toThrow();
    expect(validateColorSpy).toHaveBeenCalled();
    // negative value
    rgbaColor = { red: 0, green: -40, blue: 255, opacity: 255 };
    expect(function () { service.rgbaToHex(rgbaColor); }).toThrow();
    expect(validateColorSpy).toHaveBeenCalled();


  });
  it('setPrimaryColor should set primaryColor to correct value', () => {
    service.setPrimaryColor('#ababab');
    expect(service.primaryColor).toEqual('#ababab');
  });
  it('setSecondaryColor should set secondaryCOlor to correct value', () => {
    service.setSecondaryColor('#ababab');
    expect(service.secondaryColor).toEqual('#ababab');
  });

  it('onRightClick should call colorObservable.next(false)', done => {
    let obs: jasmine.SpyObj<any> = spyOn(service.colorObservable, "next").withArgs(false).and.callThrough();
    service.onRightClick(mouseEvent);
    done();
    expect(obs).toHaveBeenCalled();
  });

  it('onClick should call colorObservable.next(true)', done => {
    let obs: jasmine.SpyObj<any> = spyOn(service.colorObservable, "next").withArgs(true).and.callThrough();
    service.onClick(mouseEvent);
    done();
    expect(obs).toHaveBeenCalled();
  });
  it('onMouseMove should call pipetteObservable.next()', done => {
    let obs: jasmine.SpyObj<any> = spyOn(service.pipetteObservable, "next").and.callThrough();
    service.onMouseMove(mouseEvent);
    done();
    expect(obs).toHaveBeenCalled();
  });
  it('onMouseOut should call circleViewObservable.next', done => {
    let obs: jasmine.SpyObj<any> = spyOn(service.circleViewObservable, "next").and.callThrough();
    service.onMouseOut(mouseEvent);
    done();
    expect(obs).toHaveBeenCalled();
  });
  it('onMouseEnter should call circleViewObservable.next', done => {
    let obs: jasmine.SpyObj<any> = spyOn(service.circleViewObservable, "next").and.callThrough();
    service.onMouseEnter(mouseEvent);
    done();
    expect(obs).toHaveBeenCalled();
  });
});
