import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPickerComponent } from './color-picker.component';


describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('opacity should be 100 if greater than 100', () => {
        let input = document.querySelector('#opacityValue') as HTMLInputElement;
        input.value = "102";
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
        let colors = ["#aabbcc", "#abbabb", "#aabacc", "#abbbbb", "#cccccc", "#dddddd", "#000000", "#111111", "#ffffff", "#eeeeee"] as Array<string>
        component.lastColors = colors;
        component.addColor("#abbabb");
        expect(component.lastColors).toEqual(colors);
    });

    it('addColor should push color to lastColors if it was not full', () => {
        let colors = ["#aabbcc", "#abbabb", "#aabacc", "#abbbbb"] as Array<string>
        component.lastColors = colors;
        component.addColor("#eeeeee");
        let newColors = ["#aabbcc", "#abbabb", "#aabacc", "#abbbbb", "#eeeeee"] as Array<string>
        expect(component.lastColors).toEqual(newColors);
    });

    it('addColor should pop first color and push new color to end of array', () => {
        let colors = ["#aabbcc", "#abbabb", "#aabacc", "#abbbbb", "#cccccc", "#dddddd", "#000000", "#111111", "#ffffff", "#eeeeee"] as Array<string>
        component.lastColors = colors;
        component.addColor("#bababa");
        let newColors =  ["#abbabb", "#aabacc", "#abbbbb", "#cccccc", "#dddddd", "#000000", "#111111", "#ffffff", "#eeeeee", "#bababa"]as Array<string>
        expect(component.lastColors).toEqual(newColors);
    });
});
