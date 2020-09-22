import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;

    mouseOutCoord: Vec2;
    currentPos: Vec2;
    isOut: boolean = false;
    width: number;
    height: number;
    primaryColor: string; // by default black
    secondaryColor: Color = { red: 0, green: 0, blue: 0 }; //  by default black

    constructor(protected drawingService: DrawingService) { }

    setMouseDown(bool: boolean): void {
        this.mouseDown = bool;
    }

    onMouseDown(event: MouseEvent): void { }

    onMouseUp(event: MouseEvent): void { }
    onMouseOut(event: MouseEvent): void { }
    onMouseEnter(event: MouseEvent): void { }

    onKeyDown(event: KeyboardEvent): void { }

    onMouseMove(event: MouseEvent): void { }

    onKeyUp(event: KeyboardEvent): void { }
    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
}
