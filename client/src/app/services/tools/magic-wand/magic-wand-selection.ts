import { Movable } from '@app/classes/movable';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
export class MagicWandSelection extends Movable {
    constructor(
        drawingService: DrawingService,
        invoker: UndoRedoService,
        canvas: HTMLCanvasElement,
        selectionStartPoint: Vec2,
        selectionEndPoint: Vec2,
        width: number,
        height: number,
    ) {
        super(drawingService, invoker);
        this.selectionData = canvas;
        this.selectionStartPoint = selectionStartPoint;
        this.selectionEndPoint = selectionEndPoint;
        this.width = width;
        this.height = height;
    }
}
