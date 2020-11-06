import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;

const MIN_WORKSPACE_SIZE = 500;
const MIN_CANVAS_SIZE = 250;
const SIDEBAR_WIDTH = 50;

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    canvasContainer: HTMLDivElement;

    blankCanvasDataUrl: string;
    canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    resizeCanvas(): void {
        const workspaceX = document.querySelectorAll('#background-vue')[0].clientWidth;
        const workspaceY = document.querySelectorAll('#background-vue')[0].clientHeight;

        if (workspaceX <= MIN_WORKSPACE_SIZE || workspaceY <= MIN_WORKSPACE_SIZE) {
            this.canvasSize.x = MIN_CANVAS_SIZE;
            this.canvasSize.y = MIN_CANVAS_SIZE;
        } else {
            this.canvasSize = { x: (workspaceX - SIDEBAR_WIDTH) / 2, y: workspaceY / 2 };
        }
    }

    newDrawing(): void {
        if (window.confirm('Voulez vous créer un nouveau dessin?\nCette action va supprimer le dessin actuel')) {
            this.clearCanvas(this.baseCtx);
            this.clearCanvas(this.previewCtx);
            this.resizeCanvas();
        }
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.canvas.style.cursor = 'crosshair';
    }

    restoreCanvasState(): void {
        this.baseCtx.restore();
        this.previewCtx.restore();
        this.baseCtx.save();
        this.previewCtx.save();
    }
}
