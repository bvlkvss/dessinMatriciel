/* tslint:disable */
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipList } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatFormField } from '@angular/material/form-field';
import { RouterTestingModule } from '@angular/router/testing';
import { IndexService } from '@app/services/index/index.service';
import { of } from 'rxjs';
import { DrawingCardComponent } from '../drawing-card/drawing-card.component';
import { UserGuideComponent } from '../user-guide/user-guide.component';
import { MainPageComponent } from './main-page.component';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let indexServiceSpy: SpyObj<IndexService>;
    let matDialogSpy: SpyObj<MatDialog>;

    beforeEach(async(() => {
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['basicGet', 'basicPost']);
        indexServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        indexServiceSpy.basicPost.and.returnValue(of());
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);


        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent, MatFormField, MatChipList],
            providers: [{ provide: IndexService, useValue: indexServiceSpy }, { provide: MatDialog, useValue: matDialogSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'PolyDessin2'", () => {
        expect(component.title).toEqual('PolyDessin2');
    });

    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(indexServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(indexServiceSpy.basicPost).toHaveBeenCalled();
    });
    it('should call openCarousel when the button is pressed', () => {
        let spy = spyOn(component, "openCarousel")
        const button = fixture.debugElement.nativeElement.querySelector('#carousel');
        button.click();
        expect(spy).toHaveBeenCalled();
    });
    it('should call drawImage when afterView is triggered and saved image is not null ', () => {
        spyOn<any>((component as any).drawingService, "getAfterViewObservable").and.returnValue(of(null));
        (component as any).drawingData = "test";
        let drawImageSpy = spyOn(DrawingCardComponent, "drawImage").and.stub();
        component.continueDrawing();
        expect(drawImageSpy).toHaveBeenCalled();
    });
    it('should not call drawImage when afterView is triggered and saved image is null', () => {
        spyOn<any>((component as any).drawingService, "getAfterViewObservable").and.returnValue(of(null));
        (component as any).drawingData = null;
        let drawImageSpy = spyOn(DrawingCardComponent, "drawImage").and.stub();
        component.continueDrawing();
        expect(drawImageSpy).not.toHaveBeenCalled();
    });
    it('openCarousel should call dialog.open methode', () => {
        component.openCarousel();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });
    it('openUserGuide should call displayUserGuide', () => {
        const userGuideSpy = spyOn(UserGuideComponent, 'displayUserGuide').and.stub();
        component.openUserGuide();
        expect(userGuideSpy).toHaveBeenCalled();
    });
    it('should call setItem when afterView is triggered  ', () => {
        spyOn<any>((component as any).drawingService, "getAfterViewObservable").and.returnValue(of(null));
        let setItemSpy = spyOn(localStorage.__proto__, "setItem").and.stub();
        component['drawingService'].canvas = document.createElement('canvas');
        component.newDrawing();
        expect(setItemSpy).toHaveBeenCalled();
    });


});
