/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDialog} from '@angular/material/dialog';
import { delay } from 'rxjs/operators';
import { AttributebarComponent } from '../attributebar/attributebar.component';
import { ColorPaletteComponent } from '../color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ColorSliderComponent } from '../color-picker/color-slider/color-slider.component';
import { DrawingComponent } from '../drawing/drawing.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditorComponent, AttributebarComponent, ColorPickerComponent, DrawingComponent, ColorSliderComponent, ColorPaletteComponent, SidebarComponent, MatButtonToggleGroup],
            providers:[{provide: MatDialog, useValue: {}}],
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
