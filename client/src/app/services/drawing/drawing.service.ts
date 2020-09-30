import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    resizeCanvas(): void {
        let workspaceX = document.querySelectorAll('#background-vue')[0].clientWidth;
        let workspaceY = document.querySelectorAll('#background-vue')[0].clientHeight;
        if (workspaceX <= 500 && workspaceY <= 500) {
            this.canvasSize.x = 250;
            this.canvasSize.y = 250;
        } else {
            this.canvasSize = { x: (workspaceX - 50) / 2, y: workspaceY / 2 };
        }
    }
    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
