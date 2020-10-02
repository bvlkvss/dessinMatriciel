/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditorComponent],
        }).compileComponents();
        delay(1000);
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
