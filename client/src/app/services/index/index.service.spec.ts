import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Message } from '@common/communication/message';
import { IndexService } from './index.service';

describe('IndexService', () => {
    let httpMock: HttpTestingController;
    let service: IndexService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(IndexService);
        httpMock = TestBed.inject(HttpTestingController);
        // BASE_URL is private so we need to access it with its name as a key
        // Try to avoid this syntax which violates encapsulation
        // tslint:disable: no-string-literal
        baseUrl = service['BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };

        // check the content of the mocked call
        service.basicGet().subscribe((response: Message) => {
            expect(response.title).toEqual(expectedMessage.title, 'Title check');
            expect(response.body).toEqual(expectedMessage.body, 'body check');
        }, fail);

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };
        // subscribe to the mocked call
        // tslint:disable-next-line: no-empty
        service.basicPost(sentMessage).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/send');
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentMessage);
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe((response: Message) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occured'));
    });
});
