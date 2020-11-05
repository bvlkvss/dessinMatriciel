/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { LineService } from '@app/services/tools/line/line.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { AttributebarComponent } from './attributebar.component';


export class MockUndoRedoService extends UndoRedoService {
    executeAll(): void {
        console.log("executeAll was Called");
    }
    ClearRedo(): void {
        console.log("clearRedo was called");
    }
}
describe('AttributebarComponent', () => {
    let component: AttributebarComponent;
    let fixture: ComponentFixture<AttributebarComponent>;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let paintBucketStub: PaintBucketService;
    let drawServiceMock: MockDrawingService;
    let selectionStub: SelectionService;
    let polygonStub: PolygonService;
    let UndoRedoServiceMock: MockUndoRedoService;

    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        polygonStub = new PolygonService(drawServiceMock);
        pencilStub = new PencilService(drawServiceMock, UndoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, UndoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, UndoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, UndoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, UndoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, UndoRedoServiceMock);
        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub,selectionStub,paintBucketStub, polygonStub);
        TestBed.configureTestingModule({
            declarations: [AttributebarComponent],
            providers: [{ provide: ToolsManagerService, useValue: toolManagerStub }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });



    it('should call getComputedStyle when calling change Style if both id are correct', () => {
        let style_ = { borderColor: 'blue', backgroundColor: 'blue', borderStyle: 'dashed', borderWidth: '2' } as any;
        let element = { style: style_ } as HTMLElement;
        let currenttStyle = 'style0';
        let nextStyle = 1;
        let getComputedStyleSpy = spyOn(window, 'getComputedStyle').and.returnValue(style_);
        let querySelectorSpy = spyOn(document, 'querySelector').and.returnValue(element);
        component.changeStyle(currenttStyle, nextStyle);
        expect(querySelectorSpy).toHaveBeenCalled();
        expect(getComputedStyleSpy).toHaveBeenCalled();
    });

    it('should not call getComputedStyle when calling change Style if both id are not correct', () => {
        let currenttStyle = 'badStyle';
        let nextStyle = 101;
        let getComputedStyleSpy = spyOn(window, 'getComputedStyle');

        component.changeStyle(currenttStyle, nextStyle);

        expect(getComputedStyleSpy).not.toHaveBeenCalled();
    });

    it('should set widthValue when calling restoreValues if tool has lineWidth', () => {
        (component as any).tools.currentTool.lineWidth = 6;
        component.restoreValues();
        expect(component.widthValue).toEqual('6');
    });

    it('should call restoreValues when calling checkIfContainAttributes if lastTool is not the same as currentTool', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        (component as any).lastTool = (component as any).tools.getTools().get('ellipse');

        let restoreValuesSpy = spyOn(component, 'restoreValues');

        component.checkIfContainAttribute('lineWidth');

        expect(restoreValuesSpy).toHaveBeenCalled();
    });

    it('should not call restoreValues when calling checkIfContainAttributes if lastTool is the same as currentTool', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        (component as any).lastTool = (component as any).tools.getTools().get('brush');

        let restoreValuesSpy = spyOn(component, 'restoreValues');

        component.checkIfContainAttribute('lineWidth');

        expect(restoreValuesSpy).not.toHaveBeenCalled();
    });

    it('should set widthValue when calling setLineWidth', () => {
        component.setLineWidth('6');

        expect(component.widthValue).toEqual('6');
    });

    it('should call toolManager"s setjunctionWidth when calling setJunctionWidth', () => {
        let junctionWidthSpy = spyOn(toolManagerStub, 'setJunctionWidth');
        component.setJunctionWidth("6");
        expect(junctionWidthSpy).toHaveBeenCalled();
    });

    it('should call toolManager"s setjunctionState when calling setJunctionState', () => {
        let junctionStateSpy = spyOn(toolManagerStub, 'setJunctionState');
        component.setJunctionState(true);
        expect(junctionStateSpy).toHaveBeenCalled();
    });

    it('should set currentTexture to given value when setTexture is called', () => {
        (toolManagerStub.currentTool as BrushService).setTexture = jasmine.createSpy('setTexture');
        component.setTexture(5);
        expect(component.currentTexture).toContain('b5.svg');
    });

    it('should call change style with ellipse as argument when calling setShapeStyle and isEllipse is true', () => {
        let changeStyleSpy = spyOn(component, 'changeStyle');
        (toolManagerStub.currentTool as EllipseService).setStyle = jasmine.createSpy();
        let idStyle = 1;
        component.setShapeStyle(idStyle, true);
        expect(changeStyleSpy).toHaveBeenCalledWith('currentEllipseStyle', idStyle);
        expect(component.idStyleRectangle).toEqual(idStyle);
    });

    it('should call change style with rectangle as argument when calling setShapeStyle and isEllipse is false', () => {
        let changeStyleSpy = spyOn(component, 'changeStyle');
        let idStyle = 1;
        (toolManagerStub.currentTool as RectangleService).setStyle = jasmine.createSpy();
        component.setShapeStyle(idStyle, false);
        expect(changeStyleSpy).toHaveBeenCalledWith('currentRectangleStyle', idStyle);
        expect(component.idStyleRectangle).toEqual(idStyle);
    });

    it('should call setBucketTolerance when calling setTolerance', () => {
        let setBucketToleranceSpy = spyOn(toolManagerStub, 'setBucketTolerance');
        component.setTolerance('40');
        expect(setBucketToleranceSpy).toHaveBeenCalled();
    });

    it('should call querySelector when toggleList is called', () => {
        let child = { innerHTML: 'sss' } as any;
        let sibling = { innerHTML: 'sss', lastChild: child } as any;
        let _style = { display: 'block' };
        let querySelectorSpy = spyOn(document, 'querySelector').and.returnValue({ id: '3', style: _style, previousSibling: sibling } as HTMLElement);
        component.toggleList('5');
        expect(querySelectorSpy).toHaveBeenCalled();
    });

    it('should change display to none when toggleList is called and showContainer was false', () => {
        let child = { innerHTML: 'sss' } as any;
        let sibling = { innerHTML: 'sss', lastChild: child } as any;
        let _style = { display: 'block' };
        let querySelectorSpy = spyOn(document, 'querySelector').and.returnValue({ id: '3', style: _style, previousSibling: sibling } as HTMLElement);
        (component as any).showContainer = true;
        component.toggleList('5');
        expect(querySelectorSpy).toHaveBeenCalled();
    });
});
