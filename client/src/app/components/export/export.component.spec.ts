/* tslint:disable */
import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/export/export.service';
import { of } from 'rxjs';
import { ExportComponent } from './export.component';

class MockExportService extends ExportService {
    createBaseImage(): HTMLImageElement {
        return new Image(200, 200);
    }
}

describe('ExportComponent', () => {
    let component: ExportComponent;
    let fixture: ComponentFixture<ExportComponent>;
    let exportServiceStub: MockExportService;
    let drawServiceMock: MockDrawingService;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<ExportComponent>>;
    let httpStub: jasmine.SpyObj<HttpClient>;
    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();
        exportServiceStub = new MockExportService(drawServiceMock, httpStub);
        matDialogRefSpy = jasmine.createSpyObj({ afterClosed: of({ subscribe: jasmine.createSpy }), close: null });
        TestBed.configureTestingModule({
            declarations: [ExportComponent, MatDialogContent],
            providers: [
                { provide: DrawingService, useValue: drawServiceMock },
                { provide: ExportService, useValue: exportServiceStub },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
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

    it('should call exportImage and close dialog when saveImageOnDisk is called', () => {
        let exportImageSpy = spyOn(component, 'exportImage');
        let closeDialogSpy = spyOn(component, 'closeDialog');
        window.confirm = jasmine.createSpy().and.returnValue(true);
        component.saveImageOnDisk();
        expect(exportImageSpy).toHaveBeenCalled();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('should eventually return false if email is invalid and sendEmail is called', async () => {
        component.email = 'alloallo';
        let x = await component.sendEmail();
        expect(x).toBeFalsy();
    });

    it('should eventually return false if window is not confirmed', async () => {
        component.email = 'alloallo@email.ca';
        window.confirm = jasmine.createSpy().and.returnValue(false);
        let x = await component.sendEmail();
        expect(x).toBeFalsy();
    });

    it('should eventually return false if error occured', async () => {
        component.email = 'alloallo@email.ca';
        window.confirm = jasmine.createSpy().and.returnValue(true);
        component.sendImage = jasmine.createSpy().and.resolveTo(false);
        (component as any).isError = true;
        let x = await component.sendEmail();
        expect(x).toBeFalsy();
    });

    it('should eventually return true if no error occured', async () => {
        component.email = 'alloallo@email.ca';
        window.confirm = jasmine.createSpy().and.returnValue(true);
        component.sendImage = jasmine.createSpy().and.resolveTo(true);
        (component as any).isError = false;
        let x = await component.sendEmail();
        expect(x).toBeTruthy();
    });

    it('should get error if image error is thrown', async () => {
        exportServiceStub.sendEmailDataToServer = jasmine.createSpy().and.rejectWith(new Error('error'));
        try{
            await component.sendImage();
        }
        catch(error){
            expect(error.message).toEqual("error");
        }
    });

    it('should return false if image is well sent', async () => {
        exportServiceStub.sendEmailDataToServer = jasmine.createSpy().and.resolveTo(true);
        let x = await component.sendImage();
        expect(x).toBeFalsy();
    });

    it('should set email when set email is called', () => {
        component.email = '';
        component.setEmail('ssss');
        expect(component.email).toEqual('ssss');
    });

    it('should call export Service exportImage  when exportImage is called', () => {
        let exportImageSpy = spyOn(exportServiceStub, 'exportImage');
        component.exportImage();
        expect(exportImageSpy).toHaveBeenCalled();
    });

    it('should return true if email is valid and validateEmail is called', () => {
        const ret = component.validateEmail('allo@allo.ca');
        expect(ret).toBeTruthy();
    });

    it('should return false if email is invalid and validateEmail is called', () => {
        const ret = component.validateEmail('alloallo.ca');
        expect(ret).toBeFalsy();
    });

    it('should set name when setImageName is called', () => {
        component.setImageName('hello');
        expect((component as any).name).toEqual('hello');
    });

    it('should set type and call changeImage when setImageType is called', () => {
        let changeImageSpy = spyOn(component as any, 'changeImage');
        component.setImageType('hello');
        expect((component as any).type).toEqual('hello');
        expect(changeImageSpy).toHaveBeenCalled();
    });

    it('should set filter and call changeImage and setPreviewFilter when setImageFilter is called', () => {
        let changeImageSpy = spyOn(component as any, 'changeImage');
        let setPreviewFilterSpy = spyOn(component as any, 'setPreviewFilter');
        component.setImageFilter('hello');
        expect((component as any).filter).toEqual('hello');
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
