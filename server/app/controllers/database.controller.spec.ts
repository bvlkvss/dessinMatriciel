/* tslint:disable */
import { expect } from 'chai';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import { Drawings } from '../../../common/classes/drawings';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { DatabaseService } from '../services/database.service';
import { TYPES } from '../types';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_ERROR = 500;
const HTTP_STATUS_NO_CONTENT = 204;

describe('DatabaseController', () => {
    const baseDrawings = { name: 'StubName', tag: ['StubTag'] } as Drawings;

    let app: Express.Application;
    let DatabaseService: Stubbed<DatabaseService>;
    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            addDrawing: sandbox.stub().resolves(baseDrawings),
            deleteDrawing: sandbox.stub().resolves(baseDrawings),
            localServer: sandbox.stub().resolves([baseDrawings, baseDrawings]),
            start: sandbox.stub().resolves(true),
            getAllDrawings: sandbox.stub().resolves([baseDrawings, baseDrawings, baseDrawings]),
            getDrawingWithId: sandbox.stub().callsFake(() => {
                return new Promise((resolve) => {
                    DatabaseService.drawingsContainer = [baseDrawings, baseDrawings] as Drawings[] & sinon.SinonStub;
                    resolve();
                })
            }),
            getImageData: sandbox.stub().callsFake(() => {
                return new Promise((resolve) => {
                    DatabaseService.container = ["mockedNames"] as string[] & sinon.SinonStub;
                    resolve();
                })
            }),
            update: sandbox.stub().callsFake(() => {
                return new Promise((resolve) => {
                    DatabaseService.serverImagesData = ["mockedImageData"] as string[] & sinon.SinonStub;
                    resolve();
                })

            }),



        });
        DatabaseService = container.get(TYPES.DatabaseService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return all drawings on get request', async () => {
        DatabaseService.start.returns(true);
        return supertest(app)
            .get('/api/drawings')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([baseDrawings, baseDrawings, baseDrawings]);
            });
    });
    it('should return 500 status if wrong path', async () => {
        DatabaseService.start.returns(true);
        return supertest(app)
            .get('/Fake')
            .expect(HTTP_STATUS_ERROR);

    });
    it('should return 404 status if an error occures', async () => {
        DatabaseService.start.returns(true);
        DatabaseService.getAllDrawings.rejects(new Error('service error'))
        return supertest(app)
            .get('/api/drawings')
            .expect(HTTP_STATUS_NOT_FOUND)
            .then((response: any) => {
                //empty body
                expect(response.body).to.deep.equal({});
                expect(response.text).to.deep.equal('service error');
            });
    });
    it('/localServer should call should getImageData and update and getImageWith id, and should return the right drawings ', async () => {
        DatabaseService.start.returns(true);
        return supertest(app)
            .get('/api/drawings/localServer')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([baseDrawings, baseDrawings]);
                expect(DatabaseService.getImageData.calledOnce).to.deep.equal(true);
                expect(DatabaseService.update.calledOnce).to.deep.equal(true);
                expect(DatabaseService.getDrawingWithId.calledOnce).to.deep.equal(true);


            });
    });
    it('/localServer should return status 404 if an error occures while calling update ', async () => {
        DatabaseService.start.returns(true);
        DatabaseService.update.rejects(new Error('service error'))

        return supertest(app)
            .get('/api/drawings/localServer')
            .expect(HTTP_STATUS_NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.deep.equal('service error');


            });
    });
    it('/localServer should return status 404 if an error occures while calling getImageWithId ', async () => {
        DatabaseService.start.returns(true);
        DatabaseService.getDrawingWithId.rejects(new Error('service error'))
        return supertest(app)
            .get('/api/drawings/localServer')
            .expect(HTTP_STATUS_NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.deep.equal('service error');


            });
    });

    it('should call addDrawing and return the drawings added with 201 status', async () => {
        return supertest(app).post('/api/drawings').send(baseDrawings).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED)
            .then((response: any) => {
                expect(DatabaseService.addDrawing.calledOnce).to.deep.equal(true);
                expect(response.body).to.deep.equal(baseDrawings);

            });

    });
    it('should return 404 status if an error occures', async () => {
        DatabaseService.addDrawing.rejects(new Error('service error'));
        return supertest(app).post('/api/drawings').send(baseDrawings).set('Accept', 'application/json').expect(HTTP_STATUS_NOT_FOUND).
            then((response: any) => {
                expect(response.text).to.deep.equal('service error');
            })
    });
    it('should return 500 status if path is wrong', async () => {
        return supertest(app).post('/fakePath').send(baseDrawings).set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);


    });
    it('should call deleteDwating and return  with 204 status', async () => {
        return supertest(app).delete('/api/drawings/ok').send(baseDrawings).set('Accept', 'application/json').expect(HTTP_STATUS_NO_CONTENT)
            .then(() => {
                expect(DatabaseService.deleteDrawing.calledOnce).to.deep.equal(true);
            });
    });
    it('should return 404 status if an error occures', async () => {
        DatabaseService.deleteDrawing.rejects(new Error('service error'));
        return supertest(app).delete('/api/drawings/ok').send(baseDrawings).set('Accept', 'application/json').expect(HTTP_STATUS_NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.deep.equal('service error');
            });

    });
    it('should return 500 status if path is wrong', async () => {
        return supertest(app).delete('/fakePath').send(baseDrawings).set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);

    });
});
