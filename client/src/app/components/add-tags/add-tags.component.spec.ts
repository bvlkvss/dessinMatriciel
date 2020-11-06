/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent, MatChipList, MatChipsModule} from '@angular/material/chips';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { AddTagsComponent } from '@app/components/add-tags/add-tags.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const MAX_ARRAY_TAG_SIZE = 8;
const EXCEEDING_MAX_ARRAY_TAG_SIZE = 10;
const GOOD_INDEX = 4;
const WRONG_INDEX = -1;

describe('addTagsComponent', () => {
    let component: AddTagsComponent;
    let fixture: ComponentFixture<AddTagsComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddTagsComponent, MatFormField, MatChipList],
            imports: [MatFormFieldModule, MatChipsModule, BrowserAnimationsModule]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(AddTagsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('add should push tags if tag does not contain number, symbol or a whitespace', () => {
        const inputElement = {
            value: 'test',
        } as HTMLInputElement;
        const inputEvent = {
            value: 'test',
            input: inputElement,
        } as MatChipInputEvent;
        component.tags.push = jasmine.createSpy().and.callFake(function () { });
        component.add(inputEvent);
        expect(component.tags.push).toHaveBeenCalled();
    });
    it('add should not push tags if tags does  contain number, symbol or a whitespace and should send the correct alert', () => {
        const inputElement = {
            value: 'test',
        } as HTMLInputElement;
        const inputEvent = {
            value: 'test1123;',
            input: inputElement,
        } as MatChipInputEvent;
        component.tags.push = jasmine.createSpy().and.callFake(function () { });
        window.alert = jasmine.createSpy().and.callFake(function () { });
        component.add(inputEvent);
        expect(component.tags.push).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Les espaces, les chiffres et les symboles ne sont pas permis dans les tags.');
    });
    it('add should not push tags if there are already 8 tags', () => {
        const inputElement = {
            value: 'test',
        } as HTMLInputElement;
        const inputEvent = {
            value: 'test',
            input: inputElement,
        } as MatChipInputEvent;
        component.tags.length = MAX_ARRAY_TAG_SIZE;
        component.tags.push = jasmine.createSpy().and.callFake(function () { });
        window.alert = jasmine.createSpy().and.callFake(function () { });
        component.add(inputEvent);
        expect(component.tags.push).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Vous avez atteint le nombre maximal de tags alloués.');
    });
    it('add should not push tags if there are more than 10 tags', () => {
        const inputElement = {
            value: 'test',
        } as HTMLInputElement;
        const inputEvent = {
            value: 'test',
            input: inputElement,
        } as MatChipInputEvent;
        component.tags.length = EXCEEDING_MAX_ARRAY_TAG_SIZE;
        component.tags.push = jasmine.createSpy().and.callFake(function () { });
        window.alert = jasmine.createSpy().and.callFake(function () { });
        component.add(inputEvent);
        expect(component.tags.push).not.toHaveBeenCalled();
    });
    it('remove should pop the tag if it find its index', () => {
        component.tags.length = MAX_ARRAY_TAG_SIZE;
        component.tags.splice = jasmine.createSpy().and.callFake(function () { });
        component.tags.indexOf = jasmine.createSpy().and.callFake(function () {
            // fake index for test
            return GOOD_INDEX;
        });
        component.remove('test');
        expect(component.tags.splice).toHaveBeenCalled();
    });
    it('remove should not pop the tag if index is less than 0', () => {
        component.tags.length = MAX_ARRAY_TAG_SIZE;
        component.tags.splice = jasmine.createSpy().and.callFake(function () { });
        component.tags.indexOf = jasmine.createSpy().and.callFake(function () {
            // fake index for test
            return WRONG_INDEX;
        });
        component.remove('test');
        expect(component.tags.splice).not.toHaveBeenCalled();
    });
});
