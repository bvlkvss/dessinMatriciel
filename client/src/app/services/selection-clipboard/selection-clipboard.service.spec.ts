/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { MockDrawingService } from '@app/components/drawing/drawing.component.spec';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { MagicWandSelection } from '../tools/magic-wand/magic-wand-selection';
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

  it('if selectionData dont exist then currentclipboard on copy should stay indefined', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as any;
    tmp.width = 100;
    tmp.height = 100;
    tmp.magicSelectionObj.selectionData = false as any;
    (service as any).copy(tmp);
    expect((service as any).currentClipboardData).not.toBeDefined();

  });

  it('if selectionData exist then currentclipboard should equal selectionData', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as any;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    tmp.magicSelectionObj.selectionData = tmp1;
    (service as any).copy(tmp);
    expect((service as any).currentClipboardData).toEqual(tmp1);

  });

  it('if is cuted drawSlection not called', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = true;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as any;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.magicSelectionObj.selectionData = tmp1;
    tmp.magicSelectionObj.drawSelectionOnBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste(tmp);
    expect(tmp.magicSelectionObj.drawSelectionOnBase).not.toHaveBeenCalled();
    expect(tmp.magicSelectionObj.redrawSelection).toHaveBeenCalled();
    expect(tmp.magicSelectionObj.resetSelection).toHaveBeenCalled();

  });

  it('if is not cuted drawSlection  called', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as MagicWandSelection;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.magicSelectionObj.selectionData = tmp1;
    tmp.magicSelectionObj.drawSelectionOnBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste(tmp);
    expect(tmp.magicSelectionObj.drawSelectionOnBase).toHaveBeenCalled();
    expect(tmp.magicSelectionObj.redrawSelection).toHaveBeenCalled();
    expect(tmp.magicSelectionObj.resetSelection).toHaveBeenCalled();

  });

  it('if slectionTOol is MagicWandService then ismagicslectionACTIVATED SHOULD BE FALSE', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as MagicWandSelection;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.magicSelectionObj.selectionData = tmp1;
    tmp.magicSelectionObj.drawSelectionOnBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste(tmp);
    expect(tmp.isMagicSelectionActivated).toEqual(true);

  });

  it('paste should udpdate proprety of selection startpoint ,endpoint , degres...', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as MagicWandSelection;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.magicSelectionObj.selectionData = tmp1;
    tmp.magicSelectionObj.drawSelectionOnBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste(tmp);
    expect(tmp.magicSelectionObj.selectionStartPoint).toEqual({ x: 0, y: 0 });
    expect(tmp.magicSelectionObj.degres).toEqual(0);
    expect(tmp.magicSelectionObj.selectionData).toEqual((service as any).currentClipboardData);
    expect(tmp.magicSelectionObj.firstSelectionMove).toEqual(true);
    expect(tmp.magicSelectionObj.selectionActivated).toEqual(true);
  });

  it('delete if MagicWandService should call eraseSelectionOndelete', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as MagicWandSelection;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.magicSelectionObj.selectionData = tmp1;
    tmp.magicSelectionObj.clearPreview = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.magicSelectionObj.eraseSelectionOnDelete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).delete(tmp);
    expect(tmp.magicSelectionObj.eraseSelectionOnDelete).toHaveBeenCalled();
    expect(tmp.magicSelectionObj.resetSelection).toHaveBeenCalled();
    expect(tmp.magicSelectionObj.clearPreview).toHaveBeenCalled();
    expect(tmp.isMagicSelectionActivated).toEqual(false);
  });

  it('delete if MagicWandService should call eraseSelectionFromBase', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new SelectionService(mockDrawingService, undoredoStub);
    (service as any).currentClipboardData = tmp.selectionData = tmp1;
    tmp.clearPreview = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.eraseSelectionFromBase = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).delete(tmp);
    expect(tmp.eraseSelectionFromBase).toHaveBeenCalled();
    expect(tmp.resetSelection).toHaveBeenCalled();
    expect(tmp.clearPreview).toHaveBeenCalled();
  });


  it('cut should call copy ,delete and make isCuted equal true', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new MagicWandService(mockDrawingService, undoredoStub);
    tmp.magicSelectionObj = {} as MagicWandSelection;
    tmp.magicSelectionObj.width = tmp.width = tmp1.width;
    tmp.magicSelectionObj.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.magicSelectionObj.selectionData = tmp1;
    (service as any).copy = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).delete = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).cut(tmp);
    expect((service as any).delete).toHaveBeenCalled();
    expect((service as any).copy).toHaveBeenCalled();

  });


  it('if selectionData exist then currentclipboard should equal selectionData', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    let tmp = new SelectionService(mockDrawingService, undoredoStub);
    tmp.width = tmp.width = tmp1.width;
    tmp.height = tmp.height = tmp1.height;
    tmp.selectionData = tmp1;
    (service as any).copy(tmp);
    expect((service as any).currentClipboardData).toEqual(tmp1);

  });

  it('paste with selectionService should call redrawSelection ,resetSelection, drawSelectionOnbase', () => {
    const tmp1 = document.createElement('canvas');
    tmp1.height = 420;
    tmp1.width = 69;
    (service as any).isCuted = false;
    let tmp = new SelectionService(mockDrawingService, undoredoStub);
    tmp.width = tmp.width = tmp1.width;
    tmp.height = tmp.height = tmp1.height;
    (service as any).currentClipboardData = tmp.selectionData = tmp1;
    tmp.drawSelectionOnBase = jasmine.createSpy().and.callFake(() => { });
    tmp.redrawSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    tmp.resetSelection = jasmine.createSpy().and.callThrough().and.callFake(() => { });
    (service as any).paste(tmp);
    expect(tmp.redrawSelection).toHaveBeenCalled();
    expect(tmp.resetSelection).toHaveBeenCalled();
    expect(tmp.drawSelectionOnBase).toHaveBeenCalled();

  });






});
