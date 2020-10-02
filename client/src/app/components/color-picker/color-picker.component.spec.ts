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
        let input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = '102';
        input.dispatchEvent(new Event('input'));
        component.setOpacity();
        expect(component.opacity).toEqual('ff');
    });
    it('opacity should be 0 if less than 0', () => {
        let input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = '-2';
        input.dispatchEvent(new Event('input'));
        component.setOpacity();
        expect(component.opacity).toEqual('0');
    });

    it('opacity should be 74 if input is 74', () => {
        let input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = '74';
        input.dispatchEvent(new Event('input'));
        component.setOpacity();
        expect(component.opacity).toEqual('bd');
    });

    it('opacity should be 50 if input is empty', () => {
        let input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = '';
        input.dispatchEvent(new Event('input'));
        component.setOpacity();
        expect(component.opacity).toEqual('80');
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

    it('accept changes should call setColor addColor and setOpacity', () => {
        let addColorSpy = spyOn(component, 'addColor');
        let setOpacitySpy = spyOn(component, 'setOpacity');
        let setColorSpy = spyOn((component as any).tools, 'setColor');
        component.acceptChanges();
        expect(setColorSpy).toHaveBeenCalled();
        expect(setOpacitySpy).toHaveBeenCalled();
        expect(addColorSpy).toHaveBeenCalled();
    });

    it('accept should set onInput to false when it is true', () => {
        (component as any).onInput = true;
        spyOn(component, 'addColor');
        spyOn(component, 'setOpacity');
        spyOn((component as any).tools, 'setColor');
        component.acceptChanges();
        expect((component as any).onInput).toEqual(false);
    });

    it('accept should set onLasts to false when it is true', () => {
        (component as any).onLasts = true;
        spyOn(component, 'addColor');
        spyOn(component, 'setOpacity');
        spyOn((component as any).tools, 'setColor');
        component.acceptChanges();
        expect((component as any).onLasts).toEqual(false);
    });

    it('cancel changes should set color to primary color if isPrimary color is true', () => {
        component.isPrimaryColor = true;
        component.cancelChanges();
        expect(component.color).toEqual((component as any).tools.currentTool.primaryColor.slice(0, 7));
    });

    it('cancel changes should set color to secondary color if isPrimary color is false', () => {
        component.isPrimaryColor = true;
        component.cancelChanges();
        expect(component.color).toEqual((component as any).tools.currentTool.secondaryColor.slice(0, 7));
    });

    it('cancel changes should call draw if selected position is not the same', () => {
        component.isPrimaryColor = true;
        (component as any).selectedPositionPalette = {x:0,y:0};
        (component as any).colorPalette.selectedPosition= {x:0,y:1};
        let color = (component as any).colorPalette.color
        spyOn(color , 'emit');
        let drawSpy = spyOn((component as any).colorPalette, 'draw')
        component.cancelChanges();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('cancel changes should call draw if selected height is not the same', () => {
        component.isPrimaryColor = true;
        (component as any).selectedPositionPalette = {x:0,y:0};
        (component as any).colorPalette.selectedHeight= {x:0,y:1};
        let color = (component as any).colorPalette.color
        spyOn(color , 'emit');
        let drawSpy = spyOn((component as any).colorPalette, 'draw')
        component.cancelChanges();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('color should match input when setColorFromInput is called', () => {
        let input = document.querySelector('.text') as HTMLInputElement;
        input.value = 'aaaaaa';
        let color = (component as any).colorSlider.color;
        spyOn(color , 'emit');
        component.setColorFromInput();
        expect(component.color).toEqual('#aaaaaa');
    });

    it('input should be 000000 if not a hex when setColorFromInput is called', () => {
        let input = document.querySelector('.text') as HTMLInputElement;
        input.value = 'gggggg';
        let color = (component as any).colorSlider.color;
        spyOn(color , 'emit');
        component.setColorFromInput();
        expect(component.color).toEqual('#000000');
    });
});
