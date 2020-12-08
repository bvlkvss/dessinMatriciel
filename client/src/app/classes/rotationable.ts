import { Vec2 } from '@app/classes/vec2';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { Movable } from './movable';
import { Tool } from './tool';
const DEFAULT_DEGREE_STEP = 15;
export const PI_DEGREE = 180;

export class Rotationable {
    getRotatedGeniric(point: Vec2, centre: Vec2, angle: number): Vec2 {
        return {
            x: (point.x - centre.x) * Math.cos(angle) - (point.y - centre.y) * Math.sin(angle) + centre.x,
            y: (point.x - centre.x) * Math.sin(angle) + (point.y - centre.y) * Math.cos(angle) + centre.y,
        };
    }

    getUnrotatedPos(this: Movable, element: Vec2): Vec2 {
        const centre = {
            x: (this.selectionStartPoint.x + this.selectionEndPoint.x) / 2,
            y: (this.selectionStartPoint.y + this.selectionEndPoint.y) / 2,
        } as Vec2;
        const tempX = element.x - centre.x;
        const tempY = element.y - centre.y;
        const rotatedX = tempX * Math.cos((this.degres * Math.PI) / PI_DEGREE) + tempY * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        const rotatedY = tempY * Math.cos((this.degres * Math.PI) / PI_DEGREE) - tempX * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        return { x: rotatedX + centre.x, y: rotatedY + centre.y } as Vec2;
    }

    getRotatedPos(this: Movable, element: Vec2): Vec2 {
        const centre = {
            x: (this.selectionStartPoint.x + this.selectionEndPoint.x) / 2,
            y: (this.selectionStartPoint.y + this.selectionEndPoint.y) / 2,
        } as Vec2;
        const tempX = element.x - centre.x;
        const tempY = element.y - centre.y;
        const rotatedX = tempX * Math.cos((this.degres * Math.PI) / PI_DEGREE) - tempY * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        const rotatedY = tempY * Math.cos((this.degres * Math.PI) / PI_DEGREE) + tempX * Math.sin((this.degres * Math.PI) / PI_DEGREE);
        return {
            x: rotatedX + centre.x,
            y: rotatedY + centre.y,
        } as Vec2;
    }

    updateDegree(this: Movable | StampService, event: WheelEvent): void {
        if (event.deltaY < 0) {
            this.degres += event.altKey ? 1 : DEFAULT_DEGREE_STEP;
        } else if (event.deltaY > 0) {
            this.degres -= event.altKey ? 1 : DEFAULT_DEGREE_STEP;
        }

        Tool.shouldAlign = true;
    }
}
