import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';

import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root'
})
export class SprayPaintService extends Tool {
    radius: number = 20;
    dropletRadius: number = 1;
    period: number = 1/700*1000;
    interval: NodeJS.Timeout;
    currentMousePos: Vec2;
    density:number = 10;


    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toolAttributes = ['sprayWidth', 'sprayInterval','dropletsWidth' ];
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown) {
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.currentMousePos = this.mouseDownCoord = this.getPositionFromMouse(event);
            this.interval = setInterval(() => {
                this.spray(this.drawingService.baseCtx, this.currentMousePos);
            }, this.period);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            // const cmd = new PencilCommand(this.pathData, this, this.drawingService) as PencilCommand;
            // this.invoker.addToUndo(cmd);
            // this.invoker.setIsAllowed(true);
        }
        clearInterval(this.interval);
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentMousePos = this.getPositionFromMouse(event);
        };
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) this.spray(this.drawingService.baseCtx, this.currentMousePos);
        clearInterval(this.interval);
    }


    onMouseEnter(event: MouseEvent): void {
        if (this.mouseDown){
            this.interval = setInterval(() => {
                this.spray(this.drawingService.baseCtx, this.currentMousePos);
            }, this.period);
        }
    }

    spray(ctx: CanvasRenderingContext2D, position: Vec2) {
        ctx.lineCap = 'round';
        for (var i = 0; i < this.density; i++) {
            var offset = this.getRandomOffset();
            var x = position.x + offset.x, y = position.y + offset.y;
            ctx.beginPath();
            ctx.arc(x, y, this.dropletRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.fillStyle = ctx.strokeStyle = this.primaryColor;
            ctx.fill();
            ctx.stroke();
        }
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    getRandomOffset() {
        var randomAngle = Math.random() * 360;
        var randomRadius = Math.random() * this.radius;

        return {
            x: Math.cos(randomAngle) * randomRadius,
            y: Math.sin(randomAngle) * randomRadius
        };
    }

    setDropletsWidth( radius: number ): void{
        this.dropletRadius = radius;
    }

    setfrequency(freq: number): void{
        this.period = 1/freq*1000;
    }

    setRadius(radius: number): void{
        this.radius = radius;
    }


}