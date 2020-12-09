import { Command } from '@app/classes/command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/text.service';
import { Vec2 } from './vec2';

export class TextCommand extends Command {
    isResize: boolean = false;
    private lines: string[] = [];
    private textAlignement: string;
    private fontText: string;
    private fontSize: number;
    private fontStyle: string;
    private textPosition: Vec2;
    private primaryColor: string;
    constructor(protected tool: TextService, protected drawingService: DrawingService) {
        super();
        this.textAlignement = this.tool.textAlignement;
        this.fontText = this.tool.fontText;
        this.fontSize = this.tool.fontSize;
        this.fontStyle = this.tool.fontStyle;
        this.primaryColor = this.tool.primaryColor;
        this.textPosition = { ...this.tool.textPosition };
        for (const point of this.tool.lines) {
            this.lines.push(point);
        }
    }
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.textAlignement = this.textAlignement;
        this.tool.fontText = this.fontText;
        this.tool.fontSize = this.fontSize;
        this.tool.fontStyle = this.fontStyle;
        this.tool.textPosition = this.textPosition;
        this.tool.lines = [];
        for (const point of this.lines) {
            this.tool.lines.push(point);
        }
        this.tool.writeText(this.drawingService.baseCtx, this.textPosition);
    }
}
