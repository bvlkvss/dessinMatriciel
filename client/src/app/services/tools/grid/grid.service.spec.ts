/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subject } from 'rxjs';
import { GridService } from './grid.service';

describe('GridService', () => {
    let service: GridService;
    //let mouseEvent: MouseEvent;
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
        service = TestBed.inject(GridService);
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].gridCanvas = document.createElement('canvas');
        service['drawingService'].gridCanvas.width = 100;
        service['drawingService'].gridCanvas.height = 100;
        service['drawingService'].gridCtx = service['drawingService'].gridCanvas.getContext('2d') as CanvasRenderingContext2D;

        /* mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;*/
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call clear canvas when clearGrid is called', () => {
        service.clearGrid();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should change squareSize when changeSquareSize is called', () => {
        service.changeSquareSize(10);
        expect(GridService.squareSize).toEqual(10);
    });

    it('should not change squareSize when changeSquareSize is called if value is without limits', () => {
        service.changeSquareSize(102);
        expect(GridService.squareSize).toEqual(10);
    });

    it('should change opacity when changeOpacity is called', () => {
        service.changeOpacity(10);
        expect(service.opacity).toEqual(10);
    });

    it('should not change opacity when changeOpacity is called if value is without limits', () => {
        service.changeOpacity(102);
        expect(service.opacity).toEqual(50);
    });

    it('should call displayGrid if grid was not displayed and g is pressed', () => {
        let event = { key: 'g' } as KeyboardEvent;
        GridService.isGridActive = false;
        service.displayGrid = jasmine.createSpy().and.callThrough();
        service.onKeyDown(event);
        expect(service.displayGrid).toHaveBeenCalled();
    });
    it('should not call displayGrid if grid was displayed and g is pressed', () => {
        let event = { key: 'g' } as KeyboardEvent;
        GridService.isGridActive = true;
        service.displayGrid = jasmine.createSpy().and.callThrough();
        service.onKeyDown(event);
        expect(service.displayGrid).not.toHaveBeenCalled();
    });

    it('should call changeSquareSize if + is pressed', () => {
        let event = { key: '+' } as KeyboardEvent;
        GridService.squareSize = 10;
        service.changeSquareSize = jasmine.createSpy();
        service.onKeyDown(event);
        expect(service.changeSquareSize).toHaveBeenCalledWith(15);
    });

    it('should call changeSquareSize if - is pressed', () => {
        let event = { key: '-' } as KeyboardEvent;
        GridService.squareSize = 10;
        service.changeSquareSize = jasmine.createSpy();
        service.onKeyDown(event);
        expect(service.changeSquareSize).toHaveBeenCalledWith(5);
    });
    it('should return sizeObservable on getSizeObservable', () => {
        service.sizeObservable = new Subject<string>();
        let x = service.getSizeObservable();
        expect(x).toEqual(service.sizeObservable);
    });
    it('should call lineTo 100/25 *2 times if squareSize is 25 and height and width are 100 when displayGrid is called', () => {
        GridService.squareSize=25;
        service['drawingService'].gridCtx.lineTo = jasmine.createSpy().and.callThrough();
        service.displayGrid();
        expect(service['drawingService'].gridCtx.lineTo).toHaveBeenCalledTimes(8);
    });
});
