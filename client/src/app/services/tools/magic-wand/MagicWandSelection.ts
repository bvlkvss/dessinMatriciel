import { Movable } from '../../../classes/movable';
import { Vec2 } from '../../../classes/vec2';
import { DrawingService } from '../../drawing/drawing.service';
export class MagicWandSelection extends Movable {
        canvas:HTMLCanvasElement
    constructor(drawingService: DrawingService, canvas: HTMLCanvasElement,
        selectionStartPoint: Vec2,
        selectionEndPoint: Vec2,
        width: number,
        height: number) {
        super(drawingService);
        this.canvas = canvas;
        this.selectionStartPoint = selectionStartPoint;
        this.selectionEndPoint = selectionEndPoint;
        this.width = width;
        this.height = height;
    }
}