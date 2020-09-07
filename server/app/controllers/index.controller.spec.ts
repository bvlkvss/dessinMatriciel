import { Application } from '@app/app';
import { IndexService } from '@app/services/index.service';
import { TYPES } from '@app/types';
import { Message } from '@common/communication/message';
import { expect } from 'chai';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;

describe('IndexController', () => {
    const baseMessage = { title: 'Hello world', body: 'anything really' } as Message;
    let indexService: Stubbed<IndexService>;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.IndexService).toConstantValue({
            helloWorld: sandbox.stub().resolves(baseMessage),
            about: sandbox.stub().resolves(baseMessage),
            storeMessage: sandbox.stub().resolves(),
            getAllMessages: sandbox.stub().resolves([baseMessage, baseMessage]),
        });
        indexService = container.get(TYPES.IndexService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return message from index service on valid get request to root', async () => {
        return supertest(app)
            .get('/api/index')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(baseMessage);
            });
    });

    it('should return message from index service on valid get request to about route', async () => {
        const aboutMessage = { ...baseMessage, title: 'About' };
        indexService.about.returns(aboutMessage);
        return supertest(app)
            .get('/api/index/about')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(aboutMessage);
            });
    });

    it('should store message in the array on valid post request to /send', async () => {
        const message: Message = { title: 'Hello', body: 'World' };
        return supertest(app).post('/api/index/send').send(message).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
    });

    it('should return an arrat of messages on valid get request to /all', async () => {
        indexService.getAllMessages.returns([baseMessage, baseMessage]);
        return supertest(app)
            .get('/api/index/all')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([baseMessage, baseMessage]);
            });
    });
});
