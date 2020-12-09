/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MockUndoRedoService } from '@app/components/attribute-bar/attribute-bar.component.spec';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SprayPaintService } from './spray-paint.service';


describe('SprayPaintService', () => {
    let service: SprayPaintService;
    let mouseEvent: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    // let myClearIntervalSpy: jasmine.Spy<any>;
    let fakeUndoRedo: MockUndoRedoService;
    // let spraySpy: jasmine.Spy<any>;

    beforeEach(() => {
        let testCanvas = document.createElement('canvas');
        baseCtxStub = testCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        fakeUndoRedo = new MockUndoRedoService(drawServiceSpy);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }, { provide: UndoRedoService, useValue: fakeUndoRedo },],
        });
        service = TestBed.inject(SprayPaintService);
        service['drawingService'].baseCtx = baseCtxStub;
        service.myClearInterval = jasmine.createSpy().and.callFake((interval) => { interval = 0; });
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
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

    it(' onMouseUp should set mouseDown property to false', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('setPrimaryColor should set primaryColor to correct value', () => {
        service.setPrimaryColor('#ababab');
        expect(service.primaryColor).toEqual('#ababab');
    });

    it('setDropletsWidth should set dropletsRadius to correct value', () => {
        service.setDropletsWidth(5);
        expect(service.dropletRadius).toEqual(5);
    });

    it('setfrequency should set setfrequency to correct value', () => {
        service.setfrequency(5);
        expect(service.period).toEqual((1 / 5) * 1000);
    });

    it('setRadius should set dropletsRadius to correct value', () => {
        service.setRadius(5);
        expect(service.radius).toEqual(5);
    });

    it(' onMouseMove should set currentMousePos to correct position', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        const expectedResult: Vec2 = { x: 25, y: 25 };

        service.onMouseMove(mouseEvent);
        expect(service.currentMousePos).toEqual(expectedResult);
    });

    it(' onMouseMove should not set currentMousePos to correct position', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        const expectedResult: Vec2 = { x: 25, y: 25 };

        service.onMouseMove(mouseEvent);
        expect(service.currentMousePos).not.toEqual(expectedResult);
    });

    it(' on mouse out should call clear interval', () => {
        service.onMouseOut(mouseEvent);
        expect(service.myClearInterval).toHaveBeenCalled();
    });

    it(' onMouseEnter should call spray if mouse was already down', () => {
        //service.mouseDownCoord = { x: 0, y: 0 };
        service.spray = jasmine.createSpy();
        service.period = 10;
        jasmine.clock().install();
        service.mouseDown = true;
        service.onMouseEnter(mouseEvent);
        jasmine.clock().tick(11);
        expect(service.spray).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it(' onMouseEnter should not call spray if mouse was not down', () => {
        //service.mouseDownCoord = { x: 0, y: 0 };
        service.spray = jasmine.createSpy();
        service.period = 10;
        jasmine.clock().install();
        service.mouseDown = false;
        service.onMouseEnter(mouseEvent);
        jasmine.clock().tick(11);
        expect(service.spray).not.toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it(' spray should call beginPath density times', () => {
        baseCtxStub.beginPath = jasmine.createSpy();
        service.density = 10;
        service.spray(baseCtxStub, { x: 23, y: 24 });
        expect(baseCtxStub.beginPath).toHaveBeenCalledTimes(10);
    });
});
