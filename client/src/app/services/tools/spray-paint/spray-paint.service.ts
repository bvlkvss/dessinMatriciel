import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';

import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

const DEFAULT_PENCIL_WIDTH = 1;


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


    private pathData: Vec2[];
    radius: number = 20;
    dropletRadius: number = 1;
    interval: NodeJS.Timeout;
    interval2: NodeJS.Timeout;






    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);

        this.toolAttributes = ['lineWidth'];
        this.lineWidth = DEFAULT_PENCIL_WIDTH;
        this.clearPath();

    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown) {
            this.invoker.ClearRedo();
            this.invoker.setIsAllowed(false);
            this.clearPath();
            const mousePosition = this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.interval = setInterval(() => { 
                this.spray(this.drawingService.baseCtx, mousePosition); 
            }, 10);
        } 

    }

    onMouseOut(event: MouseEvent): void {
        this.clearPath();
    }

    onMouseEnter(event: MouseEvent): void {
        this.clearPath();
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
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {

        if (this.mouseDown) {
            console.log('mousemove');
            const mousePosition = this.getPositionFromMouse(event);
            //this.interval2 = setInterval(() => { this.spray(this.drawingService.baseCtx, mousePosition); }, 10);
            this.spray(this.drawingService.baseCtx, mousePosition);
            //clearInterval(this.interval2);
        };

    }

    spray(ctx: CanvasRenderingContext2D, position: Vec2) {
        ctx.lineCap = 'round';

       
            for (var i = 0; i < 1; i++) {
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

    private clearPath(): void {
        this.pathData = [];
    }

    getRandomOffset() {
        var randomAngle = Math.random() * 360;
        var randomRadius = Math.random() * this.radius;

        return {
            x: Math.cos(randomAngle) * randomRadius,
            y: Math.sin(randomAngle) * randomRadius
        };
    }

}

// var el = document.getElementById('c');
// var ctx = el.getContext('2d');
// var clientX, clientY, timeout;
// var density = 50;

// function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// el.onmousedown = function (e) {
//     ctx.lineJoin = ctx.lineCap = 'round';
//     clientX = e.clientX;
//     clientY = e.clientY;

//     timeout = setTimeout(function draw() {
//         for (var i = density; i--;) {
//             var radius = 30;
//             var offsetX = getRandomInt(-radius, radius);
//             var offsetY = getRandomInt(-radius, radius);
//             ctx.fillRect(clientX + offsetX, clientY + offsetY, 1, 1);
//         }
//         if (!timeout) return;
//         timeout = setTimeout(draw, 50);
//     }, 50);
// };
// el.onmousemove = function (e) {
//     clientX = e.clientX;
//     clientY = e.clientY;
// };
// el.onmouseup = function () {
//     clearTimeout(timeout);
// };