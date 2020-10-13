/* tslint:disable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { ExportComponent } from './export.component';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { ExportService } from '@app/services/export/export.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

class MockExportService extends ExportService {
    createBaseImage():HTMLImageElement {
        return new Image(200,200);
    }
}

describe('ExportComponent', () => {
    let component: ExportComponent;
    let fixture: ComponentFixture<ExportComponent>;
    let exportServiceStub: MockExportService;
    let drawServiceMock: MockDrawingService;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<ExportComponent>>;
    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        exportServiceStub = new MockExportService(drawServiceMock);
        matDialogRefSpy = jasmine.createSpyObj({ afterClosed : of({subscribe:jasmine.createSpy}), close: null });
        TestBed.configureTestingModule({
            declarations: [ExportComponent],
            providers: [
                { provide: DrawingService, useValue: drawServiceMock },
                { provide: ExportService, useValue: exportServiceStub },
                { provide: MatDialogRef, useValue: matDialogRefSpy},
                { provide: ComponentFixtureAutoDetect, useValue: true },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call exportImage and close dialog when onConfirm is called', () => {
        let exportImageSpy = spyOn(component, 'exportImage');
        let closeDialogSpy = spyOn(component, 'closeDialog');
        component.onConfirm();
        expect(exportImageSpy).toHaveBeenCalled();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('should call export Service exportImage  when exportImage is called', () => {
        let exportImageSpy = spyOn(exportServiceStub, 'exportImage');
        component.exportImage();
        expect(exportImageSpy).toHaveBeenCalled();
    });

    it('should set name when setImageName is called', () => {
        component.setImageName("hello");
        expect((component as any).name).toEqual("hello");
    });

    it('should set type and call changeImage when setImageType is called', () => {
        let changeImageSpy = spyOn((component as any),'changeImage');
        component.setImageType("hello");
        expect((component as any).type).toEqual("hello");
        expect(changeImageSpy).toHaveBeenCalled();
    });

    it('should set filter and call changeImage and setPreviewFilter when setImageFilter is called', () => {
        let changeImageSpy = spyOn((component as any),'changeImage');
        let setPreviewFilterSpy = spyOn((component as any),'setPreviewFilter');
        component.setImageFilter("hello");
        expect((component as any).filter).toEqual("hello");
        expect(changeImageSpy).toHaveBeenCalled();
        expect(setPreviewFilterSpy).toHaveBeenCalled();
    });

    it('should close dialog when closeDialog is called', () => {
        component.closeDialog();
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('should call exportService setFilter when changeImage is called', () => {
        let setFilterSpy = spyOn(exportServiceStub, 'setFilter');
        (component as any).changeImage();
        expect(setFilterSpy).toHaveBeenCalled();
    });

    it('should call exportService setFilter when setPreviewFilter is called', () => {
        let setFilterSpy = spyOn(exportServiceStub, 'setFilter');
        (component as any).setPreviewFilter();
        expect(setFilterSpy).toHaveBeenCalled();
    });
});
