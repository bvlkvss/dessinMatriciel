import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';

describe('RectangleService', () => {
  let service: RectangleService;
  let mouseEvent: MouseEvent;
  let drawServiceSpy: jasmine.SpyObj<DrawingService>;

  let baseCtxStub: CanvasRenderingContext2D;
  let previewCtxStub: CanvasRenderingContext2D;
  let drawLineSpy: jasmine.Spy<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RectangleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
