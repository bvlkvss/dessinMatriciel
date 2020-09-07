import { DateService } from '@app/services/date.service';
import { Message } from '@common/communication/message';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class DateController {
    router: Router;

    constructor(@inject(TYPES.DateService) private dateService: DateService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            this.dateService
                .currentTime()
                .then((time: Message) => {
                    res.json(time);
                })
                .catch((reason: unknown) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: reason as string,
                    };
                    res.json(errorMessage);
                });
        });
    }
}
