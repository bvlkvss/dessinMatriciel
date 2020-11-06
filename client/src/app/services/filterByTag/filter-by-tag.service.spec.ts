/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { Drawings } from '@common/classes/drawings';
import { FilterByTagService } from './filter-by-tag.service';

describe('FilterByTagService', () => {
    let service: FilterByTagService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FilterByTagService);
        service.initDrawings = [] as Drawings[];
        service.drawingsToShow = [] as Drawings[];
        service.drawings = [] as Drawings[];
        service.initDrawings.push({ name: 'test', tag: ['test'], imageData: 'url' });
        service.initDrawings.push({ name: 'test1', tag: ['test1', 'test'], imageData: 'url1' });
        service.initDrawings.push({ name: 'test2', tag: ['test2', 'test1'], imageData: 'url2' });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('shoudld filtre return a correct filtred array of drawings', () => {
        const tag = ['test'];
        const tag1 = ['test1', 'test2'];

        const filter1 = service.filtredDrawings(service.initDrawings, tag);
        const filter2 = service.filtredDrawings(service.initDrawings, tag1);
        filter1.forEach((element) => {
            expect(element.tag.indexOf(tag[0])).toBeGreaterThan(-1);
        });
        filter2.forEach((element) => {
            const bool = ((element.tag.indexOf(tag1[0]) !== -1) || (element.tag.indexOf(tag1[1]) !== -1)) as boolean;
            expect(bool).toEqual(true);
        });
    });

    it('should empty drawings and drawingsToShow', () => {
        service.drawings.push(service.initDrawings[0]);
        service.drawings.push(service.initDrawings[1]);
        service.drawings.push(service.initDrawings[2]);
        service.updateDrawingsToShow(service.drawings);
        service.emptydrawings();
        expect(service.drawings.length).toEqual(0);
        expect(service.drawingsToShow.length).toEqual(0);
    });

    it('should ignore filter and initialise drawings to initdrawings and then update drawings to show', () => {
        let spy = spyOn(service, 'updateDrawingsToShow');
        service.ignoreFilter();
        expect(spy).toHaveBeenCalled();
        service.drawings.forEach((element) => {
            expect(service.initDrawings.indexOf(element)).toBeGreaterThanOrEqual(0);
        });
        expect(service.drawings.length).toEqual(service.initDrawings.length);
    });

    it('filter should not filter', () => {
        const tag = [] as string[];
        let spy = spyOn(service, 'filtredDrawings').and.callThrough();
        let spy1 = spyOn(service, 'emptydrawings').and.callThrough();
        let spy2 = spyOn(service, 'updateDrawingsToShow').and.callThrough();
        service.filter(tag);
        expect(spy).toHaveBeenCalled();
        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
    });

    it('filter should filter', () => {
        const tag = ['test'] as string[];
        let spy = spyOn(service, 'filtredDrawings').and.callThrough();
        let spy1 = spyOn(service, 'emptydrawings').and.callThrough();
        let spy2 = spyOn(service, 'updateDrawingsToShow').and.callThrough();
        service.filter(tag);
        expect(spy).toHaveBeenCalled();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        service.drawings.forEach((element) => {
            expect(element.tag.indexOf(tag[0])).toBeGreaterThan(-1);
        });
    });

    it('filterOnDeselect should filter', () => {
        const tag = ['test'] as string[];
        let spy = spyOn(service, 'filtredDrawings').and.callThrough();
        let spy1 = spyOn(service, 'emptydrawings').and.callThrough();
        let spy2 = spyOn(service, 'updateDrawingsToShow').withArgs(service.drawings).and.callThrough();
        service.filterOnDeSelect(tag);
        expect(spy).toHaveBeenCalled();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        service.drawings.forEach((element) => {
            expect(element.tag.indexOf(tag[0])).toBeGreaterThan(-1);
        });
    });

    it('filterOnDeselect should not filter', () => {
        const tag = [] as string[];
        let spy = spyOn(service, 'filtredDrawings').and.callThrough();
        let spy1 = spyOn(service, 'emptydrawings').and.callThrough();
        let spy2 = spyOn(service, 'updateDrawingsToShow').and.callThrough();
        service.filterOnDeSelect(tag);
        expect(spy).toHaveBeenCalled();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        service.drawings.forEach((element) => {
            expect(service.initDrawings.indexOf(element)).toBeGreaterThanOrEqual(0);
        });
        expect(service.drawings.length).toEqual(service.initDrawings.length);
    });

    it('should not update drawingsToThow if step = 0', () => {
        service.emptydrawings();
        service.updateDrawingsToShow(service.drawings);
        expect(service.drawingsToShow.length).toEqual(0);
    });

    it('should not update drawingsToThow if already exist on drawingstoshow', () => {
        service.emptydrawings();
        service.drawings.push(service.initDrawings[0]);
        service.drawingsToShow.push(service.initDrawings[0]);
        service.updateDrawingsToShow(service.drawings);
        expect(service.drawingsToShow.length).toEqual(1);
    });

    it('should update drawingsToThow', () => {
        service.emptydrawings();
        service.drawings.push(service.initDrawings[1]);
        service.drawingsToShow.push(service.initDrawings[0]);
        service.updateDrawingsToShow(service.drawings);
        expect(service.drawingsToShow.length).toBeGreaterThan(1);
    });
});
