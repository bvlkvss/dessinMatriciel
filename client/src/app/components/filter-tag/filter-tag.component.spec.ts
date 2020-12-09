/* tslint:disable */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterByTagService } from '@app/services/filterByTag/filter-by-tag.service';
import { Drawings } from '@common/classes/drawings';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FilterTagComponent } from './filter-tag.component';
const drawingMock: Drawings = { name: 'test', tag: ['tagtest'], imageData: 'datatest' };
const drawingMock2: Drawings = { name: 'test2', tag: ['tagtest2'], imageData: 'datatest2' };
const drawingMock3: Drawings = { name: 'test3', tag: ['tagtest3'], imageData: 'datatest' };
const drawingMock4: Drawings = { name: 'test4', tag: ['tagtest4'], imageData: 'datatest' };

describe('FilterTagComponent', () => {
    let component: FilterTagComponent;
    let fixture: ComponentFixture<FilterTagComponent>;
    let httpTestController: HttpTestingController;
    let filterStub: FilterByTagService;

    beforeEach(async(() => {
        filterStub = new FilterByTagService();
        filterStub.initDrawings = [];
        filterStub.initDrawings.push(drawingMock);
        filterStub.initDrawings.push(drawingMock2);
        filterStub.initDrawings.push(drawingMock3);
        filterStub.initDrawings.push(drawingMock4);
        filterStub.initDrawings.push(drawingMock2);
        TestBed.configureTestingModule({
            declarations: [FilterTagComponent],
            imports: [HttpClientTestingModule, NgMultiSelectDropDownModule],
            providers: [{ provide: FilterByTagService, useValue: filterStub }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        httpTestController = TestBed.get(HttpTestingController);
        //filterStub = TestBed.get(FilterByTagService);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterTagComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        httpTestController.verify();
    });

    it('should create', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        //httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/' });
        expect(component).toBeTruthy();
    });


    it('should update initdraw', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        component['updateTags'](filterStub.initDrawings);
        expect(component.tags.length).toEqual(4);
    });

    it('SHOULD INGORE DUPLICATE', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        component['updateTags'](filterStub.initDrawings);
        expect(component.tags.length).toEqual(4);
    });

    it('shoul call filter', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        let spy = spyOn(filterStub, 'filter').and.callThrough().and.callFake(() => { });
        component.onItemSelect();
        expect(spy).toHaveBeenCalled();
    });

    it('shoul call ignorefilter', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        let spy = spyOn(filterStub, 'ignoreFilter').and.callThrough().and.callFake(() => { });
        component.ignoreFilter();
        expect(spy).toHaveBeenCalled();
    });

    it('shoul call filterOndDeselect', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        let spy = spyOn(filterStub, 'filterOnDeSelect').and.callThrough().and.callFake(() => { });
        component.onDeSelect();
        expect(spy).toHaveBeenCalled();
    });

    it('shoudl call update tag if we call onclick ', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        let spy = spyOn<any>(component, 'updateTags').and.callThrough();
        component.onClick();
        expect(spy).toHaveBeenCalled();
    });

    it('shoudl call update tag if we call onclick ', () => {
        httpTestController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
        let spy = spyOn<any>(component, 'updateTags').and.callThrough();
        component.onClick();
        expect(spy).toHaveBeenCalled();
    });

});
