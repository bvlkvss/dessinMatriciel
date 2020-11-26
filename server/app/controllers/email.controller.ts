import { EmailData } from '@common/classes/email-data';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { EmailService } from '../services/email.service';
import { TYPES } from '../types';

@injectable()
export class EmailController {
    router: Router;

    constructor(@inject(TYPES.EmailService) private emailService: EmailService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/emails', async (req: Request, res: Response, next: NextFunction) => {
            const emailData: EmailData = {
                image: req.body.image,
                email: req.body.email,
                name: req.body.name,
                type: req.body.type,
            };
            await this.emailService
                .sendEmail(emailData)
                .then((result) => {
                    if (result) {
                        console.log('Email sent!');
                        res.send(true);
                    }
                })
                .catch((error: Error) => {
                    console.log('Email did not send.');
                    console.log(error.message);
                    res.send(false);
                });
        });
    }
}
