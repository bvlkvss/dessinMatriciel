import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';


const DEFAULT_BOX_WIDTH = 200;
@Injectable({
  providedIn: 'root',
})
export class TextService extends Tool {
  isRighting: boolean = false;
  lines: string[] = [];
  cursor: string = '|';
  firstCursorPosition: Vec2;
  currentLinePosition: number = 0;
  textPosition: Vec2;
  intervalId: NodeJS.Timeout;
  textAlignement: string = "left";
  firstClick: boolean = true;
  fontText: string = 'Arial';
  fontSize: number = 30;
  isBlank: boolean = true;
  fontStyle: string = 'normal';
  rectStartPoint: Vec2;
  rectEndPoint: Vec2;
  isCursorMoving: boolean = false;
  currentChar: number = 0;
  rectHeight: number;
  rectWidth: number = DEFAULT_BOX_WIDTH;
  constructor(drawingService: DrawingService) {
    super(drawingService);
    this.lineWidth = 0;
    this.lines.push("");
    this.toolAttributes = ['textPolice'];
  }

  setLineWidth(width: number): void {
    this.fontSize = width;
    if (this.isRighting)
      this.drawTextBox();
  }
  setFontText(font: string): void {
    this.fontText = font;
    if (this.isRighting)
      this.drawTextBox();

  }
  setFontStyle(font: string): void {
    this.fontStyle = font;
    if (this.isRighting)
      this.drawTextBox();

  }
  setAllignement(allignement: string): void {
    this.textAlignement = allignement;
    if (this.isRighting)
      this.drawTextBox();
  }
  onClick(event: MouseEvent): void {
    this.mouseDownCoord = this.getPositionFromMouse(event);
    if (this.firstClick) {
      this.setToInitState();
      this.intervalId = setInterval(() => {
        this.drawTextBox();
        if (!this.isCursorMoving)
          this.drawCursor(this.drawingService.previewCtx, this.isBlank);
      }, 500);
    }
    this.drawConfirmedText(false);
  }

  drawConfirmedText(toolChanged: boolean): void {
    if (!this.isInsideRect() || toolChanged) {
      this.writeText(this.drawingService.baseCtx, this.textPosition);
      clearInterval(this.intervalId);
      this.restoreToInitState();
    }
  }
  private setToInitState() {
    this.rectHeight = this.fontSize + 10;
    this.textPosition = { ...this.firstCursorPosition } = { ...this.mouseDownCoord };
    this.rectWidth = DEFAULT_BOX_WIDTH;
    this.isRighting = true;
    this.rectStartPoint = { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y - this.fontSize };
    if (this.fontSize >= 50) {
      this.textPosition.y -= this.fontSize * 0.6;
      this.firstCursorPosition.y -= this.fontSize * 0.5;
    }
    this.rectEndPoint = { x: this.mouseDownCoord.x + this.rectWidth + 8, y: this.mouseDownCoord.y + 10 };
    this.drawTextBox();
    this.firstClick = false;
  }

  private isInsideRect(): boolean {
    return (this.mouseDownCoord.x >= this.rectStartPoint.x && this.mouseDownCoord.y >= this.rectStartPoint.y &&
      this.mouseDownCoord.y <= this.rectEndPoint.y && this.mouseDownCoord.x <= this.rectEndPoint.x)
  }
  private drawBox(ctx: CanvasRenderingContext2D, position: Vec2): void {
    const textMeasure = this.findLongestLine();
    ctx.setLineDash([4, 5]);
    let widthToAdd = this.fontSize >= 55 ? textMeasure * 0.070 : textMeasure * 0.065;
    if (widthToAdd <= 8)
      widthToAdd = 12;
    this.rectHeight = this.fontSize >= 60 ? this.fontSize * this.lines.length + this.fontSize / 4 : this.fontSize * this.lines.length + this.fontSize / 2;
    ctx.strokeStyle = "blue";
    if (textMeasure > DEFAULT_BOX_WIDTH) {
      this.rectWidth = textMeasure;
      this.rectEndPoint.x = this.rectStartPoint.x + this.rectWidth + 8;
      this.rectEndPoint.y = this.rectStartPoint.y + this.rectHeight;
      ctx.strokeRect(position.x, position.y, this.rectWidth + widthToAdd, this.rectHeight);
    }
    else {
      this.rectWidth = DEFAULT_BOX_WIDTH;
      ctx.strokeRect(position.x, position.y, this.rectWidth + widthToAdd + 8, this.rectHeight);
    }

  }

  private writeText(ctx: CanvasRenderingContext2D, position: Vec2): void {
    ctx.fillStyle = this.primaryColor;
    ctx.font = this.fontStyle + " " + this.fontSize + 'px ' + this.fontText;
    let heightToAdd = this.fontSize >= 50 ? this.fontSize * 0.6 : (0.2 * this.fontSize);

    if (position) {
      position.y += heightToAdd;
      this.lines.forEach((line) => {
        let tmpPosition = { ...position };
        position = this.alignSingleLine(line, { ...position });
        ctx.fillText(line, position.x + 4, position.y);
        position = { ...tmpPosition };
        position.y += this.fontSize;
      });
    }

  }
  private findLongestLine(): number {
    let max: number = 0;
    this.lines.forEach(line => {
      const lineWidth = this.measureText(line);
      max = lineWidth > max ? lineWidth : max;
    });
    return max;
  }
  private drawTextBox(): void {
    this.drawingService.clearCanvas(this.drawingService.previewCtx);
    this.drawBox(this.drawingService.previewCtx, this.rectStartPoint);
    this.writeText(this.drawingService.previewCtx, { ... this.textPosition });
    if (this.isCursorMoving)
      this.drawCursor(this.drawingService.previewCtx, false);
  }

  private updateTextPosition(line: string): Vec2 {
    const textWidth: number = this.measureText(line);
    let emptySpaceLeftLength: number = this.rectWidth - textWidth;
    if (this.textAlignement === "center")
      emptySpaceLeftLength /= 2;
    return { x: this.rectStartPoint.x + emptySpaceLeftLength, y: this.firstCursorPosition.y };

  }
  private alignSingleLine(line: string, position: Vec2): Vec2 {
    const emptySpaceLeftLength: number = this.rectWidth - this.measureText(line);
    let returnedPoint: Vec2 = { ...position };
    this.firstCursorPosition = this.updateTextPosition(this.lines[this.currentLinePosition]);
    switch (this.textAlignement) {
      case "center":
        returnedPoint.x += (emptySpaceLeftLength / 2); break;
      case "right":
        returnedPoint.x += emptySpaceLeftLength; break;
      case "left":
        this.firstCursorPosition.x = this.rectStartPoint.x; break;
    }
    return returnedPoint;
  }
  private measureText(text: string): number {
    return this.drawingService.previewCtx.measureText(text).width
  }
  private drawCursor(ctx: CanvasRenderingContext2D, isBlank: boolean): void {
    ctx.save();
    this.isBlank = !this.isBlank;
    let position: Vec2 = { x: 0, y: 0 };
    const firstPart = this.lines[this.currentLinePosition].substr(0, this.currentChar);
    let heightToAdd = this.fontSize >= 50 ? this.fontSize * 0.45 : (0.15 * this.fontSize);
    position.x = this.firstCursorPosition.x + this.measureText(firstPart)
    position.y = this.firstCursorPosition.y + this.currentLinePosition * this.fontSize + heightToAdd;
    if (this.fontSize <= 15)
      position.x += 3;
    ctx.font = this.fontStyle + " " + this.fontText;
    ctx.fillStyle = "black";
    ctx.globalAlpha = isBlank ? 0 : 1;
    ctx.fillText(this.cursor, position.x - 1, position.y);
    ctx.restore();
  }
  onKeyDown(event: KeyboardEvent): void {
    if (this.isRighting) {
      this.isCursorMoving = true;
      if (event.key.length === 1)
        this.printableKeyTreatment(event);
      else {
        switch (event.key) {
          case 'Backspace':
            this.backSpaceKeyTreatment(); break;
          case 'Delete':
            this.deleteKeyTreatment();
            break;
          case 'Enter':
            this.enterKeyTreatment(); break;
          case 'Escape':
            this.restoreToInitState(); break;
          case "ArrowRight":
            this.shiftHorizontally(1, this.lines[this.currentLinePosition].length); break;
          case "ArrowLeft":
            this.shiftHorizontally(-1, 0); break;
          case "ArrowUp":
            this.shiftVertically(-1); break;
          case "ArrowDown":
            this.shiftVertically(1); break
        }
      }
      this.updateTextPosition(this.lines[this.currentLinePosition]);
      this.drawTextBox();
      this.isCursorMoving = false;
    }
  }
  private deleteKeyTreatment() {
    if (this.lines[this.currentLinePosition].length !== this.currentChar) {
      const leftPart: string = this.lines[this.currentLinePosition].substring(0, this.currentChar);
      const rightPart: string = this.lines[this.currentLinePosition].substring(this.currentChar + 1);
      this.lines[this.currentLinePosition] = leftPart + "" + rightPart;
    }
  }

  private printableKeyTreatment(event: KeyboardEvent) {
    const leftPart = this.lines[this.currentLinePosition].substr(0, this.currentChar);
    const rightPart = this.lines[this.currentLinePosition].substr(this.currentChar, this.lines[this.currentLinePosition].length - this.currentChar);
    this.lines[this.currentLinePosition] = leftPart + event.key + rightPart;
    this.currentChar++;
  }

  private backSpaceKeyTreatment() {
    if (this.currentChar === 0 && this.lines[this.currentLinePosition] !== undefined) {
      if (this.lines[this.currentLinePosition - 1] !== undefined) {
        this.currentChar = this.lines[this.currentLinePosition - 1].length;
        this.lines[this.currentLinePosition - 1] += this.lines[this.currentLinePosition];
        this.lines.splice(this.currentLinePosition, 1);
        this.currentLinePosition--;
      }
    }
    else {
      this.currentChar--;
      this.lines[this.currentLinePosition] = this.lines[this.currentLinePosition].substring(0, this.currentChar) + "" + this.lines[this.currentLinePosition].substring(this.currentChar + 1);
    }
  }

  private restoreToInitState(): void {
    this.drawingService.clearCanvas(this.drawingService.previewCtx);
    this.isRighting = false;
    this.firstClick = true;
    this.lines = [];
    this.currentLinePosition = 0;
    this.currentChar = 0;
    this.lines.push("");
  }
  setPrimaryColor(color: string): void {
    this.primaryColor = color;
  }

  private enterKeyTreatment(): void {
    const rightSide: string = this.lines[this.currentLinePosition].slice(this.currentChar);
    this.lines[this.currentLinePosition] = this.lines[this.currentLinePosition].slice(0, this.currentChar);
    this.lines.splice(this.currentLinePosition + 1, 0, rightSide);
    this.currentLinePosition++;
    this.currentChar = 0;
    this.rectEndPoint.y += this.fontSize;
  }
  private shiftVertically(step: number): void {
    if (this.lines[this.currentLinePosition + step] !== undefined) {
      if (this.lines[this.currentLinePosition + step].charAt(this.currentChar).length === 0)
        this.currentChar = this.lines[this.currentLinePosition + step].length;
      this.currentLinePosition += step;
    }
  }
  private shiftHorizontally(step: number, lineLenght: number): void {
    if (this.currentChar === lineLenght) {
      if (this.lines[this.currentLinePosition + step] !== undefined) {
        this.currentChar = step < 0 ? this.lines[this.currentLinePosition + step].length : 0;
        this.currentLinePosition += step;
      }
    }
    else
      this.currentChar += step;
  }

}
