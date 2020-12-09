/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from "@app/classes/canvas-test-helper";
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from './text.service';
describe('TextService', () => {
  let service: TextService;
  let mouseEvent: MouseEvent;
  let drawServiceSpy: jasmine.SpyObj<DrawingService>;
  let baseCtxStub: CanvasRenderingContext2D;
  let previewCtxStub: CanvasRenderingContext2D;

  beforeEach(() => {
    baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

    TestBed.configureTestingModule({
      providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
    });
    service = TestBed.inject(TextService);
    service['drawingService'].baseCtx = baseCtxStub;
    service['drawingService'].previewCtx = previewCtxStub;
    mouseEvent = {
      offsetX: 25,
      offsetY: 25,
      button: 0,
    } as MouseEvent;
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('isInsideRect should return true if the click was inside the rect', () => {
    service.rectStartPoint = { x: 0, y: 0 };
    service.rectEndPoint = { x: 50, y: 250 };
    service.mouseDownCoord = service.getPositionFromMouse(mouseEvent);
    const returnedValue: boolean = service['isInsideRect']();
    expect(returnedValue).toEqual(true);
  });
  it('isInsideRect should return false if mousedown is undefined', () => {
    const returnedValue: boolean = service['isInsideRect']();
    expect(returnedValue).toEqual(false);
  });
  it('isInsideRect should return false if the click was outside the rect', () => {
    service.rectStartPoint = { x: 0, y: 0 };
    service.rectEndPoint = { x: 50, y: 250 };
    mouseEvent = {
      offsetX: 250,
      offsetY: 250,
      button: 0,
    } as MouseEvent;
    service.mouseDownCoord = service.getPositionFromMouse(mouseEvent);
    const returnedValue: boolean = service['isInsideRect']();
    expect(returnedValue).toEqual(false);
  });
  it('drawTextBox should call writeText,drawBox and drawCursor if cursorisMoving', () => {
    const drawBoxSpy = spyOn<any>(service, "drawBox").and.stub();
    const writeTextSpy = spyOn<any>(service, "writeText").and.stub();
    const drawCursorSpy = spyOn<any>(service, "drawCursor").and.stub();
    service.isCursorMoving = true;
    service.textPosition = service.rectStartPoint = { x: 222, y: 123 };
    service.fontSize = 20;
    service["drawTextBox"]();
    expect(writeTextSpy).toHaveBeenCalled();
    expect(drawCursorSpy).toHaveBeenCalled();
    expect(drawBoxSpy).toHaveBeenCalled();

  });
  it('drawTextBox should not call drawCursor if cursorisMoving is false', () => {
    const drawCursorSpy = spyOn<any>(service, "drawCursor").and.stub();
    spyOn<any>(service, "drawBox").and.stub();
    spyOn<any>(service, "writeText").and.stub();
    service.isCursorMoving = false;
    service.textPosition = service.rectStartPoint = { x: 222, y: 123 };
    service.fontSize = 20;
    service["drawTextBox"]();
    expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    expect(drawCursorSpy).not.toHaveBeenCalled();
  });
  it('updateTextPosition should call measureText and return the correct point depending on the text allignement', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callFake(() => { return 50; });
    service.rectStartPoint = { x: 58, y: 20 };
    service.firstCursorPosition = { x: 30, y: 42 };
    service.rectWidth = 200;
    service.isCursorMoving = false;
    const returnedPoint = service["updateTextPosition"]("lineTest");
    expect(measureTextSpy).toHaveBeenCalled();
    expect(returnedPoint).toEqual({ x: 208, y: 42 });
  });
  it('updateTextPosition should call measureText and return the correct point depending on the text allignement', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callFake(() => { return 50; });
    service.rectStartPoint = { x: 58, y: 20 };
    service.firstCursorPosition = { x: 30, y: 42 };
    service.textAlignement = 'center';
    service.rectWidth = 200;
    service.isCursorMoving = false;
    const returnedPoint = service["updateTextPosition"]("lineTest");
    expect(measureTextSpy).toHaveBeenCalled();
    expect(returnedPoint).toEqual({ x: 133, y: 42 });
  });
  it('findLongestLine should return the width of the longest line in the array', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callThrough();
    service.fontSize = 30;
    service.lines.push("first");
    service.lines.push("second");
    service.lines.push("longestOne");
    service.lines.push("last");
    let returnedValue: number = service["findLongestLine"]();
    expect(measureTextSpy).toHaveBeenCalled();
    expect(returnedValue).toEqual(service["measureText"]("longestOne"));
    //if lines array is empty , 0 is returned
    service.lines = [""];
    returnedValue = service["findLongestLine"]();
    expect(returnedValue).toEqual(0);
  });
  it('measureText should return the width of corresponding line', () => {
    const measureTextSpy = spyOn<any>(previewCtxStub, "measureText").and.callThrough();
    previewCtxStub.font = " 30px Arial";
    service["measureText"]("Hello World");
    expect(measureTextSpy).toHaveBeenCalled();
  });
  it('drawConfirmedText should confirm the text by drawing it on the baseCtx if the tool is changed ', () => {
    const restoreToInitStateSpy = spyOn<any>(service, "restoreToInitState").and.stub();
    const writeTextSpy = spyOn<any>(service, "writeText").and.stub();
    const clearIntervalSpy = spyOn<any>(global, "clearInterval").and.stub();
    spyOn<any>(service, "isInsideRect").and.callFake(() => { return true });
    service["drawConfirmedText"](true);
    expect(writeTextSpy).toHaveBeenCalled();
    expect(restoreToInitStateSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();

  });

  it('drawConfirmedText should confirm the text by drawing it on the baseCtx if the click is outside the rect ', () => {
    const restoreToInitStateSpy = spyOn<any>(service, "restoreToInitState").and.stub();
    const writeTextSpy = spyOn<any>(service, "writeText").and.stub();
    const clearIntervalSpy = spyOn<any>(global, "clearInterval").and.stub();
    spyOn<any>(service, "isInsideRect").and.callFake(() => { return false });
    service["drawConfirmedText"](false);
    expect(writeTextSpy).toHaveBeenCalled();
    expect(restoreToInitStateSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();

  });
  it('restoreToInitState should restore attributes values and clear canvas', () => {
    service["restoreToInitState"]();
    expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    expect(service.isWriting).toEqual(false);
    expect(service.firstClick).toEqual(true);
    expect(service.lines).toEqual([""]);
    expect(service.currentLinePosition).toEqual(0);
    expect(service.currentChar).toEqual(0);
    expect(service.isWriting).toEqual(false);

  });
  it('setPrimaryColor should set primaryColor to correct value', () => {
    service.setPrimaryColor('#ababab');

    expect(service.primaryColor).toEqual('#ababab');
  });
  it('setLineWidth should set primaryColor to correct value and call drawTextBox if is righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = true;
    service.setLineWidth(9);
    expect(service.fontSize).toEqual(9);
    expect(drawTextBoxSpy).toHaveBeenCalled();
  });
  it('setLineWidth should set fontSize to correct value and not call drawTextBox if is not righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = false;
    service.setLineWidth(9);
    expect(service.fontSize).toEqual(9);
    expect(drawTextBoxSpy).not.toHaveBeenCalled();
  });

  it('setFontText should set fontText to correct value and call drawTextBox if is righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = true;
    service.setFontText("Arial");
    expect(service.fontText).toEqual("Arial");
    expect(drawTextBoxSpy).toHaveBeenCalled();
  });
  it('setFontText should set fontText to correct value and not call drawTextBox if is not righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = false;
    service.setFontText("Arial");
    expect(service.fontText).toEqual("Arial");
    expect(drawTextBoxSpy).not.toHaveBeenCalled();
  });
  it('setFontStyle should set fontStyle to correct value and call drawTextBox if is righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = true;
    service.setFontStyle("bold");
    expect(service.fontStyle).toEqual("bold");
    expect(drawTextBoxSpy).toHaveBeenCalled();
  });
  it('setFontStyle should set fontStyle to correct value and not call drawTextBox if is not righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = false;
    service.setFontStyle("bold");
    expect(service.fontStyle).toEqual("bold");
    expect(drawTextBoxSpy).not.toHaveBeenCalled();
  });
  it('setAllignement should set textAllignement to correct value and call drawTextBox if is righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = true;
    service.setAllignement("center");
    expect(service.textAlignement).toEqual("center");
    expect(drawTextBoxSpy).toHaveBeenCalled();
  });
  it('setAllignement should set textAllignement to correct value and call drawTextBox if is righting', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.stub();
    service.isWriting = false;
    service.setAllignement("left");
    expect(service.textAlignement).toEqual("left");
    expect(drawTextBoxSpy).not.toHaveBeenCalled();
  });
  it('setToInitState should initialize attributes to the correct value', () => {
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    //case where fontSize >=50
    service.fontSize = 50;
    service.mouseDownCoord = { x: 233, y: 132 };
    service["setToInitState"]();
    expect(service.rectWidth).toEqual(200);
    expect(service.rectHeight).toEqual(60);
    expect(service.isWriting).toEqual(true);
    expect(service.textPosition).toEqual({ x: 233, y: 132 });
    expect(service.firstCursorPosition).toEqual({ x: 233, y: 132 });
    expect(service.rectStartPoint).toEqual({ x: 233, y: 82 });
    expect(service.rectEndPoint).toEqual({ x: 441, y: 142 });
    expect(service.firstClick).toEqual(false);

    expect(drawTextBoxSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call printableKeyTreatment if is righting and event key is a single char  ', () => {
    const printibaleKeySpy = spyOn<any>(service, "printableKeyTreatment").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'e' }));
    expect(printibaleKeySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();

  });
  it('onKeyDown should call backSpaceKeyTreatment if is righting and event key is Backspace  ', () => {
    const backSpaceKeyKeySpy = spyOn<any>(service, "backSpaceKeyTreatment").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(backSpaceKeyKeySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call backSpaceKeyTreatment if is righting and event key is Delete  ', () => {
    const deleteKeySpy = spyOn<any>(service, "deleteKeyTreatment").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(deleteKeySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call enterKeyTreatment if is righting and event key is Enter  ', () => {
    const enterKeySpy = spyOn<any>(service, "enterKeyTreatment").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(enterKeySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call restoreToInitState if is righting and event key is Escape  ', () => {
    const restoreToInitSpy = spyOn<any>(service, "restoreToInitState").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(restoreToInitSpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call shiftHorizontally if is righting and event key is ArrowRight  ', () => {
    const shiftHorizontallySpy = spyOn<any>(service, "shiftHorizontally").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(shiftHorizontallySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call shiftHorizontally if is righting and event key is ArrowLeft  ', () => {
    const shiftHorizontallySpy = spyOn<any>(service, "shiftHorizontally").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(shiftHorizontallySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call shiftVertically if is righting and event key is ArrowUp  ', () => {
    const shiftVerticallySpy = spyOn<any>(service, "shiftVertically").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(shiftVerticallySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('onKeyDown should call shiftVertically if is righting and event key is ArrowDown  ', () => {
    const shiftVerticallySpy = spyOn<any>(service, "shiftVertically").and.stub();
    const drawTextBoxSpy = spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const updateTextPositionSpy = spyOn<any>(service, "updateTextPosition").and.callFake(() => { return; });
    //new KeyboardEvent('keydown', { key: 'ArrowRight' })
    service.isWriting = true;
    service["onKeyDown"](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(shiftVerticallySpy).toHaveBeenCalled();
    expect(drawTextBoxSpy).toHaveBeenCalled();
    expect(updateTextPositionSpy).toHaveBeenCalled();
  });
  it('shiftHorizontally should shift the cursor to the right if step is positive by increamenting currentChar ', () => {
    service.currentChar = 0;
    service["shiftHorizontally"](1, 2);
    expect(service.currentChar).toEqual(1);
  });
  it('shiftHorizontally should shift the cursor to the first position in the next line if current char is at the end of current Line ', () => {
    service.currentChar = 2;
    service.currentLinePosition = 0;
    service.lines.push("firstLine");
    service.lines.push("secondLine");
    service["shiftHorizontally"](1, 2);
    expect(service.currentChar).toEqual(0);
    expect(service.currentLinePosition).toEqual(1);
  });
  it('shiftHorizontally should not shift if cursor is at last position in current line and next line is undefined ', () => {
    service.currentChar = 1;
    service.currentLinePosition = 0;
    service.lines[0] = "firstLine";
    service["shiftHorizontally"](1, 1);
    expect(service.currentChar).toEqual(1);
    expect(service.currentLinePosition).toEqual(0);


  });
  //// left
  it('shiftHorizontally should shift the cursor to the left if step is negative by decreamenting currentChar ', () => {
    service.currentChar = 3;
    service["shiftHorizontally"](-1, 2);
    expect(service.currentChar).toEqual(2);
  });
  it('shiftHorizontally should shift the cursor to the last position in the previous line if current char is at the first Position of current Line ', () => {
    service.currentChar = 0;
    service.currentLinePosition = 1;
    service.lines[0] = "firstLine";
    service.lines[1] = "secondLine";
    service["shiftHorizontally"](-1, 0);
    expect(service.currentChar).toEqual(9);
    expect(service.currentLinePosition).toEqual(0);
  });
  it('shiftHorizontally should not shift if cursor is at first position in current line and previous line is undefined ', () => {
    service.currentChar = 0;
    service.currentLinePosition = 0;
    service.lines[0] = "firstLine";
    service["shiftHorizontally"](-1, 0);
    expect(service.currentChar).toEqual(0);
    expect(service.currentLinePosition).toEqual(0);
  });
  it('printableKeyTreatment should add a char to the currentLine at the specified position ', () => {
    service.currentChar = 5;
    service.lines[0] = "testOPrintable"
    service["printableKeyTreatment"](new KeyboardEvent('keydown', { key: 'f' }));
    expect(service.currentChar).toEqual(6);
    expect(service.lines[0]).toEqual("testOfPrintable");
  });
  it('deleteKeyTreatment should delete next  char of the currentLine at the specified position if exists', () => {
    service.currentChar = 5;
    service.lines[0] = "testOfPrintable"
    service["deleteKeyTreatment"]();
    expect(service.currentChar).toEqual(5);
    expect(service.lines[0]).toEqual("testOPrintable");
  });
  it('deleteKeyTreatment should merge current and next lines if next  char is the last one on the current', () => {
    service.currentChar = 6;
    service.currentLinePosition = 0;
    service.lines[0] = "testOf";
    service.lines[1] = "Printable";
    service["deleteKeyTreatment"]();
    expect(service.currentChar).toEqual(6);
    expect(service.lines[0]).toEqual("testOfPrintable");
    expect(service.lines.length).toEqual(1);

  });
  it('shiftVertically should shift to the next line at the specified position', () => {
    service.currentChar = 5;
    service.currentLinePosition = 0;
    service.lines[0] = "Testline";
    service.lines[1] = "tesstttline";
    service["shiftVertically"](1);
    expect(service.currentChar).toEqual(5);
    expect(service.currentLinePosition).toEqual(1);
  });
  it('shiftVertically should shift to the next line at the last position of next line if the current line is longer then next', () => {
    service.currentChar = 10;
    service.currentLinePosition = 0;
    service.lines[0] = "tesstttline";
    service.lines[1] = "testLine";
    service["shiftVertically"](1);
    expect(service.currentChar).toEqual(8);
    expect(service.currentLinePosition).toEqual(1);
  });
  it('shiftVertically should shift to the previous line at the specified position', () => {
    service.currentChar = 5;
    service.currentLinePosition = 1;
    service.lines[0] = "Testline";
    service.lines[1] = "tesstttline";
    service["shiftVertically"](-1);
    expect(service.currentChar).toEqual(5);
    expect(service.currentLinePosition).toEqual(0);
  });
  it('shiftVertically should shift to the previous line at the last position of previous line if the current line is longer then previous', () => {
    service.currentChar = 8;
    service.currentLinePosition = 1;
    service.lines[0] = "tesstt";
    service.lines[1] = "testLine";
    service["shiftVertically"](-1);
    expect(service.currentChar).toEqual(6);
    expect(service.currentLinePosition).toEqual(0);
  });
  it('enterKeyTreatment should slice the string into 2 part at the specified position and shift second part to next line', () => {
    service.currentChar = 5;
    service.currentLinePosition = 0;
    service.rectEndPoint = { x: 0, y: 32 };
    service.fontSize = 80;
    service.lines[0] = "firstsecond";
    service["enterKeyTreatment"]();
    expect(service.currentChar).toEqual(0);
    expect(service.lines[0]).toEqual("first");
    expect(service.lines[1]).toEqual("second");
    expect(service.currentLinePosition).toEqual(1);
    expect(service.lines.length).toEqual(2);
    expect(service.rectEndPoint).toEqual({ x: 0, y: 112 });

  });
  it('backSpaceKeyTreatment should delete the previous char if exists', () => {
    service.currentChar = 3;
    service.currentLinePosition = 0;
    service.lines[0] = "tesst";
    service["backSpaceKeyTreatment"]();
    expect(service.currentChar).toEqual(2);
    expect(service.lines[0]).toEqual("test");
    expect(service.currentLinePosition).toEqual(0);

  });
  it('backSpaceKeyTreatment should merge the current and previous lines if the current char is at 0', () => {
    service.currentChar = 0;
    service.currentLinePosition = 1;
    service.lines[0] = "testOf";
    service.lines[1] = "BackSpace";
    service["backSpaceKeyTreatment"]();
    expect(service.currentChar).toEqual("testOf".length);
    expect(service.lines[0]).toEqual("testOfBackSpace");
    expect(service.currentLinePosition).toEqual(0);

  });
  it('drawCursor should draw the cursor at the right position', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callFake(() => { return 50; });
    const fillTextSpy = spyOn(baseCtxStub, "fillText").and.callThrough();
    spyOn(baseCtxStub, "restore").and.callFake(() => { return; });
    service.currentChar = 3;
    service.fontSize = 15;
    service.fontStyle = "bold";
    service.fontText = "Arial";
    service.firstCursorPosition = { x: 245, y: 111 };
    service.textPosition = { x: 100, y: 111 }
    service.currentLinePosition = 1;
    service.lines[0] = "tesst";
    service.lines[1] = "cursorTest";
    service["drawCursor"](baseCtxStub, true);
    expect(service.isBlank).toEqual(false);
    expect(baseCtxStub.globalAlpha).toEqual(0);
    expect(baseCtxStub.fillStyle).toEqual("#000000");
    expect(fillTextSpy).toHaveBeenCalledWith("|", 292.5, 124.5);
    expect(measureTextSpy).toHaveBeenCalled();
  });
  it('alignSingleLine should return the right point when allignement is left', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callFake(() => { return 50; });
    spyOn<any>(service, "updateTextPosition").and.callFake(() => { return { x: 12, y: 21 } });
    const mockPosition = { x: 200, y: 198 };
    service.rectWidth = 100;
    service.rectStartPoint = { x: 30, y: 123 };
    service.textAlignement = "left";
    let returnedPoint = service["alignSingleLine"]("mockLine", mockPosition);
    expect(returnedPoint).toEqual({ x: 200, y: 198 });
    expect(service.firstCursorPosition).toEqual({ x: 30, y: 21 });
    expect(measureTextSpy).toHaveBeenCalled();
  });
  it('alignSingleLine should return the right point when allignement is center', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callFake(() => { return 50; });
    spyOn<any>(service, "updateTextPosition").and.callFake(() => { return { x: 12, y: 21 } });
    const mockPosition = { x: 200, y: 198 };
    service.rectWidth = 100;
    service.rectStartPoint = { x: 30, y: 123 };
    service.textAlignement = "center";
    let returnedPoint = service["alignSingleLine"]("mockLine", mockPosition);
    expect(returnedPoint).toEqual({ x: 225, y: 198 });
    expect(service.firstCursorPosition).toEqual({ x: 12, y: 21 });
    expect(measureTextSpy).toHaveBeenCalled();
  });
  it('alignSingleLine should return the right point when allignement is center', () => {
    const measureTextSpy = spyOn<any>(service, "measureText").and.callFake(() => { return 50; });
    spyOn<any>(service, "updateTextPosition").and.callFake(() => { return { x: 12, y: 21 } });
    const mockPosition = { x: 200, y: 198 };
    service.rectWidth = 100;
    service.rectStartPoint = { x: 30, y: 123 };
    service.textAlignement = "right";
    let returnedPoint = service["alignSingleLine"]("mockLine", mockPosition);
    expect(returnedPoint).toEqual({ x: 250, y: 198 });
    expect(service.firstCursorPosition).toEqual({ x: 12, y: 21 });
    expect(measureTextSpy).toHaveBeenCalled();
  });

  it('drawBox should drawBox at specified position', () => {
    const findLongestLineSpy = spyOn<any>(service, "findLongestLine").and.callFake(() => { return 250; });
    service.fontSize = 70;
    service.lines = [" "];
    service.rectEndPoint = { x: 0, y: 0 };
    service.rectStartPoint = { x: 10, y: 20 };
    const mockPosition = { x: 200, y: 198 };
    service["drawBox"](baseCtxStub, mockPosition);
    expect(service.rectWidth).toEqual(250);
    expect(service.rectEndPoint).toEqual({ x: 285.5, y: 114.5 });
    expect(service.rectHeight).toEqual(94.5);
    expect(findLongestLineSpy).toHaveBeenCalled();
  });


  it('onClick should launch the setInterval if first click', () => {
    const setToInitStateSpy = spyOn<any>(service, "setToInitState").and.stub();
    const setIntervalSpy = spyOn<any>(global, "setInterval").and.stub();
    spyOn<any>(service, "drawCursor").and.callFake(() => { return; });
    spyOn<any>(service, "drawTextBox").and.callFake(() => { return; });
    const drawConfirmedTextSpy = spyOn<any>(service, "drawConfirmedText").and.stub();
    service.isCursorMoving = false;
    service.firstClick = true;
    service["onClick"](mouseEvent);
    expect(service.mouseDownCoord).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    expect(setToInitStateSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalled();
    expect(drawConfirmedTextSpy).toHaveBeenCalled();
  });
  it(' writeText should right the text and align it ', () => {
    const alignSingleSpy = spyOn<any>(service, "alignSingleLine").and.callFake(() => { return { x: 200, y: 198 }; });
    const mockPosition = { x: 200, y: 198 };
    service.isCursorMoving = false;
    service.lines = ["test", "test1"];
    service.firstClick = true;
    service["writeText"](baseCtxStub, mockPosition);
    expect(alignSingleSpy).toHaveBeenCalledTimes(2);
  });

});
