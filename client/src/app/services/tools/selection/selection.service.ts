import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { runInThisContext } from 'vm';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  rectangleService: RectangleService;
  ellipseService: EllipseService;
  constructor(drawingService: DrawingService)
  { 
  this.rectangleService= new RectangleService(drawingService);
  this.ellipseService= new EllipseService(drawingService);
  }
}
