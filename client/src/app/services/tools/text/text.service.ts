import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { TextCommand } from '@app/classes/text-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    isWriting: boolean;
    lines: string[];
    cursor: string;
    firstCursorPosition: Vec2;
    currentLinePosition: number;
    textPosition: Vec2;
    intervalId: NodeJS.Timeout;
    textAlignement: string;
    firstClick: boolean;
    fontText: string;
    fontSize: number;
    isBlank: boolean;
    isCursorMoving: boolean;
    fontStyle: string;
    currentChar: number;
    rectStartPoint: Vec2;
    rectEndPoint: Vec2;
    rectHeight: number;
    rectWidth: number = Const.DEFAULT_BOX_WIDTH;
    constructor(drawingService: DrawingService, private invoker: UndoRedoService) {
        super(drawingService);
        this.lineWidth = Const.DEFAULT_FONT_SIZE;
        this.lines = [];
        this.lines.push('');
        this.toolAttributes = ['textPolice'];
        this.isWriting = false;
        this.cursor = '|';
        this.currentLinePosition = 0;
        this.textAlignement = 'left';
        this.firstClick = true;
        this.fontText = 'Arial';
        this.fontSize = Const.DEFAULT_FONT_SIZE;
        this.isBlank = true;
        this.isCursorMoving = false;
        this.fontStyle = 'normal';
        this.currentChar = 0;
        this.rectWidth = Const.DEFAULT_BOX_WIDTH;
    }

    setLineWidth(width: number): void {
        this.fontSize = width;
        if (this.isWriting) this.drawTextBox();
    }
    setFontText(font: string): void {
        this.fontText = font;
        if (this.isWriting) this.drawTextBox();
    }
    setFontStyle(font: string): void {
        this.fontStyle = font;
        if (this.isWriting) this.drawTextBox();
    }
    setAllignement(allignement: string): void {
        this.textAlignement = allignement;
        if (this.isWriting) this.drawTextBox();
    }
    onClick(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.invoker.setIsAllowed(false);
        this.invoker.ClearRedo();
        if (this.firstClick) {
            this.setToInitState();
            this.intervalId = setInterval(() => {
                this.drawTextBox();
                if (!this.isCursorMoving) this.drawCursor(this.drawingService.previewCtx, this.isBlank);
            }, Const.TIMER_MS);
        }
        this.drawConfirmedText(false);
    }

    drawConfirmedText(toolChanged: boolean): void {
        if (!this.isInsideRect() || toolChanged) {
            if (this.lines.length >= 1 && this.lines[0] !== '') {
                this.invoker.setIsAllowed(true);
                const cmd = new TextCommand(this, this.drawingService);
                this.invoker.addToUndo(cmd);
            }
            this.writeText(this.drawingService.baseCtx, this.textPosition);
            clearInterval(this.intervalId);
            this.restoreToInitState();
        }
    }
    private setToInitState(): void {
        this.rectHeight = this.fontSize + Const.HEIGHT_TOLERANCE;
        this.textPosition = { ...this.firstCursorPosition } = { ...this.mouseDownCoord };
        this.rectWidth = Const.DEFAULT_BOX_WIDTH;
        this.isWriting = true;
        this.rectStartPoint = { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y - this.fontSize };
        this.rectEndPoint = { x: this.mouseDownCoord.x + this.rectWidth + Const.CURSOR_LENGHT, y: this.mouseDownCoord.y + Const.HEIGHT_TOLERANCE };
        this.drawTextBox();
        this.firstClick = false;
    }

    private isInsideRect(): boolean {
        if (this.mouseDownCoord)
            return (
                this.mouseDownCoord.x >= this.rectStartPoint.x &&
                this.mouseDownCoord.y >= this.rectStartPoint.y &&
                this.mouseDownCoord.y <= this.rectEndPoint.y &&
                this.mouseDownCoord.x <= this.rectEndPoint.x
            );
        return false;
    }
    private drawBox(ctx: CanvasRenderingContext2D, position: Vec2): void {
        const textMeasure = this.findLongestLine();
        ctx.setLineDash([Const.LINE_DASH_MIN, Const.LINE_DASH_MAX]);
        let widthToAdd = this.fontSize / Const.TEXT_POSITION_TOLERANCE;
        if (widthToAdd <= Const.CURSOR_LENGHT) widthToAdd = Const.WIDTH_TOLERANCE;
        this.rectHeight =
            this.fontSize >= Const.BIG_TEXT_SIZE
                ? this.fontSize * this.lines.length + this.fontSize * Const.HEIGHT_TOLERANCE_BIG_TEXT
                : this.fontSize * this.lines.length + this.fontSize * Const.HEIGHT_TOLERANCE_SMALL_TEXT;
        ctx.strokeStyle = 'blue';
        this.rectWidth = textMeasure > Const.DEFAULT_BOX_WIDTH ? textMeasure : Const.DEFAULT_BOX_WIDTH;
        ctx.strokeRect(position.x, position.y, this.rectWidth + widthToAdd + Const.CURSOR_LENGHT, this.rectHeight);
        this.rectEndPoint.x = this.rectStartPoint.x + this.rectWidth + widthToAdd + Const.CURSOR_LENGHT;
        this.rectEndPoint.y = this.rectStartPoint.y + this.rectHeight;
    }

    writeText(ctx: CanvasRenderingContext2D, position: Vec2): void {
        ctx.fillStyle = this.primaryColor;
        ctx.font = this.fontStyle + ' ' + this.fontSize + 'px ' + this.fontText;
        if (position) {
            this.lines.forEach((line) => {
                const tmpPosition = { ...position };
                position = this.alignSingleLine(line, { ...position });
                ctx.fillText(line, position.x + Const.TEXT_POSITION_TOLERANCE, position.y);
                position = { ...tmpPosition };
                position.y += this.fontSize;
            });
        }
    }
    private findLongestLine(): number {
        let max = 0;
        this.lines.forEach((line) => {
            const lineWidth = this.measureText(line);
            max = lineWidth > max ? lineWidth : max;
        });
        return max;
    }
    private drawTextBox(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawBox(this.drawingService.previewCtx, this.rectStartPoint);
        this.textPosition.y = this.rectStartPoint.y + this.fontSize;
        this.writeText(this.drawingService.previewCtx, { ...this.textPosition });
        if (this.isCursorMoving) this.drawCursor(this.drawingService.previewCtx, false);
    }

    private updateTextPosition(line: string): Vec2 {
        const textWidth: number = this.measureText(line);
        let emptySpaceLeftLength: number = this.rectWidth - textWidth;
        if (this.textAlignement === 'center') emptySpaceLeftLength /= 2;
        return { x: this.rectStartPoint.x + emptySpaceLeftLength, y: this.firstCursorPosition.y };
    }
    private alignSingleLine(line: string, position: Vec2): Vec2 {
        const emptySpaceLeftLength: number = this.rectWidth - this.measureText(line);
        const returnedPoint: Vec2 = { ...position };
        this.firstCursorPosition = this.updateTextPosition(this.lines[this.currentLinePosition]);
        switch (this.textAlignement) {
            case 'center':
                returnedPoint.x += emptySpaceLeftLength / 2;
                break;
            case 'right':
                returnedPoint.x += emptySpaceLeftLength;
                break;
            case 'left':
                this.firstCursorPosition.x = this.rectStartPoint.x;
                break;
        }
        return returnedPoint;
    }
    private measureText(text: string): number {
        return this.drawingService.previewCtx.measureText(text).width;
    }
    private drawCursor(ctx: CanvasRenderingContext2D, isBlank: boolean): void {
        ctx.save();
        this.isBlank = !this.isBlank;
        const position: Vec2 = { x: 0, y: 0 };
        const firstPart = this.lines[this.currentLinePosition].substr(0, this.currentChar);
        position.x = this.firstCursorPosition.x + this.measureText(firstPart);
        position.y = this.textPosition.y + this.currentLinePosition * this.fontSize - Const.CURSOR_POSITION_Y_TOLERANCE * this.fontSize;
        const charWidthToAdd = this.fontText.includes('Times') ? 0 : this.measureText('M') * Const.CHAR_WIDTH_TOLERANCE;
        if (this.fontSize <= Const.SMALL_TEXT_SIZE) position.x += 2;
        ctx.font = this.fontStyle + ' ' + this.fontText;
        ctx.fillStyle = 'black';
        ctx.globalAlpha = isBlank ? 0 : 1;
        ctx.fillText(this.cursor, position.x - charWidthToAdd, position.y);
        ctx.restore();
    }
    onKeyDown(event: KeyboardEvent): void {
        if (this.isWriting) {
            this.isCursorMoving = true;
            if (event.key.length === 1) this.printableKeyTreatment(event);
            else {
                switch (event.key) {
                    case 'Backspace':
                        this.backSpaceKeyTreatment();
                        break;
                    case 'Delete':
                        this.deleteKeyTreatment();
                        break;
                    case 'Enter':
                        this.enterKeyTreatment();
                        break;
                    case 'Escape':
                        this.restoreToInitState();
                        break;
                    case 'ArrowRight':
                        this.shiftHorizontally(1, this.lines[this.currentLinePosition].length);
                        break;
                    case 'ArrowLeft':
                        this.shiftHorizontally(Const.NEGATIV_STEP, 0);
                        break;
                    case 'ArrowUp':
                        this.shiftVertically(Const.NEGATIV_STEP);
                        break;
                    case 'ArrowDown':
                        this.shiftVertically(1);
                        break;
                }
            }
            this.updateTextPosition(this.lines[this.currentLinePosition]);
            this.drawTextBox();
            this.isCursorMoving = false;
        }
    }
    private deleteKeyTreatment(): void {
        if (this.lines[this.currentLinePosition].length !== this.currentChar) {
            const leftPart: string = this.lines[this.currentLinePosition].substring(0, this.currentChar);
            const rightPart: string = this.lines[this.currentLinePosition].substring(this.currentChar + 1);
            this.lines[this.currentLinePosition] = leftPart + '' + rightPart;
        } else {
            if (this.lines[this.currentLinePosition + 1] !== undefined) {
                this.lines[this.currentLinePosition] += this.lines[this.currentLinePosition + 1];
                this.lines.splice(this.currentLinePosition + 1, 1);
            }
        }
    }

    private printableKeyTreatment(event: KeyboardEvent): void {
        const leftPart = this.lines[this.currentLinePosition].substr(0, this.currentChar);
        const rightPart = this.lines[this.currentLinePosition].substr(
            this.currentChar,
            this.lines[this.currentLinePosition].length - this.currentChar,
        );
        this.lines[this.currentLinePosition] = leftPart + event.key + rightPart;
        this.currentChar++;
    }

    private backSpaceKeyTreatment(): void {
        if (this.currentChar === 0 && this.lines[this.currentLinePosition] !== undefined) {
            if (this.lines[this.currentLinePosition - 1] !== undefined) {
                this.currentChar = this.lines[this.currentLinePosition - 1].length;
                this.lines[this.currentLinePosition - 1] += this.lines[this.currentLinePosition];
                this.lines.splice(this.currentLinePosition, 1);
                this.currentLinePosition--;
            }
        } else {
            this.currentChar--;
            this.lines[this.currentLinePosition] =
                this.lines[this.currentLinePosition].substring(0, this.currentChar) +
                '' +
                this.lines[this.currentLinePosition].substring(this.currentChar + 1);
        }
    }

    private restoreToInitState(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.isWriting = false;
        this.firstClick = true;
        this.lines = [];
        this.currentLinePosition = 0;
        this.currentChar = 0;
        this.lines.push('');
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
        } else this.currentChar += step;
    }
}
