import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let drawPolygonSpy: jasmine.Spy<any>;

    beforeEach(() => {
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PolygonService);

        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas.width = canvasStub.width;
        service['drawingService'].canvas.height = canvasStub.height;
        service['drawingService'].baseCtx.canvas.width = baseCtxStub.canvas.width;
        service['drawingService'].previewCtx.canvas.width = previewCtxStub.canvas.width;
        service['drawingService'].baseCtx.canvas.height = baseCtxStub.canvas.height;
        service['drawingService'].previewCtx.canvas.height = previewCtxStub.canvas.height;

        drawPolygonSpy = spyOn(service, 'drawPolygon');
           mouseEvent = {
             offsetX: 25,
             offsetY: 25,
             button: 0,
         } as MouseEvent;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('style should be set to assigned value when setStyle is called', () => {
        service.setStyle(2);
        expect(service.polygonStyle).toEqual(2);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });
    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('setLineWidth should set lineWidth to correct value', () => {
        service.setLineWidth(3);

        expect(service.lineWidth).toEqual(3);
    });

    it('setPrimaryColor should set primaryColor to correct value', () => {
        service.setPrimaryColor('#ababab');
        expect(service.primaryColor).toEqual('#ababab');
    });

    it('onMouseOut should not set isOut to true if mouse is not down', () => {
        service.mouseDown = false;
        service.isOut = false;
        service.onMouseOut(mouseEvent);
        expect(service.isOut).toBe(false);
    });

    it('onMouseOut should set isOut to true if mouse is  down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseOut(mouseEvent);
        expect(service.isOut).toBe(true);
    });

    it('onMouseOut should not call drawPolygon if mouseDown is false', () => {
        service.mouseDown = false;
        service.onMouseOut(mouseEvent);
        expect(drawPolygonSpy).not.toHaveBeenCalled();
    });

    //test pour la confirmation pour polygone!!!!!!!!!
    it('onMouseOut should call drawRectangle if mouseDown is true', () => {
        service.mouseDownCoord = { x: 60, y: 60 };
        service.polygonStyle = 1;
        service.mouseDown = true;
        service.onMouseOut(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it('onMouseOut should set x to 100 if more than 100', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.polygonStyle = 2;
        let mouseOutEvent = {
            offsetX: 103,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.x).toEqual(100);
    });

    it('onMouseOut should set x to 0 if less than 0', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.polygonStyle = 0;
        let mouseOutEvent = {
            offsetX: -2,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.x).toEqual(0);
    });

    it('onMouseOut should set y to 100 if more than 100', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        let mouseOutEvent = {
            offsetX: 25,
            offsetY: 102,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.y).toEqual(100);
    });

    it('onMouseOut should set y to 0 if less than 0', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        let mouseOutEvent = {
            offsetX: 25,
            offsetY: -2,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.y).toEqual(0);
    });

    it('onMouseEnter should set isOut to false', () => {
        service.onMouseEnter(mouseEvent);
        expect(service.isOut).toBe(false);
    });

    it('onMouseUp should not call drawPolygon if mouse is not down', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(drawPolygonSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should  call drawPolygon if mouse is down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it('if mouse is out onMouseUp should  call drawRectangle with mouseOutCoords', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseOutCoord = { x: 102, y: 20 };
        service.mouseDown = true;
        service.isOut = true;
        service.onMouseUp(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalledWith(service['drawingService'].baseCtx, service.mouseDownCoord, service.mouseOutCoord, false);
    });

    it('onMouseMove should  not call drawPolygon if mouse is not down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawPolygonSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should  call drawPolygon if mouse is down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it('if center of polygon + width is out of bounds change width', () => {
        service.mouseDownCoord = { x: 10, y: 25 };
        service.widthPolygon = 50;
        service.calibratePolygon(1);
        expect(service.widthPolygon).toEqual(9);
    });

    it('should set numberSides when setNumberSides is called', () => {
      service.numberSides = 7;
      service.setNumberSides(8);
      expect(service.numberSides).toEqual(8);
  });

  it('should set secondaryColor when setSecondaryColor is called', () => {
    service.secondaryColor = "abaaba";
    service.setSecondaryColor("bbhhbb");
    expect(service.secondaryColor).toEqual("bbhhbb");
});

});
