import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

const HANDLE_LENGTH = 6;
const HANDLE_OFFSET = HANDLE_LENGTH / 2;
const MOVEMENT_OFFSET = 3;
const INIT_MOVE_DELAY = 500;
const CONTINUOUS_MOVE_DELAY = 100;
const DEFAULT_DEGREE_STEP = 15;
export class Movable extends Tool {
    moveDelayActive: boolean;
    continuousMove: boolean;
    selectionStartPoint: Vec2;
    selectionEndPoint: Vec2;
    firstSelectionMove: boolean;
    offsetX: number;
    offsetY: number;
    keysDown: { [key: string]: boolean };
    width: number;
    height: number;
    resizingHandles: Vec2[];
    handlesCentreReference: Vec2[] = [];
    degres: number = 0;
    signe: Vec2 = { x: 1, y: 1 };

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.resizingHandles = [];
        this.keysDown = {};
        this.moveDelayActive = false;
        this.continuousMove = false;
        this.firstSelectionMove = true;
        this.SetHandlesCentreReference();
    }

    updateSelectionNodes(): void {
        this.signe.x = Math.sign(-this.selectionEndPoint.x + this.selectionStartPoint.x);
        this.signe.y = Math.sign(-this.selectionEndPoint.y + this.selectionStartPoint.y);
        if (this.selectionEndPoint.y < this.selectionStartPoint.y) {
            this.selectionEndPoint.y = this.selectionStartPoint.y;
            this.selectionStartPoint.y -= this.height;
        }
        if (this.selectionEndPoint.x < this.selectionStartPoint.x) {
            this.selectionEndPoint.x = this.selectionStartPoint.x;
            this.selectionStartPoint.x -= this.width;
        }
    }

    moveSelection(endpoint: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.selectionStartPoint = { x: endpoint.x - this.offsetX, y: endpoint.y - this.offsetY };
        this.selectionEndPoint = {
            x: this.selectionStartPoint.x + this.width,
            y: this.selectionStartPoint.y + this.height,
        };
    }

    async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async moveSelectionWithKeys(): Promise<void> {
        this.offsetX = 0;
        this.offsetY = 0;

        if (!this.moveDelayActive) {
            this.moveDelayActive = true;
            if (this.keysDown.ArrowRight) {
                this.selectionStartPoint.x += MOVEMENT_OFFSET;
            }
            if (this.keysDown.ArrowLeft) {
                this.selectionStartPoint.x -= MOVEMENT_OFFSET;
            }
            if (this.keysDown.ArrowUp) {
                this.selectionStartPoint.y -= MOVEMENT_OFFSET;
            }

            if (this.keysDown.ArrowDown) {
                this.selectionStartPoint.y += MOVEMENT_OFFSET;
            }

            this.moveSelection(this.selectionStartPoint);
            if (!this.continuousMove) {
                await this.delay(INIT_MOVE_DELAY);
                this.continuousMove = true;
            } else await this.delay(CONTINUOUS_MOVE_DELAY);
            this.moveDelayActive = false;
        }
    }

    getRotatedHandlePos(element: Vec2): Vec2 {
        const tempX = element.x - (this.selectionStartPoint.x + Math.abs(this.width / 2));
        const tempY = element.y - (this.selectionStartPoint.y + Math.abs(this.height / 2));
        const rotatedX = tempX * Math.cos((this.degres * Math.PI) / 180) - tempY * Math.sin((this.degres * Math.PI) / 180);
        const rotatedY = tempY * Math.cos((this.degres * Math.PI) / 180) + tempX * Math.sin((this.degres * Math.PI) / 180);
        return { x: rotatedX + this.selectionStartPoint.x + this.width / 2, y: rotatedY + this.selectionStartPoint.y + this.height / 2 } as Vec2;
    }

    updateResizingHandles(): void {
        this.resizingHandles = [];

        /*
  1 2 3
  4   5
  6 7 8
*/
        // 1
        this.resizingHandles.push({
            x: this.selectionStartPoint.x - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET,
        });
        // 2
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width / 2 - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET,
        });
        // 3
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET,
        });
        // 4
        this.resizingHandles.push({
            x: this.selectionStartPoint.x - HANDLE_OFFSET,
            y: this.selectionStartPoint.y + this.height / 2 - HANDLE_OFFSET,
        });
        // 5
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET + this.height / 2,
        });
        // 6
        this.resizingHandles.push({
            x: this.selectionStartPoint.x - HANDLE_OFFSET,
            y: this.selectionStartPoint.y - HANDLE_OFFSET + this.height,
        });
        // 7
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width / 2 - HANDLE_OFFSET,
            y: this.selectionStartPoint.y + this.height - HANDLE_OFFSET,
        });
        // 8
        this.resizingHandles.push({
            x: this.selectionStartPoint.x + this.width - HANDLE_OFFSET,
            y: this.selectionStartPoint.y + this.height - HANDLE_OFFSET,
        });
    }

    updateDegree(event: any, alt: boolean): void {
        if (event.wheelDelta > 0) {
            if (alt) {
                ++this.degres;
            } else {
                this.degres += DEFAULT_DEGREE_STEP;
            }
        } else {
            if (alt) {
                --this.degres;
            } else {
                this.degres -= DEFAULT_DEGREE_STEP;
            }
        }
    }
    SetHandlesCentreReference(): void {
        this.handlesCentreReference = [];

        /*
  1 2 3
  4   5
  6 7 8
*/
        // 1
        this.handlesCentreReference.push({
            x: -this.width / 2 - HANDLE_OFFSET,
            y: -this.height / 2 - HANDLE_OFFSET,
        });
        // 2
        this.handlesCentreReference.push({
            x: -HANDLE_OFFSET,
            y: -this.height / 2 - HANDLE_OFFSET,
        });
        // 3
        this.handlesCentreReference.push({
            x: this.width / 2 - HANDLE_OFFSET,
            y: -this.height / 2 - HANDLE_OFFSET,
        });
        // 4
        this.handlesCentreReference.push({
            x: -this.width / 2 - HANDLE_OFFSET,
            y: -HANDLE_OFFSET,
        });
        // 5
        this.handlesCentreReference.push({
            x: this.width / 2 - HANDLE_OFFSET,
            y: -HANDLE_OFFSET,
        });
        // 6
        this.handlesCentreReference.push({
            x: -this.width / 2 - HANDLE_OFFSET,
            y: this.height / 2 - HANDLE_OFFSET,
        });
        // 7
        this.handlesCentreReference.push({
            x: -HANDLE_OFFSET,
            y: this.height / 2 - HANDLE_OFFSET,
        });
        // 8
        this.handlesCentreReference.push({
            x: this.width / 2 - HANDLE_OFFSET,
            y: this.height / 2 - HANDLE_OFFSET,
        });
    }

    drawResizingHandles(): void {
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.fillStyle = '#ffffff';
        this.drawingService.previewCtx.strokeStyle = 'blue';
        this.drawingService.previewCtx.lineWidth = 2;
        this.drawingService.previewCtx.setLineDash([0, 0]);
        for (const handle of this.handlesCentreReference) {
            this.drawingService.previewCtx.rect(handle.x, handle.y, HANDLE_LENGTH, HANDLE_LENGTH);
        }
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.fill();
        this.drawingService.previewCtx.closePath();
        this.drawingService.previewCtx.restore();
    }

    drawRotatedHandles(): void {
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.fillStyle = '#ffffff';
        this.drawingService.previewCtx.strokeStyle = 'blue';
        this.drawingService.previewCtx.lineWidth = 2;
        this.drawingService.previewCtx.setLineDash([0, 0]);
        for (const handle of this.handlesCentreReference) {
            this.drawingService.previewCtx.rect(handle.x, handle.y, HANDLE_LENGTH, HANDLE_LENGTH);
        }
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.fill();
        this.drawingService.previewCtx.closePath();
        this.drawingService.previewCtx.restore();
    }
}
