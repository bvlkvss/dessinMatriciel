/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionService } from '../tools/selection/selection.service';
import { SelectionClipboardService } from './selection-clipboard.service';

describe('SelectionClipboardService', () => {
  let service: SelectionClipboardService;
  let undoredoStub: UndoRedoService;
  let mockDrawingService: MockDrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionClipboardService);
    mockDrawingService = new MockDrawingService();
    undoredoStub = new UndoRedoService(mockDrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call copy', () => {
    const event = {
      key: 'c',
    } as KeyboardEvent;
    (service as any).delete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).cut = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).copy = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onKeyDown(event, new SelectionService(mockDrawingService, undoredoStub));
    expect((service as any).copy).toHaveBeenCalled();
    expect((service as any).delete).not.toHaveBeenCalled();
    expect((service as any).paste).not.toHaveBeenCalled();
    expect((service as any).cut).not.toHaveBeenCalled();
  });

  it('should call cut', () => {
    const event = {
      key: 'x',
    } as KeyboardEvent;
    (service as any).delete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).cut = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).copy = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onKeyDown(event, new SelectionService(mockDrawingService, undoredoStub));
    expect((service as any).cut).toHaveBeenCalled();
    expect((service as any).copy).not.toHaveBeenCalled();
    expect((service as any).delete).not.toHaveBeenCalled();
    expect((service as any).paste).not.toHaveBeenCalled();
  });

  it('should call paste', () => {
    const event = {
      key: 'v',
    } as KeyboardEvent;
    (service as any).delete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).cut = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).copy = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onKeyDown(event, new SelectionService(mockDrawingService, undoredoStub));
    expect((service as any).paste).toHaveBeenCalled();
    expect((service as any).cut).not.toHaveBeenCalled();
    expect((service as any).copy).not.toHaveBeenCalled();
    expect((service as any).delete).not.toHaveBeenCalled();
  });

  it('should call delete', () => {
    const event = {
      key: 'Delete',
    } as KeyboardEvent;
    (service as any).delete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).cut = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).copy = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onKeyDown(event, new SelectionService(mockDrawingService, undoredoStub));
    expect((service as any).delete).toHaveBeenCalled();
    expect((service as any).paste).not.toHaveBeenCalled();
    expect((service as any).cut).not.toHaveBeenCalled();
    expect((service as any).copy).not.toHaveBeenCalled();
  });

  it('should not call any methode', () => {
    const event = {
      key: 'a',
    } as KeyboardEvent;
    (service as any).delete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).cut = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).copy = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    service.onKeyDown(event, new SelectionService(mockDrawingService, undoredoStub));
    expect((service as any).delete).not.toHaveBeenCalled();
    expect((service as any).paste).not.toHaveBeenCalled();
    expect((service as any).cut).not.toHaveBeenCalled();
    expect((service as any).copy).not.toHaveBeenCalled();
  });


});
