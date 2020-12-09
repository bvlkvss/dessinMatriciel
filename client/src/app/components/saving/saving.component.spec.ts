/* tslint:disable */
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSpinner } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddTagsComponent } from '@app/components/add-tags/add-tags.component';
import { SavingService } from '@app/services/saving/saving.service';
import { of } from 'rxjs';
import { MockDrawingService } from '../drawing/drawing.component.spec';
import { SavingComponent } from './saving.component';


class MockSavingService extends SavingService {
    createBaseImage(): HTMLImageElement {
        return new Image(200, 200);
    }
}

describe('SavingComponent', () => {
    let component: SavingComponent;
    let fixture: ComponentFixture<SavingComponent>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<SavingComponent>>;
    let savingerviceStub: MockSavingService;
    let drawServiceMock: MockDrawingService;
    let httpMock: HttpClient;

    beforeEach(async(() => {
        drawServiceMock = new MockDrawingService();

        matDialogRefSpy = jasmine.createSpyObj({ afterClosed: of({ subscribe: jasmine.createSpy }), close: null });
        savingerviceStub = new MockSavingService(httpMock, drawServiceMock);
        TestBed.configureTestingModule({
            declarations: [SavingComponent, MatDialogContent, AddTagsComponent, MatSpinner],
            imports: [HttpClientModule, HttpClientTestingModule, BrowserAnimationsModule, MatChipsModule, MatFormFieldModule],

            providers: [
                { provide: SavingService, useValue: savingerviceStub },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SavingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog when closeDialog is called', () => {
        component.closeDialog();
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('should call addDrawing, errorMessage or confirmationMessage when add is called', () => {
        let addDrawingSpy = spyOn(savingerviceStub, 'addDrawing').and.returnValue(of(Promise));
        // let errorMessageSpy = spyOn(component, 'errorMessage');
        let confirmationMessageSpy = spyOn(component, 'confirmationMessage');
        let getTags = spyOn(component, 'getTags');
        component.add('dummyName');
        expect(addDrawingSpy).toHaveBeenCalled();
        //expect(errorMessageSpy).toHaveBeenCalled();
        expect(confirmationMessageSpy).toHaveBeenCalled();
        expect(getTags).toHaveBeenCalled();
    });

    it('should call close dialog when confirmationMessage is called', () => {
        let closeDialogSpy = spyOn(component, 'closeDialog');
        component.confirmationMessage();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    /*   it('should call window alert with specific message when error is called', () => {
           window.alert = jasmine.createSpy().and.callFake(function () {});
           //component.errorMessage();
           expect(window.alert).toHaveBeenCalledWith("Erreur: Le dessin n'a pas été enregistré, veuillez réessayer plus tard :(");
       });*/

    it('should not call window alert with specific message when validateName is called and name is valid', () => {
        window.alert = jasmine.createSpy().and.callFake(function () { });
        component.validateName('dummyName');
        expect(window.alert).not.toHaveBeenCalledWith('Nom dessin maquant');
        expect(component.nameIsValid).toBe(true);
        expect(component.drawingName).toBe('dummyName');
    });

    it('should call window alert with specific message when validateName is called and name is invalid', () => {
        window.alert = jasmine.createSpy().and.callFake(function () { });
        component.validateName(' ');
        expect(window.alert).not.toHaveBeenCalledWith('Nom dessin maquant');
    });
});
