/* tslint:disable:no-any */
import { Drawings } from '@common/classes/drawings';
import { NextFunction, Request, Response, Router } from 'express';
import * as Httpstatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { DatabaseService } from '../services/database.service';
import { TYPES } from '../types';
@injectable()
export class DatabaseController {
    router: Router;

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.configureRouter();
        this.databaseService.start();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .getAllDrawings()
                .then((drawings: Drawings[]) => {
                    res.json(drawings);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        // get the id of the drawings that are on the local server.
        this.router.get('/localServer', async (req: Request, res: Response, next: NextFunction) => {
            const promises: any = [];
            this.databaseService.drawingsContainer = [];
            await this.databaseService.getImageData();
            this.databaseService
                .update()
                .then(() => {
                    this.databaseService.container.forEach((element) => {
                        promises.push(this.databaseService.getDrawingWithId(element.replace('.png', '')));
                    });
                    Promise.all(promises)
                        .then(() => {
                            for (let i = 0; i < this.databaseService.drawingsContainer.length; i++) {
                                this.databaseService.drawingsContainer[i].imageData =
                                    'data:image/png;base64,' + this.databaseService.serverImagesData[i];
                            }
                            res.json(this.databaseService.drawingsContainer);
                        })
                        .catch((error: Error) => {
                            res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                        });
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });
        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .addDrawing(req.body)
                .then((drawing: any) => {
                    res.status(Httpstatus.StatusCodes.CREATED).send(drawing);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .deleteDrawing(req.params.id)
                .then(() => {
                    res.sendStatus(Httpstatus.StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
