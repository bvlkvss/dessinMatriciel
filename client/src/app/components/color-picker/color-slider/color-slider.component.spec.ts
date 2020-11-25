 /* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSliderComponent } from './color-slider.component';

describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;
    let strokeSpy: jasmine.Spy<any>;
    let emitSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSliderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        strokeSpy = spyOn<any>((component as any).ctx, 'stroke').and.callThrough();
        emitSpy = spyOn<any>((component as any).color, 'emit').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('if selectedHeight is not defined draw should not call stroke', () => {
        component.draw();
        expect(strokeSpy).not.toHaveBeenCalled();
    });

    it('if selectedHeight is defined draw should not call stroke', () => {
        (component as any).selectedHeight = 5;
        component.draw();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it(' mouseUp should set mouseDown to false', () => {
        const event = {} as MouseEvent;
        component.onMouseUp(event);
        expect((component as any).mousedown).toBe(false);
    });

    it('rgb to hex should change the given number to its right value', () => {
        let nbr = 255;
        let hex = component.rgbToHex(nbr);
        expect(hex).toEqual('ff');
    });

    it('rgb to hex should change the given number to its right value and add a 0 if it"s a one digit hex nbr', () => {
        let nbr = 6;
        let hex = component.rgbToHex(nbr);
        expect(hex).toEqual('06');
    });

    it('getColoratPosition should return a color string equivalent to right color', () => {
        let imgData = (component as any).ctx.getImageData(0, 0, 1, 1);
        imgData.data[0] = 255;
        imgData.data[1] = 255;
        imgData.data[2] = 255;
        (component as any).ctx.putImageData(imgData, 0, 0);
        let color = component.getColorAtPosition(0, 0);
        expect(color).toEqual('#ffffff');
    });

    it('emitColor should call emit', () => {
        component.emitColor(0, 0);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('onMouseDown should set mouseDown to true', () => {
        let mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        component.onMouseDown(mouseEvent);
        expect((component as any).mousedown).toBe(true);
        expect((component as any).selectedHeight).toEqual(mouseEvent.offsetY);
    });

    it('onMouseMove should work if mouseDown is true', () => {
        let mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        (component as any).mousedown = true;
        component.onMouseMove(mouseEvent);
        expect((component as any).mousedown).toBe(true);
        expect((component as any).selectedHeight).toEqual(mouseEvent.offsetY);
    });

    it('onMouseMove should not do anything if mousedown is false', () => {
        let mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        (component as any).mousedown = false;
        component.onMouseMove(mouseEvent);
        expect((component as any).mousedown).not.toBe(true);
        expect((component as any).selectedHeight).not.toEqual(mouseEvent.offsetY);
    });
});
