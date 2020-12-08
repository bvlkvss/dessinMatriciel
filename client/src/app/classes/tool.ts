import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
const DEFAULT_COLOR = '#000000';
const RGBA_NUMBER_OF_COMPONENTS = 4;
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
    static shouldAlign: boolean;

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

    protected getMax(arr: number[]): number {
        let len = arr.length;
        let max = -Infinity;

        while (len--) {
            max = arr[len] > max ? arr[len] : max;
        }
        return max;
    }

    protected getMin(arr: number[]): number {
        let len = arr.length;
        let min = Infinity;

        while (len--) {
            min = arr[len] < min ? arr[len] : min;
        }
        return min;
    }

    protected getActualColor(position: Vec2): Color {
        const imageData = this.drawingService.baseCtx.getImageData(position.x, position.y, 1, 1);
        return this.getColorFromData(imageData);
    }

    protected getColorFromData(imageData: ImageData): Color {
        // tslint:disable:no-magic-numbers
        let redData = 0;
        let greenData = 0;
        let blueData = 0;
        let opacityData = 0;
        for (let j = 0; j < imageData.data.length; j += RGBA_NUMBER_OF_COMPONENTS) {
            redData = imageData.data[j];
            greenData = imageData.data[j + 1];
            blueData = imageData.data[j + 2];
            opacityData = imageData.data[j + 3];
        }
        return { red: redData, green: greenData, blue: blueData, opacity: opacityData };
    }

    protected areColorsMatching(color: Color, imageData: ImageData, position: number, tolerance: number = 0): boolean {
        let areColorsMatching = true;
        const pixelRed = imageData.data[position];
        const pixelGreen = imageData.data[position + 1];
        const pixelBlue = imageData.data[position + 2];

        areColorsMatching = areColorsMatching && pixelRed >= color.red - tolerance && pixelRed <= color.red + tolerance;
        areColorsMatching = areColorsMatching && pixelGreen >= color.green - tolerance && pixelGreen <= color.green + tolerance;
        areColorsMatching = areColorsMatching && pixelBlue >= color.blue - tolerance && pixelBlue <= color.blue + tolerance;
        return areColorsMatching;
    }

    protected fillPixel(imageData: ImageData, position: number): void {
        const color: Color = this.hexToColor(this.primaryColor);
        imageData.data[position] = color.red;
        imageData.data[position + 1] = color.green;
        imageData.data[position + 2] = color.blue;
    }

    protected getPositionFromPixel(pixel: number, width: number): Vec2 {
        const x = (pixel / RGBA_NUMBER_OF_COMPONENTS) % width;
        const y = Math.floor(pixel / RGBA_NUMBER_OF_COMPONENTS / width);
        return { x, y };
    }
}
