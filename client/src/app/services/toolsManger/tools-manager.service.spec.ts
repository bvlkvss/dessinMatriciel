/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
//import { from } from 'rxjs';
import { EllipseService } from '../tools/ellipse/ellipse.service';
import { LineService } from '../tools/line/line.service';
import { PaintBucketService } from '../tools/paint-bucket/paint-bucket.service';
import { RectangleService } from '../tools/rectangle/rectangle.service';
import { ToolsManagerService } from './tools-manager.service';
import { PolygonService }from '../tools/polygon/polygon.service';
describe('ToolsManagerService', () => {
    let service: ToolsManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToolsManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call setPrimaryColor when setColor is called and is Primary is true', () => {
        let setPrimaryColorSpy = spyOn(service.currentTool, 'setPrimaryColor');
        service.setColor('#ababab', true);
        expect(setPrimaryColorSpy).toHaveBeenCalled();
    });

    it('should call setSecondaryColor when setColor is called and is Primary is false', () => {
        let setPrimaryColorSpy = spyOn(service.currentTool, 'setPrimaryColor');
        let setSecondaryColor = spyOn(service.currentTool, 'setSecondaryColor');
        service.setColor('#ababab', false);
        expect(setSecondaryColor).toHaveBeenCalled();
        expect(setPrimaryColorSpy).not.toHaveBeenCalled();
    });

    it('should call rectangle setStyle when setRectangleStyle is called', () => {
        service.currentTool = service.getTools().get('rectangle') as Tool;
        let setStyleSpy = spyOn(service.currentTool as RectangleService, 'setStyle');

        service.setRectangleStyle(1);
        expect(setStyleSpy).toHaveBeenCalled();
    });

    it('should call ellipse setStyle when setEllipseStyle is called', () => {
        service.currentTool = service.getTools().get('ellipse') as Tool;
        let setStyleSpy = spyOn(service.currentTool as EllipseService, 'setStyle');

        service.setEllipseStyle(1);
        expect(setStyleSpy).toHaveBeenCalled();
    });


    //changement de style du polygon
    it('should call polygon setStyle when setPolygonStyle is called', () => {
        service.currentTool = service.getTools().get('polygon') as Tool;
        let setStyleSpy = spyOn(service.currentTool as PolygonService, 'setStyle');

        service.setPolygonStyle(1);
        expect(setStyleSpy).toHaveBeenCalled();
    });



    it('should call line setJunctionWidth when setJunctionWidth is called', () => {
        service.currentTool = service.getTools().get('line') as Tool;
        let setJunctionWidthSpy = spyOn(service.currentTool as LineService, 'setJunctionWidth');

        service.setJunctionWidth(1);
        expect(setJunctionWidthSpy).toHaveBeenCalled();
    });

    it('should call paintBucket setTolerance when setBucketTolerance is called', () => {
        service.currentTool = service.getTools().get('paintBucket') as Tool;
        let setToleranceSpy = spyOn(service.currentTool as PaintBucketService, 'setTolerance');

        service.setBucketTolerance(10);
        expect(setToleranceSpy).toHaveBeenCalled();
    });

    it('should call line setJunctionState when setJunctionState is called', () => {
        service.currentTool = service.getTools().get('line') as Tool;
        let setJunctionStateSpy = spyOn(service.currentTool as LineService, 'setJunctionState');

        service.setJunctionState(true);
        expect(setJunctionStateSpy).toHaveBeenCalled();
    });
});
