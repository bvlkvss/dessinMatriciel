/* tslint:disable:no-any */
/* tslint:disable:no-empty */
import { Drawings } from '@common/classes/drawings';
import * as fs from 'fs';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions, ObjectId } from 'mongodb';
import 'reflect-metadata';

// CHANGE the URL for your database information
const DATABASE_URL = 'mongodb+srv://Nassim:Ln123456@cluster0.pcwgc.mongodb.net/PolyDessin?retryWrites=true&w=majority';
const DATABASE_NAME = 'PolyDessin';
const DATABASE_COLLECTION = 'Dessins';

@injectable()
export class DatabaseService {
    collection: Collection<Drawings>;
    client: MongoClient;
    drawingsPath: string = './drawings/';
    container: string[] = new Array<string>();
    drawingsContainer: Drawings[] = [];
    serverImagesData: string[] = [];

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start(): void {
        MongoClient.connect(DATABASE_URL, this.options)
            .then((client: MongoClient) => {
                this.client = client;
                this.collection = client.db(DATABASE_NAME).collection(DATABASE_COLLECTION);
            })
            .catch(() => {
                console.error('CONNECTION ERROR. EXITING PROCESS');
                process.exit(1);
            });
    }

    closeConnection(): void {
        this.client.close();
    }

    async getAllDrawings(): Promise<Drawings[]> {
        return this.collection
            .find({})
            .toArray()
            .then((drawings: Drawings[]) => {
                console.log();
                return drawings;
            })
            .catch(() => {
                throw new Error('Error while getting drawings');
            });
    }

    async getDrawingWithId(id: string): Promise<Drawings> {
        return this.collection
            .findOne({ _id: new ObjectId(id) })
            .then((drawing: Drawings) => {
                this.drawingsContainer.push(drawing);
                return drawing;
            })
            .catch((error: Error) => {
                throw error;
            });
    }

    async addDrawing(drawings: Drawings): Promise<any> {
        // ajoute le drawing dans la db et save juste le nom et les tags
        if (this.validateDrawings(drawings)) {
            return this.collection
                .insertOne({ name: drawings.name, tag: drawings.tag })
                .then((data) => {
                    const imageData = drawings.imageData?.replace(/^data:image\/png;base64,/, '');
                    fs.writeFile(this.drawingsPath + data.insertedId + '.png', imageData, { encoding: 'base64' }, () => {});
                    console.log('FILE CREATED');
                })
                .catch((error: Error) => {
                    throw error;
                });
        } else {
            throw new Error('Invalid Drawing');
        }
    }

    async deleteDrawing(id: string): Promise<void> {
        return this.collection
            .findOneAndDelete({ _id: new ObjectId(id) })
            .then((drawing: any) => {
                this.deleteFromServer(drawing);
            })
            .catch(() => {
                throw new Error('Failed to delete Drawing');
            });
    }

    deleteFromServer(drawing: any): void {
        fs.readdir(this.drawingsPath, (error, directory) => {
            directory.forEach((file) => {
                if (file === drawing.value._id + '.png') {
                    fs.unlink(this.drawingsPath + file, () => {});
                }
            });
        });
    }

    private validateDrawings(drawings: Drawings): boolean {
        return this.validateName(drawings.name);
    }
    validateName(name: string): boolean {
        return name !== '';
    }

    async update(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.container = [];
            fs.readdir(this.drawingsPath, (err, element) => {
                if (err) reject(err);
                element.forEach((nameFile) => {
                    this.container.push(nameFile);
                });
                resolve(this.container);
            });
        });
    }
    async getImageData(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.serverImagesData = [];
            fs.readdir(this.drawingsPath, (err, element) => {
                if (err) reject(err);
                element.forEach((imageData) => {
                    this.serverImagesData.push(fs.readFileSync(this.drawingsPath + imageData, 'base64'));
                });
                resolve(this.serverImagesData);
            });
        }).then(() => {});
    }
}
