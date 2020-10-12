/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker.component';
import { ColorSliderComponent } from './color-slider/color-slider.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;

    beforeEach(async(() => {
        delay(1000);
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent, ColorPaletteComponent, ColorSliderComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('opacity should be 100 if greater than 100', () => {
        component.setOpacity(150);
        expect(component.opacity).toEqual(100);
    });
    it('opacity should be 0 if less than 0', () => {
        component.setOpacity(-2);
        expect(component.opacity).toEqual(0);
    });

    it('opacity should be 74 if input is 74', () => {
        component.setOpacity(74);
        expect(component.opacity).toEqual(74);
    });

    it('addColor should do nothing if color was already there', () => {
        let colors = ['#aabbcc', '#abbabb', '#aabacc', '#abbbbb', '#cccccc', '#dddddd', '#000000', '#111111', '#ffffff', '#eeeeee'] as Array<string>;
        component.lastColors = colors;
        component.addColor('#abbabb');
        expect(component.lastColors).toEqual(colors);
    });

    it('addColor should push color to lastColors if it was not full', () => {
        let colors = ['#aabbcc', '#abbabb', '#aabacc', '#abbbbb'] as Array<string>;
        component.lastColors = colors;
        component.addColor('#eeeeee');
        let newColors = ['#aabbcc', '#abbabb', '#aabacc', '#abbbbb', '#eeeeee'] as Array<string>;
        expect(component.lastColors).toEqual(newColors);
    });

    it('addColor should pop first color and push new color to end of array', () => {
        let colors = ['#aabbcc', '#abbabb', '#aabacc', '#abbbbb', '#cccccc', '#dddddd', '#000000', '#111111', '#ffffff', '#eeeeee'] as Array<string>;
        component.lastColors = colors;
        component.addColor('#bababa');
        let newColors = ['#abbabb', '#aabacc', '#abbbbb', '#cccccc', '#dddddd', '#000000', '#111111', '#ffffff', '#eeeeee', '#bababa'] as Array<
            string
        >;
        expect(component.lastColors).toEqual(newColors);
    });

    it('setColor on click should set the current color', () => {
        let mouseEvent = {} as MouseEvent;
        component.color = '#bababa';
        component.setColorOnClick(mouseEvent, '#ababab');
        expect(component.color).toEqual('#ababab');
    });

    it('setColor on click should set on prime if left click', () => {
        let mouseEvent = {button:0} as MouseEvent;
        (component as any).isPrime = false;
        component.setColorOnClick(mouseEvent, '#ababab');
        expect((component as any).isPrime).toEqual(true);
    });

    it('setColor on click should set on prime to false if right click', () => {
        let mouseEvent = {button:2} as MouseEvent;
        (component as any).isPrime = true;
        component.setColorOnClick(mouseEvent, '#ababab');
        expect((component as any).isPrime).toEqual(false);
    });

    it('color should match input when setColorFromInput is called', () => {
        let value:string = 'aaaaaa';
        component.setColorFromInput(value);
        expect(component.color).toEqual('#aaaaaa');
    });

    it('input should be 000000 if not a hex when setColorFromInput is called', () => {
        component.setColorFromInput("gggggg");
        expect(component.color).toEqual('#000000');
    });
});
