import { expect } from 'chai';
import * as supertest from 'supertest';
import { Message } from "../../../common/communication/message";
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { DateService } from '../services/date.service';
import { TYPES } from '../types';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;

describe('DateController', () => {
    let dateService: Stubbed<DateService>;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DateService).toConstantValue({
            currentTime: sandbox.stub(),
        });
        dateService = container.get(TYPES.DateService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return time from dateservice on get request', async () => {
        const expectedMessage: Message = { title: 'Test', body: new Date().toString() } as Message;
        dateService.currentTime.resolves(expectedMessage);

        return supertest(app)
            .get('/api/date')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(expectedMessage);
            });
    });

    it('should return an error as a message on service fail', async () => {
        dateService.currentTime.rejects(new Error('service error'));

        return supertest(app)
            .get('/api/date')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body.title).to.equal('Error');
            });
    });
});
