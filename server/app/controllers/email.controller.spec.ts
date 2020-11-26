/* tslint:disable */
import { expect } from 'chai';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { EmailService } from '../services/email.service';
import { TYPES } from '../types';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_ERROR = 500;

describe('EmailController', () => {
    let emailService: Stubbed<EmailService>;
    let app: Express.Application;
    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        if (container !== undefined) {
            container.rebind(TYPES.EmailService).toConstantValue({
                sendEmail: sandbox.stub(),
            });
            emailService = container.get(TYPES.EmailService);
            app = container.get<Application>(TYPES.Application).app;
        }
    });

    it('should send', async () => {
        const email = {
            email: 'hello@mail.ca',
            name: 'hello',
            type: 'jpeg',
            image: 'hello',
        };
        emailService.sendEmail.resolves(true);
        return supertest(app)
            .post('/api/emails')
            .send(email)
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.ok).to.equal(true);
            });
    });
    it('should not send if path is bad', async () => {
        const email = {
            email: 'hello@mail.ca',
            name: 'hello',
            type: 'jpeg',
            image: 'hello',
        };
        emailService.sendEmail.resolves(true);
        return supertest(app).post('/badPath/emails').send(email).expect(HTTP_STATUS_ERROR);
    });

    it('should return false if api returns error', async () => {
        const email = {
            email: 'hello@mail.ca',
            name: 'hello',
            type: 'jpeg',
            image: 'hello',
        };
        emailService.sendEmail.rejects(new Error('error'));
        return supertest(app)
            .post('/api/emails')
            .send(email)
            .expect(HTTP_STATUS_OK)
            .catch((error: Error) => {
                expect(error.message).to.equal('error');
            });
    });
});
