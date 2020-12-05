import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientRequestService } from './http-client-request.service';

/* tslint:disable */
describe('HttpClientRequestService', () => {
  let service: HttpClientRequestService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(HttpClientRequestService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    console.log(httpTestingController);
    expect(service).toBeTruthy();
  });
});
