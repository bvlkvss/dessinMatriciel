import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
const DEFAULT_COLOR = '#000000';
// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
// tslint:disable:no-empty
export abstract class Tool {
    toolAttributes: string[];
    mouseDownCoord: Vec2;
    mouseDown: boolean;
    mouseOutCoord: Vec2;
    lineWidth: number;
    currentPos: Vec2;
    isOut: boolean;
    width: number;
    height: number;
    opacity: number;
    primaryColor: string;
    secondaryColor: string;

    constructor(protected drawingService: DrawingService) {
        this.isOut = false;
        this.mouseDown = false;
        this.primaryColor = DEFAULT_COLOR;
        this.secondaryColor = DEFAULT_COLOR;
    }

    setMouseDown(bool: boolean): void {
        this.mouseDown = bool;
    }
    onClick(event: MouseEvent): void {}
    onMouseDown(event: MouseEvent): void {}
    onRightClick(event: MouseEvent): void {}
    onDblClick(event: MouseEvent): void {}
    onMouseUp(event: MouseEvent): void {}
    onMouseOut(event: MouseEvent): void {}
    onMouseEnter(event: MouseEvent): void {}
    onKeyDown(event: KeyboardEvent): void {}
    onMouseMove(event: MouseEvent): void {}
    onKeyUp(event: KeyboardEvent): void {}
    setPrimaryColor(color: string): void {}
    setSecondaryColor(color: string): void {}
    setLineWidth(value: number): void {}

    findMax(leftBound: number, rightBound: number): number {
        return Math.max(leftBound, rightBound);
    }
    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    hexToColor(hex: string): Color {
        // tslint:disable:no-magic-numbers
        const redNum = parseInt(hex.slice(1, 3), 16);
        const greenNum = parseInt(hex.slice(3, 5), 16);
        const blueNum = parseInt(hex.slice(5, 7), 16);
        const opacityNum = parseInt(hex.slice(7, 9), 16);
        const color: Color = { red: redNum, green: greenNum, blue: blueNum, opacity: opacityNum };

        return color;
    }

    getLineWidth(): number {
        return this.lineWidth;
    }
}
