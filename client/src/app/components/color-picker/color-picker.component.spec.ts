/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;

    beforeEach(async(() => {
        delay(1000);
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
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

    it('color should match input', () => {
        let input = document.querySelector('.text') as HTMLInputElement;
        input.value = 'aaaaaa';
        input.dispatchEvent(new Event('input'));
        component.setColorFromInput();
        expect(component.color).toEqual('#aaaaaa');
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

    it('setColor on click should set the primary color on leftClick', () => {
        let mouseEvent = { button: 0 } as MouseEvent;
        component.color = '#bababa';
        let setColorSpy = spyOn((component as any).tools, 'setColor');
        component.setColorOnClick(mouseEvent, '#ababab');
        expect(component.color).toEqual('#ababab');
        expect(setColorSpy).toHaveBeenCalledWith(component.color + component.opacity, true);
    });

    it('setColor on click should set the secondary color on right', () => {
        let mouseEvent = { button: 2 } as MouseEvent;
        component.color = '#bababa';
        let setColorSpy = spyOn((component as any).tools, 'setColor');
        component.setColorOnClick(mouseEvent, '#ababab');
        expect(component.color).toEqual('#ababab');
        expect(setColorSpy).toHaveBeenCalledWith(component.color + component.opacity, false);
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
});
