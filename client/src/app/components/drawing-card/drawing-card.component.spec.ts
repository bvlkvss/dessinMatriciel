/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCard, MatCardActions, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Drawings } from '@app/components/carrousel/carrousel.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { of } from 'rxjs';
import { DrawingCardComponent } from './drawing-card.component';


describe('DrawingCardComponent', () => {
  let component: DrawingCardComponent;
  let mouseEvent: MouseEvent;
  let fixture: ComponentFixture<DrawingCardComponent>;
  let drawService: DrawingService;
  let baseCtxStub: CanvasRenderingContext2D;

  const drawingMock: Drawings = { name: 'mockname', tag: ['mocktag'], imageData: '' };
  beforeEach(async(() => {
    drawService = new DrawingService();
    baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    drawService.baseCtx = baseCtxStub;
    TestBed.configureTestingModule({
      declarations: [DrawingCardComponent, MatCard, MatCardHeader, MatCardTitle, MatCardActions, MatCardSubtitle],
      providers: [{ provide: DrawingService, useValue: drawService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingCardComponent);
    component = fixture.componentInstance;
    drawService.canvas = document.createElement('canvas');
    drawService.previewCanvas = drawService.canvas = document.createElement('canvas');
    drawingMock.imageData = drawService.canvas.toDataURL();
    component.drawing = drawingMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('onMouseMove should set mouseOver to true if index is 1', () => {
    component.drawingIndex = 1;
    expect(component.mouseOver).toEqual(false);
    component.onMouseMove(mouseEvent);
    expect(component.mouseOver).toEqual(true);
  });
  it('onMouseOut should set mouseOver to false if index is 1', () => {
    component.drawingIndex = 1;
    component.mouseOver = true;
    component.onMouseOut(mouseEvent);
    expect(component.mouseOver).toEqual(false);
  });
  it('delete should call emit function of deleteDrawing', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const emitSpy = spyOn(component.deleteDrawing, 'emit').and.callThrough();
    component.delete(drawingMock);
    expect(emitSpy).toHaveBeenCalled();
  });
  it('ngAfterViewChecked should call setImageSize ', () => {
    const spy = spyOn<any>(component, 'setImageSize').and.callThrough();
    component.ngAfterViewChecked();
    expect(spy).toHaveBeenCalled();
  });
  it('drawImage should call resizeCanvas and drawImage and clearRect', async () => {
    const clearSpy = spyOn(drawService.baseCtx, 'clearRect').and.stub();
    const drawImageSpy = spyOn(drawService.baseCtx, 'drawImage').and.stub();
    const resizeSpy = spyOn(DrawingCardComponent, 'resizeCanvas').and.stub();
    const image=new Image();
    spyOn(DrawingCardComponent, "getImage").and.returnValue(of(image));

    DrawingCardComponent.drawImage(drawService, 'test');
    expect(clearSpy).toHaveBeenCalled();
    expect(drawImageSpy).toHaveBeenCalled();
    expect(resizeSpy).toHaveBeenCalled();
    //global.Image = image;
  });
  it('onClick should call delete and set onDelete to true, if the click was over the button ', () => {
    const spy = spyOn(component, 'delete').and.stub();
    const button: HTMLElement = document.createElement('button');
    button.setAttribute('class', 'btn');
    const mouseEvent: any = { target: button };
    component.onClick(mouseEvent);
    expect(component.onDelete).toEqual(true);
    expect(spy).toHaveBeenCalled();
  });
  it('onClick should call  drawImage if drawingIndex is 1  and the user confirmed', () => {
    const button: HTMLElement = document.createElement('button');
    component.drawingIndex = 1;
    drawService.canvas = document.createElement('canvas');
    button.setAttribute('class', 'ok');
    const spy = spyOn(DrawingCardComponent, 'drawImage').and.stub();
    spyOn(window, 'confirm').and.returnValue(true);
    const mouseEvent: any = { target: button };
    component.onClick(mouseEvent);
    expect(spy).toHaveBeenCalled();
  });
  it('onClick should call  drawImage if drawingIndex is 1  there is no current drawing', () => {
    const button: HTMLElement = document.createElement('button');
    component.drawingIndex = 1;
    drawService.blankCanvasDataUrl = drawService.canvas.toDataURL();
    button.setAttribute('class', 'ok');
    const spy = spyOn(DrawingCardComponent, 'drawImage').and.stub();
    const mouseEvent: any = { target: button };
    component.onClick(mouseEvent);
    expect(spy).toHaveBeenCalled();
  });
  it('resizeCanvas should resize canvas to image size', () => {
    let img: HTMLImageElement = new Image();
    img.width = 100;
    img.height = 50;
    drawService.canvasContainer = document.createElement('div');
    DrawingCardComponent.resizeCanvas(img, (component as any).drawingService);
    expect(drawService.canvasContainer.style.width).toEqual('100px');
    expect(drawService.canvasContainer.style.height).toEqual('50px');
    expect(drawService.canvas.width).toEqual(100);
    expect(drawService.canvas.height).toEqual(50);
    expect(drawService.previewCanvas.width).toEqual(100);
    expect(drawService.previewCanvas.height).toEqual(50);
  });
  it('ngAfterViewChecked should change opacity  if drawingIndex is not 1', () => {
    let mockStyle: string = 'opacity: 0.3; pointer-events: none; ';
    component.drawingIndex = 0;
    let spy = spyOn(component.card.nativeElement.firstElementChild as HTMLElement, 'setAttribute').and.callThrough();
    component.ngAfterViewChecked();
    expect(spy).toHaveBeenCalled();
    expect(component.card.nativeElement.firstElementChild?.getAttribute('style')).toEqual(mockStyle);
  });
  it('ngAfterViewChecked should change opacity if drawingIndex is 1 and call setAttribute', () => {
    let mockStyle: string = 'opacity: 1';
    let spy = spyOn(component.card.nativeElement.firstElementChild as HTMLElement, 'setAttribute').and.callThrough();
    component.drawingIndex = 1;
    component.ngAfterViewChecked();
    expect(spy).toHaveBeenCalled();
    expect(component.card.nativeElement.firstElementChild?.getAttribute('style')).toEqual(mockStyle);
  });
  it('ngAfterViewChecked should put shadow if mouse is over and   drawingIndex is 1', () => {
    let mockStyle: string =
      '-webkit-box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75);-moz-box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75);box-shadow: 0px 0px 20px 3px rgba(63, 159, 190, 0.75); opacity:1';
    component.drawingIndex = 1;
    let spy = spyOn(component.card.nativeElement.firstElementChild as HTMLElement, 'setAttribute').and.callThrough();
    component.mouseOver = true;
    component.ngAfterViewChecked();
    expect(spy).toHaveBeenCalled();
    expect(component.card.nativeElement.firstElementChild?.getAttribute('style')).toEqual(mockStyle);
  });
  it('ngAfterViewChecked should not put shadow if mouse is not over and   drawingIndex is 1', () => {
    let mockStyle: string = 'opacity: 1';
    component.drawingIndex = 1;
    let spy = spyOn(component.card.nativeElement.firstElementChild as HTMLElement, 'setAttribute').and.callThrough();
    component.mouseOver = false;
    component.ngAfterViewChecked();
    expect(spy).toHaveBeenCalled();
    expect(component.card.nativeElement.firstElementChild?.getAttribute('style')).toEqual(mockStyle);
  });
});
