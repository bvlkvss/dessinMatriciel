import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
// Ceci est une implémentation de base de l'outil Crayon pour aider à débuter le projet
// L'implémentation ici ne couvre pas tous les critères d'accepetation du projet
// Vous êtes encouragés de modifier et compléter le code.
// N'oubliez pas de regarder les tests dans le fichier spec.ts aussi!
@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    constructor(drawingService: DrawingService) {
        super(drawingService);

        this.toolAttributes = ["lineWidth"];
        this.lineWidth = 20;
        this.clearPath();
    }


    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }
    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) this.drawLine(this.drawingService.baseCtx, this.pathData);
        this.clearPath();
    }
    onMouseEnter(event: MouseEvent): void {
        this.clearPath();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }
    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.primaryColor; 2
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }
    private clearPath(): void {
        this.pathData = [];
    }
}
