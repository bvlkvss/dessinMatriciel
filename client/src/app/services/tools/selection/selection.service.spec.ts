import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { RectangleService } from '../rectangle/rectangle.service';

import { SelectionService } from './selection.service';

describe('SelectionService', () => {
  let service: SelectionService;
  let mouseEvent: MouseEvent;
  let drawServiceSpy: jasmine.SpyObj<DrawingService>;

  let baseCtxStub: CanvasRenderingContext2D;
  let previewCtxStub: CanvasRenderingContext2D;
  let canvasStub: HTMLCanvasElement;
  // let drawRectangleSpy: jasmine.Spy<any>;

  beforeEach(() => {
      canvasStub = canvasTestHelper.canvas;
      baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
      previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
      drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

      TestBed.configureTestingModule({
          providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
      });
      service = TestBed.inject(SelectionService);
      // drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();

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
      let tempCanvas:HTMLCanvasElement = document.createElement("canvas");
      service.selectionData = tempCanvas;
      service.selectionStartPoint = {x:0,y:0};
      service.saveSelection();
      expect(service.selectionData).not.toEqual(tempCanvas);    
  });


  it('should call rect the number of resizing handles we have', () => {
    service.selectionStartPoint = {x:0,y:0};
    service.rectangleService.width=100;
    service.rectangleService.height=50;
    service.updateResizingHandles();
    let rectSpy = spyOn((service as any).drawingService.previewCtx, "rect");
    service.drawResizingHandles();
    expect(rectSpy).toHaveBeenCalledTimes(8);
});

it('mousedownonhandle should return number of handle if mouse is down on handle', () => {
  // start point is the handle #1 so the method should return 1
  service.selectionStartPoint = {x:15,y:20};
  let mouseDownPos={x:15,y:20};
  service.rectangleService.width=100;
  service.rectangleService.height=50;
  service.updateResizingHandles();
  expect(service.mouseDownOnHandle(mouseDownPos)).toEqual(1);
});
it('mousedownonhandle should return -1 if mouse isnt down on anyhandle', () => {
  // start point is the handle #1 so the method should return 1
  service.selectionStartPoint = {x:15,y:20};
  let mouseDownPos={x:15,y:25};
  service.rectangleService.width=100;
  service.rectangleService.height=50;
  service.updateResizingHandles();
  expect(service.mouseDownOnHandle(mouseDownPos)).toEqual(-1);
});
it('selectAllCanvas should saveselection with canvas height and width', () => {
  let tempCanvas:HTMLCanvasElement = document.createElement("canvas");
  service.selectionData = tempCanvas;

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });
  service.selectAllCanvas();



  expect(service.selectionData.width).toEqual(100);
  expect(service.selectionData.height).toEqual(100);

});

it('resizing handles should change when selectionstartpoint changes', () => {

  service.selectionStartPoint = {x:16,y:21};
  service.updateResizingHandles();
  let handlesBeforeUpdate=(service as any).resizingHandles;
  
  service.selectionStartPoint = {x:17,y:21};
  service.updateResizingHandles();


  expect((service as any).resizingHandles).not.toBe(handlesBeforeUpdate);
});

it('resizing handles should not change when selectionstartpoint changes', () => {

  service.selectionStartPoint = {x:16,y:21};
  service.updateResizingHandles();
  let handlesBeforeUpdate=(service as any).resizingHandles;
  
  service.selectionStartPoint = {x:16,y:21};
  service.updateResizingHandles();


  expect((service as any).resizingHandles).toEqual(handlesBeforeUpdate);
});

it('moveSelection should call eraseSelectionFromBase if its the first move', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });
  let eraseSelectionFromBaseSpy = spyOn((service as any), "eraseSelectionFromBase");
  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.firstSelectionMove=true;
  let currentPos={x:30,y:20};

  service.moveSelection(currentPos);
  
  expect(eraseSelectionFromBaseSpy).toHaveBeenCalled();

});

it('moveSelection should not call eraseSelectionFromBase if its the first move', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });
  let eraseSelectionFromBaseSpy = spyOn((service as any), "eraseSelectionFromBase");
  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.firstSelectionMove=false;
  let currentPos={x:30,y:20};

  service.moveSelection(currentPos);
  
  expect(eraseSelectionFromBaseSpy).not.toHaveBeenCalled();

});

it('moveSelection should clip image', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let eraseSelectionMock = spyOn((service as any), "eraseSelectionFromBase");
  eraseSelectionMock.and.callFake(function() {
  });
  let clipMock = spyOn((service as any).drawingService.previewCtx, "clip");

  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  let currentPos={x:30,y:20};
  service.firstSelectionMove=false;

  service.moveSelection(currentPos);
  
  expect(clipMock).toHaveBeenCalled();

});

it('should call moveSelection', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionMock = spyOn((service as any), "moveSelection");


  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:30,y:20};
  service.selectionEndPoint={x:70,y:35};

  service.moveSelectionWithKeys();
  
  expect(moveSelectionMock).toHaveBeenCalled();

});

it('should add 3 to x coordinates of selectionStartPos and selectionEndPos on ArrowRight', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionMock = spyOn((service as any), "moveSelection");


  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:30,y:20};
  service.selectionEndPoint={x:70,y:35};
  service.keysDown["ArrowRight"]=true;

  service.moveSelectionWithKeys();
  
  expect(moveSelectionMock).toHaveBeenCalled();
  expect(service.selectionStartPoint.x).toEqual(33);

});

it('should substract 3 to y coordinates of selectionStartPos and selectionEndPos on ArrowUp', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionMock = spyOn((service as any), "moveSelection");


  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:46,y:45};
  service.selectionEndPoint={x:26,y:55};
  service.keysDown["ArrowUp"]=true;

  service.moveSelectionWithKeys();
  
  expect(moveSelectionMock).toHaveBeenCalled();
  expect(service.selectionStartPoint.y).toEqual(42);

});

it('should add 3 to y coordinates of selectionStartPos and selectionEndPos on ArrowDown', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionMock = spyOn((service as any), "moveSelection");


  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:46,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.keysDown["ArrowDown"]=true;

  service.moveSelectionWithKeys();
  
  expect(moveSelectionMock).toHaveBeenCalled();
  expect(service.selectionStartPoint.y).toEqual(69);

});

it('should sub 3 to x coordinates of selectionStartPos and selectionEndPos on ArrowLeft', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionMock = spyOn((service as any), "moveSelection");


  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.keysDown["ArrowLeft"]=true;

  service.moveSelectionWithKeys();
  
  expect(moveSelectionMock).toHaveBeenCalled();
  expect(service.selectionStartPoint.x).toEqual(2);

});

it('onMouseDown should change mousedown inside selection to true if mousedown coords is inside the selection and its active', () => {

  let drawImageMock = spyOn((service as any).drawingService.previewCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionWithKeysMock = spyOn((service as any), "moveSelectionWithKeys");
  moveSelectionWithKeysMock.and.callFake(function() {
  });

  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.currenthandle=1;
  service.selectionActivated=true;

  // initial state is false, should turn to true;
  service.mouseDownInsideSelection=false;
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

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionWithKeysMock = spyOn((service as any), "moveSelectionWithKeys");
  moveSelectionWithKeysMock.and.callFake(function() {
  });



  service.rectangleService.width=60;
  service.rectangleService.height=50;
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.currenthandle=1;
  service.selectionActivated=true;

  // initial state is false, should stay false;
  service.mouseDownInsideSelection=false;
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

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  let moveSelectionWithKeysMock = spyOn((service as any), "moveSelectionWithKeys");
  moveSelectionWithKeysMock.and.callFake(function() {
  });


 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
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

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });



 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
  let mouseDownEvent = {
    // out of canvas bounds
    offsetX: 103,
    offsetY: 200,
    button: 0,
  } as MouseEvent;
  
  service.updateResizingHandles();

  service.onMouseDown(mouseDownEvent);
  expect(service.currenthandle).toEqual(-1);


});


it('onMouseDown should draw image on baseCtx if selection is activated and mouseDownCoords is out of selection', () => {

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });




 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
  let mouseDownEvent = {
    // out of canvas bounds
    offsetX: 3,
    offsetY: 70,
    button: 0,
  } as MouseEvent;
  
  service.updateResizingHandles();

  service.onMouseDown(mouseDownEvent);
  expect(drawImageMock).toHaveBeenCalled();


});


it('onMouseDown should call clipImageWithEllipse if selection is cofirmed and selection style is ellipse', () => {

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  
  let clipImageWithEllipseSpy = spyOn((service as any), "clipImageWithEllipse");


 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;
  service.selectionStyle=1;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
  let mouseDownEvent = {
    // out of canvas bounds
    offsetX: 3,
    offsetY: 70,
    button: 0,
  } as MouseEvent;
  
  service.updateResizingHandles();

  service.onMouseDown(mouseDownEvent);
  expect(clipImageWithEllipseSpy).toHaveBeenCalled();


});


it('onMouseDown should not call clipImageWithEllipse if selection is cofirmed and selection style is not ellipse', () => {

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  
  let clipImageWithEllipseSpy = spyOn((service as any), "clipImageWithEllipse");


 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;
  service.selectionStyle=0;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
  let mouseDownEvent = {
    // out of canvas bounds
    offsetX: 3,
    offsetY: 70,
    button: 0,
  } as MouseEvent;
  
  service.updateResizingHandles();

  service.onMouseDown(mouseDownEvent);
  expect(clipImageWithEllipseSpy).not.toHaveBeenCalled();


});


it('onMouseDown should call resetSelection if current selection is confirmed', () => {

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  
  let resetSelectionSpy = spyOn((service as any), "resetSelection");


 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;
  service.selectionStyle=0;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
  let mouseDownEvent = {
    // out of canvas bounds
    offsetX: 3,
    offsetY: 70,
    button: 0,
  } as MouseEvent;
  
  service.updateResizingHandles();

  service.onMouseDown(mouseDownEvent);
  expect(resetSelectionSpy).toHaveBeenCalled();


});

it('onMouseDown should not call resetSelection if current selection is not confirmed', () => {

  let drawImageMock = spyOn((service as any).drawingService.baseCtx, "drawImage");
  drawImageMock.and.callFake(function() {
  });

  
  let resetSelectionSpy = spyOn((service as any), "resetSelection");


 
  service.offsetX=15;
  service.offsetY=6;
  service.selectionStartPoint={x:5,y:66};
  service.selectionEndPoint={x:26,y:95};
  service.rectangleService.width=26-5;
  service.rectangleService.height=95-66;
  service.currenthandle=-1;
  service.selectionActivated=true;
  service.selectionStyle=0;

  // we set the mouse down to the endPos, which corresponds to the handle #8;
  // service.mouseDownInsideSelection=false;
  let mouseDownEvent = {
    // out of canvas bounds
    offsetX: service.selectionStartPoint.x,
    offsetY: service.selectionStartPoint.y,
    button: 0,
  } as MouseEvent;
  
  service.updateResizingHandles();

  service.onMouseDown(mouseDownEvent);
  expect(resetSelectionSpy).not.toHaveBeenCalled();

});

    it('onMouseEnter should set isOut of rectangleService to false', () => {
        service.rectangleService.isOut = true;
        service.onMouseEnter(mouseEvent);
        expect(service.rectangleService.isOut).toBe(false);
    });
});
