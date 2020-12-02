/* tslint:disable */
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AttributeBarComponent } from '../attribute-bar/attributebar.component';
import { ColorPaletteComponent } from '../color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ColorSliderComponent } from '../color-picker/color-slider/color-slider.component';
import { DrawingComponent } from '../drawing/drawing.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let mockDrawService: MockDrawingService;
    let stampStub: StampService;
    beforeEach(async(() => {
        mockDrawService = new MockDrawingService();
        stampStub = new StampService(mockDrawService);
        TestBed.configureTestingModule({
            declarations: [EditorComponent, AttributeBarComponent, ColorPickerComponent, DrawingComponent, ColorSliderComponent, ColorPaletteComponent, SidebarComponent],
            providers: [{ provide: MatDialog, useValue: {} }
            ],
        }).compileComponents();
        delay(1000);
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should execute subscribe and update values if showStamps is true', (done) => {
        component.bar.showStamps = true;
        component.currentTool = stampStub;
        const element = document.createElement("object");
        component.bar.stampIcon = new ElementRef<HTMLElement>(element);
        let observableSpy = spyOn<any>(stampStub.getStampObs(), "asObservable").and.returnValue(of(null));
        component.ngAfterViewInit();
        expect(component.bar.showStamps).toEqual(false);
        expect(component.displayValue).toEqual('block');
        expect(component.bar.stampIcon.nativeElement.innerHTML).toEqual('keyboard_arrow_right');
        expect(observableSpy).toHaveBeenCalled();
        done();
    });
    it('should execute subscribe and update values if showStamps is false', (done) => {
        component.bar.showStamps = false;
        component.currentTool = stampStub;
        const element = document.createElement("object");
        component.bar.stampIcon = new ElementRef<HTMLElement>(element);
        let observableSpy = spyOn<any>(stampStub.getStampObs(), "asObservable").and.returnValue(of(null));
        component.ngAfterViewInit();
        expect(component.bar.showStamps).toEqual(true);
        expect(component.displayValue).toEqual('none');
        expect(component.bar.stampIcon.nativeElement.innerHTML).toEqual('expand_more');
        expect(observableSpy).toHaveBeenCalled();
        done();
    });
    it('should not call subscriber if current tool is not a stamp', (done) => {
        component.currentTool = new PipetteService(mockDrawService);
        let observableSpy = spyOn<any>(stampStub.getStampObs(), "asObservable").and.returnValue(of(null));
        component.ngAfterViewInit();
        expect(observableSpy).not.toHaveBeenCalled();
        done();
    });
});
