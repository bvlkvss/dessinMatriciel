import { Injectable } from '@angular/core';
import { Movable } from '@app/classes/movable';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser-service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { LineService } from '@app/services/tools/line/line.service';
import { MagicWandService } from '@app/services/tools/magic-wand/magic-wand.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { SprayPaintService } from '@app/services/tools/spray-paint/spray-paint.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsManagerService {
    private tools: Map<string, Tool>;
    currentTool: Tool;

    constructor(
        pencilService: PencilService,
        brushService: BrushService,
        rectangleService: RectangleService,
        eraserService: EraserService,
        ellipseService: EllipseService,
        lineService: LineService,
        selectionService: SelectionService,
        paintBucketService: PaintBucketService,
        polygonService: PolygonService,
        pipetteService: PipetteService,
        textService: TextService,
        sprayPaintService: SprayPaintService,
        plumeService: PlumeService,
        gridService: GridService,
        magicWandService: MagicWandService,
        stampService: StampService,
    ) {
        this.tools = new Map<string, Tool>([
            ['pencil', pencilService],
            ['brush', brushService],
            ['rectangle', rectangleService],
            ['eraser', eraserService],
            ['ellipse', ellipseService],
            ['line', lineService],
            ['selection', selectionService],
            ['paintBucket', paintBucketService],
            ['selection', selectionService],
            ['polygon', polygonService],
            ['pipette', pipetteService],
            ['text', textService],
            ['plume', plumeService],
            ['aerosol', sprayPaintService],
            ['grid', gridService],
            ['magic-wand', magicWandService],
            ['stamp', stampService],
        ]);
        this.currentTool = this.tools.get('pencil') as Tool;
    }

    getByValue(searchValue: Tool): string {
        let toolname = '';
        for (const [key, value] of this.tools.entries()) {
            if (value === searchValue) toolname = key;
        }
        return toolname;
    }

    setTools(name: string): void {
        if (this.currentTool instanceof SelectionService) {
            if (this.currentTool.selectionActivated) this.currentTool.drawSelectionOnBase();
        } else if (this.currentTool instanceof MagicWandService) {
            if (this.currentTool.isMagicSelectionActivated) {
                this.currentTool.magicSelectionObj.drawSelectionOnBase();
                this.currentTool.clearSelection();
                this.currentTool.isMagicSelectionActivated = false;
            }
        }
        this.currentTool = this.tools.get(name) as Tool;
    }

    getTools(): Map<string, Tool> {
        return this.tools;
    }

    setLineWidth(lineWidth: number): void {
        this.currentTool.setLineWidth(lineWidth);
    }

    setColor(color: string, isPrimary: boolean): void {
        if (isPrimary)
            this.tools.forEach((element) => {
                element.setPrimaryColor(color);
            });
        else
            this.tools.forEach((element) => {
                element.setSecondaryColor(color);
            });
    }

    setBucketTolerance(tolerance: number): void {
        const paintBucket = this.currentTool as PaintBucketService;
        paintBucket.setTolerance(tolerance);
    }

    setRectangleStyle(id: number): void {
        const rectangle = this.currentTool as RectangleService;
        rectangle.setStyle(id);
    }

    setEllipseStyle(id: number): void {
        const ellipse = this.currentTool as EllipseService;
        ellipse.setStyle(id);
    }
    setPolygonStyle(id: number): void {
        const polygon = this.currentTool as PolygonService;
        polygon.setStyle(id);
    }

    setPolygonNumberSides(newNumberSides: number): void {
        const polygon = this.currentTool as PolygonService;
        polygon.setNumberSides(newNumberSides);
    }

    setJunctionWidth(id: number): void {
        const line = this.currentTool as LineService;
        line.setJunctionWidth(id);
    }
    setJunctionState(isChecked: boolean): void {
        const line = this.currentTool as LineService;
        line.setJunctionState(isChecked);
    }

    setDropletsWidth(value: number): void {
        const spray = this.currentTool as SprayPaintService;
        spray.setDropletsWidth(value);
    }

    setFrequency(value: number): void {
        const spray = this.currentTool as SprayPaintService;
        spray.setfrequency(value);
    }

    setRadius(value: number): void {
        const spray = this.currentTool as SprayPaintService;
        spray.setRadius(value);
    }

    setAnchorPoint(value: number): void {
        Movable.magnetismAnchorPoint = value;
        Tool.shouldAlign = true;
    }
}
