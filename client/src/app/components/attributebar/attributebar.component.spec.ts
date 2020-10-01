import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { AttributebarComponent } from './attributebar.component';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

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
    let drawServiceMock: MockDrawingService;

    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        pencilStub = new PencilService(drawServiceMock);
        brushStub = new BrushService(drawServiceMock);
        rectangleStub = new RectangleService(drawServiceMock);
        lineStub = new LineService(drawServiceMock);
        ellipseStub = new EllipseService(drawServiceMock);
        eraserStub = new EraserService(drawServiceMock);
        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub);
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

    it('if change occur ngOnChanges should call restoreValues', () => {
        let restoreValuesSpy = spyOn(component, 'restoreValues');
        (component as any).junctionWidth = 5;
        component.ngOnChanges();
        fixture.detectChanges();
        expect(restoreValuesSpy).toHaveBeenCalled();
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

    it('should call changeStyle when calling restoreValues and currentTool is a rectangle', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('rectangle');
        let changeStyleSpy = spyOn(component, 'changeStyle');

        component.restoreValues();

        expect(changeStyleSpy).toHaveBeenCalled();
    });

    it('should call changeStyle when calling restoreValues and currentTool is a ellipse', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('ellipse');
        let changeStyleSpy = spyOn(component, 'changeStyle');

        component.restoreValues();

        expect(changeStyleSpy).toHaveBeenCalled();
    });

    it('should call setTexture when calling restoreValues and currentTool is a brush', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        let setTextureSpy = spyOn((component as any).tools.currentTool as BrushService, 'setTexture');

        component.restoreValues();

        expect(setTextureSpy).toHaveBeenCalled();
    });
    it('should set junctionWidth when calling restoreValues and currentTool is a line', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('line') as LineService;
        (component as any).tools.currentTool.junctionWidth = 6;
        component.junctionWidth = '0';
        let element = { checked: false } as HTMLInputElement;
        let getElementByIdSpy = spyOn(document, 'getElementById').and.returnValue(element);
        component.restoreValues();

        expect(getElementByIdSpy).toHaveBeenCalled();
        expect(component.junctionWidth).toEqual('6');
    });

    it('should call setRectangleStyle when calling acceptChanges and currentTool is a rectangle', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('rectangle');
        let setRectangleStyleSpy = spyOn(toolManagerStub, 'setRectangleStyle');

        component.acceptChanges();

        expect(setRectangleStyleSpy).toHaveBeenCalled();
    });

    it('should call setEllipseStyle when calling acceptChanges and currentTool is a ellipse', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('ellipse');
        let setEllipseStyleSpy = spyOn(toolManagerStub, 'setEllipseStyle');

        component.acceptChanges();

        expect(setEllipseStyleSpy).toHaveBeenCalled();
    });

    it('should call setJunctionWidth when calling acceptChanges and currentTool is a line', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('line') as LineService;
        let element = { checked: false } as HTMLInputElement;
        let getElementByIdSpy = spyOn(document, 'getElementById').and.returnValue(element);
        let setJunctionWidthSpy = spyOn(toolManagerStub, 'setJunctionWidth');
        component.acceptChanges();

        expect(getElementByIdSpy).toHaveBeenCalled();
        expect(setJunctionWidthSpy).toHaveBeenCalled();
    });

    it('should call setTexture when calling acceptChanges and currentTool is a brush', () => {
        (component as any).tools.currentTool = (component as any).tools.getTools().get('brush');
        let setTextureSpy = spyOn((component as any).tools.currentTool as BrushService, 'setTexture');

        component.acceptChanges();

        expect(setTextureSpy).toHaveBeenCalled();
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

    it('should set junctionWidth when calling setJunctionWidth', () => {
        component.setJunctionWidth('6');

        expect(component.junctionWidth).toEqual('6');
    });

    it('should set background to gray when calling setJunctionState and checkbox is false', () => {
      let _style = {background:"white"};
      let slider =  {style: _style} as HTMLElement;
      spyOn(document, "querySelector").and.returnValue(slider);
      component.setJunctionState();
      expect(slider.style.background).toEqual('gray');
  });

  it('should set idStyleBrush to given value when setTexture is called', () => {
    let image =  {src: ''} as HTMLImageElement;
    spyOn(document, "querySelector").and.returnValue(image);
    component.setTexture(5);
    expect(component.idStyleBrush).toEqual(5);
  });

  it('should call change style with ellipse as argument when calling setShapeStyle and isEllipse is true', () => {
    
    let changeStyleSpy = spyOn(component, "changeStyle");
    let idStyle = 1;
    component.setShapeStyle(idStyle, true);
    expect(changeStyleSpy).toHaveBeenCalledWith('currentEllipseStyle', idStyle);
    expect(component.idStyleRectangle).toEqual(idStyle);
  });

  it('should call change style with rectangle as argument when calling setShapeStyle and isEllipse is false', () => {
    
    let changeStyleSpy = spyOn(component, "changeStyle");
    let idStyle = 1;
    component.setShapeStyle(idStyle, false);
    expect(changeStyleSpy).toHaveBeenCalledWith('currentRectangleStyle', idStyle);
    expect(component.idStyleRectangle).toEqual(idStyle);
  });

  it('should call querySelector when updateTextInput is called', () => {
    let querySelectorSpy = spyOn(document, "querySelector").and.returnValue({value:'x'} as HTMLInputElement);
      component.updateTextInput();
      expect(querySelectorSpy).toHaveBeenCalled();
  });

  it('should call querySelector when toggleList is called', () => {
    let child = {innerHTML: "sss"} as any;
    let sibling = {innerHTML: "sss", lastChild:child} as any;
    let _style = {display:"block"};
    let querySelectorSpy = spyOn(document, "querySelector").and.returnValue({id:'3', style:_style, previousSibling:sibling} as HTMLElement);
      component.toggleList('5');
      expect(querySelectorSpy).toHaveBeenCalled()
  });


  it('should change display to none when toggleList is called and showContainer was false', () => {
    let child = {innerHTML: "sss"} as any;
    let sibling = {innerHTML: "sss", lastChild:child} as any;
    let _style = {display:"block"};
    let querySelectorSpy = spyOn(document, "querySelector").and.returnValue({id:'3', style:_style, previousSibling:sibling} as HTMLElement);
    (component as any).showContainer = true
      component.toggleList('5');
      expect(querySelectorSpy).toHaveBeenCalled();
  });
});
