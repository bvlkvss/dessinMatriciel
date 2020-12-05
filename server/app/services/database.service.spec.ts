/* tslint:disable */
import { expect } from 'chai';
import * as fs from 'fs';
import { describe } from 'mocha';
import { Cursor, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as rimraf from 'rimraf';
import * as sinon from 'sinon';
import { Drawings } from '../../../common/classes/drawings';
import { DatabaseService } from './database.service';


describe('Database service', () => {

    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let db: Db;
    let client: MongoClient;
    let testDrawings: Drawings;
    let mockDrawing: any;
    let sandbox: sinon.SinonSandbox;
    let mockFile: string[] = [];


    beforeEach(async () => {
        databaseService = new DatabaseService();
        sandbox = sinon.createSandbox();
        // Start a local test server
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // We use the local Mongo Instance and not the production database
        db = client.db(await mongoServer.getDbName());
        databaseService.collection = db.collection('test');
        testDrawings = { name: "Test Drawing", tag: ["LOG1001"] };
        mockDrawing = (await databaseService.collection.insertOne(testDrawings));
        databaseService.drawingsPath = "./mockFolder/";
        fs.mkdir(databaseService.drawingsPath, () => {
        });
    });

    afterEach(async () => {
        rimraf(databaseService.drawingsPath, () => { });
        //databaseService.drawingsPath = "./drawings/";
        sandbox.restore();
        client.close();
    })



    it('if an error occured while calling getDrawingWithId, it is thrown and handled', async () => {

        sandbox.stub(databaseService.collection, "findOne").callsFake(() => {
            return new Promise((resolve) => {
                throw new Error("error thrown");
                resolve();
            })
        });
        databaseService.getDrawingWithId(mockDrawing.insertedId).catch((error: Error) => {
            expect(error.message).to.equal("error thrown");

        });

    });
    it('if an error occured while calling insertOne, it is thrown and handled', async () => {
        sandbox.stub(databaseService.collection, "insertOne").callsFake(() => {
            return new Promise((resolve) => {
                throw new Error("error thrown");
                resolve();
            })
        });
        databaseService.addDrawing(mockDrawing.insertedId).catch((error: Error) => {
            expect(error.message).to.equal("error thrown");

        });

    });
    it('if an error is thrown in getAllDrawings it is handled', async () => {
        sandbox.stub(Cursor.prototype, "toArray").callsFake(() => {
            return new Promise((resolve) => {
                throw new Error("error thrown");
                resolve();
            })
        });
        try {
            await databaseService.getAllDrawings();
        } catch (error) {
            expect(error.message).to.equal('Error while getting drawings');
        }

    });
    it('should get all drawings from DB', async () => {
        let drawings = await databaseService.getAllDrawings();
        expect(drawings.length).to.equal(1);
        expect(testDrawings).to.deep.equals(drawings[0]);
    });

    it('should get the drawing using the id  from DB', async () => {
        let drawings = await databaseService.getDrawingWithId(mockDrawing.insertedId);
        expect(testDrawings).to.deep.equals(drawings);
    });


    it('should insert a new drawing', async () => {
        let secondDrawing: Drawings = { name: "Test Drawing2", tag: ["LOG1"] };
        let stub = sandbox.stub(fs, "writeFile").callsFake(() => {
        });
        await databaseService.addDrawing(secondDrawing);
        let drawings: Drawings[] = await databaseService.collection.find({}).toArray();
        expect(stub.calledOnce).to.equal(true);
        expect(drawings.length).to.equal(2);
        expect(drawings[1].name).to.deep.equals(secondDrawing.name);
        expect(drawings[1].tag).to.deep.equals(secondDrawing.tag);


    });

    it('should not insert a new drawing if it has an empty name', async () => {
        let secondDrawing: Drawings = { name: "", tag: ["LOG1"], imageData: "data3" };
        try {

            await databaseService.addDrawing(secondDrawing);
        }
        catch {
            let drawings = await databaseService.collection.find({}).toArray();
            expect(drawings.length).to.equal(1);
        }
    });

    it('should insert a new drawing and save as png on local disk on a specific directory', async () => {
        let secondDrawing: Drawings = { name: "Test Drawing2", tag: ["LOG1"], imageData: 'data:image/png;base64,Test' };
        databaseService.drawingsPath = "./mockFolder/";
        await databaseService.addDrawing(secondDrawing);
        fs.readdir(databaseService.drawingsPath, (err, fileCreated) => {
            mockFile = fileCreated;
            expect(mockFile.length).to.be.equal(1);
            expect(mockFile[0].includes(".png")).to.be.equal(true);
        });
    });



    it('should delete an existing drawing data if a valid id is sent', async () => {
        await databaseService.deleteDrawing(mockDrawing.insertedId);
        let drawings = await databaseService.collection.find({}).toArray();
        expect(drawings.length).to.equal(0);
    });
    it('should  not delete the drawing and handle the error', async () => {
        try {
            sandbox.stub(databaseService.collection, "findOneAndDelete").rejects(new Error("Error thrown"));
            await databaseService.deleteDrawing(mockDrawing.insertedId);
        }
        catch {
            let drawings = await databaseService.collection.find({}).toArray();
            expect(drawings.length).to.equal(1);
        }

    });


    it('deleteFromServer should call readdir  ', async () => {
        let id: any = { _id: mockDrawing.insertedId };
        let drawingMock: any = { value: id };
        fs.writeFile(databaseService.drawingsPath + mockDrawing.insertedId + '.png', "imageData", { encoding: 'base64' }, () => {
        });
        let readStub = sandbox.stub(fs, "readdir");
        databaseService.deleteFromServer(drawingMock);
        expect(readStub.calledOnce).to.be.equal(true);

    });

    it('start should handle error, process exit should be called  ', async () => {

        let readStub = sandbox.stub(MongoClient, "connect").callsFake(() => {
            return new Promise((resolve) => {
                throw new Error("error while starting db");
                resolve();
            })
        });
        sandbox.stub(process, "exit").callsFake(() => {
            return "nothing" as never;
        });
        databaseService.start();
        expect(readStub.calledOnce).to.be.equal(true);

    });

    it('getImageData should fill array with all image data that are on local server', async () => {
        sandbox.stub(fs, "readFileSync").callsFake(() => {
            return "imageDataMock";
        });
        fs.writeFile(databaseService.drawingsPath + mockDrawing.insertedId + '.png', "imageData", { encoding: 'base64' }, () => {
        });
        await databaseService.getImageData();
        expect(databaseService.serverImagesData[0]).to.be.equal("imageDataMock");

    });

    it('update should fill array with all files name', async () => {
        fs.writeFile(databaseService.drawingsPath + mockDrawing.insertedId + '.png', "imageData", { encoding: 'base64' }, () => {
        });
        await databaseService.update();
        expect(databaseService.container.length).to.be.equal(1);
        expect(databaseService.container[0]).to.be.equal(mockDrawing.insertedId + ".png");

    });
    it('validateName should return false if name is empty', async () => {
        expect(databaseService.validateName("")).to.be.equal(false);
    });
    it('validateName should return true if name is not empty', async () => {
        expect(databaseService.validateName("test")).to.be.equal(true);


    });
});