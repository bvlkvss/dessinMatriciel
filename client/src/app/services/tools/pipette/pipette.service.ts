import { HostListener, Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Const } from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export interface Arguments {
    image: HTMLImageElement;
    event: MouseEvent;
}
@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    colorObservable: Subject<boolean>;
    pipetteObservable: Subject<Arguments>;
    circleViewObservable: Subject<boolean>;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.toolAttributes = ['pipette'];
        this.colorObservable = new Subject<boolean>();
        this.circleViewObservable = new Subject<boolean>();

        this.pipetteObservable = new Subject<Arguments>();
    }
    getColorObservable(): Observable<boolean> {
        return this.colorObservable;
    }
    getPipetteObservable(): Observable<Arguments> {
        return this.pipetteObservable;
    }
    getCircleViewObservable(): Observable<boolean> {
        return this.circleViewObservable;
    }
    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }
    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }
    onRightClick(event: MouseEvent): void {
        this.colorObservable.next(false);
    }

    onMouseMove(event: MouseEvent): void {
        const arg: Arguments = { image: new Image(), event };
        arg.image.src = this.drawingService.canvas.toDataURL();
        arg.image.style.display = 'none';
        this.pipetteObservable.next(arg);
    }
    onClick(event: MouseEvent): void {
        this.colorObservable.next(true);
    }
    getColorFromData(imageData: ImageData): Color {
        return {
            red: imageData.data[0],
            green: imageData.data[1],
            blue: imageData.data[2],
            opacity: imageData.data[Const.OPACITY_INDEX],
        };
    }
    private validateColor(color: string): boolean {
        return color.match(/^[a-f0-9]{8}$/i) !== null;
    }
    rgbaToHex(rgbaColor: Color): string {
        const red: string = rgbaColor.red.toString(16);
        const green: string = rgbaColor.green.toString(16);
        const blue: string = rgbaColor.blue.toString(16);
        const opacity: string = rgbaColor.opacity.toString(16);
        const ajustLength = (color: string): string => {
            if (color.length === 1) color = '0' + color;
            return color;
        };
        const hexColor: string = ajustLength(red) + ajustLength(green) + ajustLength(blue) + ajustLength(opacity);
        if (!this.validateColor(hexColor)) throw new Error('color not defined');
        return hexColor;
    }
    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        this.circleViewObservable.next(false);
    }
    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.circleViewObservable.next(true);
    }
}
