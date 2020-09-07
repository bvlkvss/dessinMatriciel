import { TYPES } from '@app/types';
import { Message } from '@common/communication/message';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IndexService } from '../services/index.service';

const HTTP_STATUS_CREATED = 201;

@injectable()
export class IndexController {
    router: Router;

    constructor(@inject(TYPES.IndexService) private indexService: IndexService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            const time: Message = await this.indexService.helloWorld();
            res.json(time);
        });

        this.router.get('/about', (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            res.json(this.indexService.about());
        });

        this.router.post('/send', (req: Request, res: Response, next: NextFunction) => {
            const message: Message = req.body;
            this.indexService.storeMessage(message);
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        this.router.get('/all', (req: Request, res: Response, next: NextFunction) => {
            res.json(this.indexService.getAllMessages());
        });
    }
}
