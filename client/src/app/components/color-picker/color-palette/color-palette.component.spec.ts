/* tslint:disable */
import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    let strokeSpy: jasmine.Spy<any>;
    let emitSpy: jasmine.Spy<any>;
    let fillRectSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        strokeSpy = spyOn<any>((component as any).ctx, 'stroke').and.callThrough();
        emitSpy = spyOn<any>((component as any).color, 'emit').and.callThrough();
        fillRectSpy = spyOn<any>((component as any).ctx, 'fillRect').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('draw should not do nothing if canvas does not exist', () => {
        (component as any).canvas = null;
        component.draw();
        expect(fillRectSpy).not.toHaveBeenCalled();
    });

    it('if selectedPosition is not defined draw should not call stroke', () => {
        component.draw();
        expect(strokeSpy).not.toHaveBeenCalled();
    });

    it('if selectedPosition is defined draw should not call stroke', () => {
        (component as any).selectedPosition = { x: 0, y: 0 };
        component.draw();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('if hue does not change ngOnChanges should not do anything', () => {
        (component as any).selectedPosition = { x: 0, y: 0 };
        component.ngOnChanges({ selectedPosition: new SimpleChange(null, (component as any).selectedPosition, true) });
        fixture.detectChanges();
        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('if hue changes and position exists it should call emit', () => {
        (component as any).hue = '#ffffff';
        (component as any).selectedPosition = { x: 0, y: 0 };
        component.ngOnChanges({ hue: new SimpleChange(null, (component as any).hue, true) });
        fixture.detectChanges();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('if hue changes and position does not exists it should not call emit', () => {
        (component as any).hue = '#ffffff';
        component.ngOnChanges({ hue: new SimpleChange(null, (component as any).hue, true) });
        fixture.detectChanges();
        expect(emitSpy).not.toHaveBeenCalled();
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
        expect((component as any).selectedPosition).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
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
        expect((component as any).selectedPosition).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
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
        expect((component as any).selectedPosition).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    });
});
