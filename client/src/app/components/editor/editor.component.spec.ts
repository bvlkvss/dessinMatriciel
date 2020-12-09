/* tslint:disable */
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { LineService } from '@app/services/tools/line/line.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SprayPaintService } from '@app/services/tools/spray-paint/spray-paint.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AttributeBarComponent } from '../attribute-bar/attribute-bar.component';
import { MockUndoRedoService } from '../attribute-bar/attribute-bar.component.spec';
import { ColorPaletteComponent } from '../color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ColorSliderComponent } from '../color-picker/color-slider/color-slider.component';
import { DrawingComponent } from '../drawing/drawing.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let stampStub: StampService;
    let toolManagerStub: ToolsManagerService;
    let pencilStub: PencilService;
    let pipetteStub: PipetteService;
    let plumeStub: PlumeService
    let sprayPaintStub: SprayPaintService;
    let brushStub: BrushService;
    let rectangleStub: RectangleService;
    let eraserStub: EraserService;
    let ellipseStub: EllipseService;
    let lineStub: LineService;
    let paintBucketStub: PaintBucketService;
    let drawServiceMock: MockDrawingService;
    let selectionStub: SelectionService;
    let polygonStub: PolygonService;
    let UndoRedoServiceMock: MockUndoRedoService;
    let textStub: TextService;
    let gridStub: GridService;
    let magicWandStub: MagicWandService;
    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        UndoRedoServiceMock = new MockUndoRedoService(drawServiceMock);
        polygonStub = new PolygonService(drawServiceMock, UndoRedoServiceMock);
        pencilStub = new PencilService(drawServiceMock, UndoRedoServiceMock);
        brushStub = new BrushService(drawServiceMock, UndoRedoServiceMock);
        rectangleStub = new RectangleService(drawServiceMock, UndoRedoServiceMock);
        lineStub = new LineService(drawServiceMock, UndoRedoServiceMock);
        ellipseStub = new EllipseService(drawServiceMock, UndoRedoServiceMock);
        eraserStub = new EraserService(drawServiceMock, UndoRedoServiceMock);
        pipetteStub = new PipetteService(drawServiceMock);
        textStub = new TextService(drawServiceMock, UndoRedoServiceMock);
        plumeStub = new PlumeService(drawServiceMock, UndoRedoServiceMock);
        sprayPaintStub = new SprayPaintService(drawServiceMock, UndoRedoServiceMock);
        gridStub = new GridService(drawServiceMock);
        stampStub = new StampService(drawServiceMock, UndoRedoServiceMock);
        toolManagerStub = new ToolsManagerService(pencilStub, brushStub, rectangleStub, eraserStub, ellipseStub, lineStub, selectionStub, paintBucketStub, polygonStub, pipetteStub, textStub, sprayPaintStub, plumeStub, gridStub, magicWandStub, stampStub);
        toolManagerStub.currentTool = stampStub;
        TestBed.configureTestingModule({
            declarations: [EditorComponent, AttributeBarComponent, ColorPickerComponent, DrawingComponent, ColorSliderComponent, ColorPaletteComponent, SidebarComponent],
            providers: [{ provide: MatDialog, useValue: {} }, { provide: ToolsManagerService, useValue: toolManagerStub }
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
        AttributeBarComponent.showStamps = true;
        const element = document.createElement("object");
        component.bar.stampIcon = new ElementRef<HTMLElement>(element);
        let observableSpy = spyOn<any>(stampStub.getStampObs(), "asObservable").and.returnValue(of(null));
        component.ngAfterViewChecked();
        expect(component.displayValue).toEqual('block');
        expect(component.bar.stampIcon.nativeElement.innerHTML).toEqual('keyboard_arrow_right');
        expect(observableSpy).toHaveBeenCalled();
        done();
    });
    it('should execute subscribe and update values if showStamps is false', (done) => {
        AttributeBarComponent.showStamps = false;
        const element = document.createElement("object");
        component.bar.stampIcon = new ElementRef<HTMLElement>(element);
        let observableSpy = spyOn<any>(stampStub.getStampObs(), "asObservable").and.returnValue(of(null));
        component.ngAfterViewChecked();
        expect(component.displayValue).toEqual('none');
        expect(component.bar.stampIcon.nativeElement.innerHTML).toEqual('expand_more');
        expect(observableSpy).toHaveBeenCalled();
        done();
    });
    it('should not call subscriber if current tool is not a stamp', (done) => {
        toolManagerStub.currentTool = pipetteStub
        let observableSpy = spyOn<any>(stampStub.getStampObs(), "asObservable").and.returnValue(of(null));
        component.ngAfterViewChecked();
        expect(observableSpy).not.toHaveBeenCalled();
        done();
    });
});
