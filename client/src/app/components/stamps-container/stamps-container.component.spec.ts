import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { StampsContainerComponent } from './stamps-container.component';

describe('StampsContainerComponent', () => {
  let component: StampsContainerComponent;
  let fixture: ComponentFixture<StampsContainerComponent>;
  let stampServiceStub: StampService;
  let drawServiceMock: MockDrawingService;
  beforeEach(async(() => {
    drawServiceMock = new MockDrawingService();
    stampServiceStub = new StampService(drawServiceMock);
    TestBed.configureTestingModule({
      declarations: [StampsContainerComponent],
      providers: [{ provide: StampService, useValue: stampServiceStub },]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should change image src and call getStampObs when calling setCurrentImage', (done) => {
    stampServiceStub.image = new Image();
    let spy = spyOn(stampServiceStub, 'getStampObs').and.callThrough();
    component.setCurrentImage("Img");
    done();
    expect(spy).toHaveBeenCalled()
    expect(stampServiceStub.image.src.includes("Img")).toEqual(true);
  });

});
