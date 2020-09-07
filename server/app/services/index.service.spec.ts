import { TYPES } from '@app/types';
import { Message } from '@common/communication/message';
import { expect } from 'chai';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { DateService } from './date.service';
import { IndexService } from './index.service';

describe('Index service', () => {
    let indexService: IndexService;
    let dateService: Stubbed<DateService>;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DateService).toConstantValue({
            currentTime: sandbox.stub().resolves({
                title: 'Time',
                body: new Date(2020, 0, 10).toString(),
            }),
        });
        dateService = container.get(TYPES.DateService);
        indexService = container.get<IndexService>(TYPES.IndexService);
    });

    it('should return a simple message if #about is called', () => {
        const expectedTitle = 'Basic Server About Page';
        const expectedBody = 'Try calling helloWorld to get the time';
        const aboutMessage = indexService.about();
        expect(aboutMessage.title).to.equals(expectedTitle);
        expect(aboutMessage.body).to.equals(expectedBody);
    });

    it('should return Hello World as title', (done: Mocha.Done) => {
        indexService.helloWorld().then((result: Message) => {
            expect(result.title).to.equals('Hello world');
            done();
        });
    });

    it('should have a body that starts with "Time is"', (done: Mocha.Done) => {
        indexService.helloWorld().then((result: Message) => {
            expect(result.body)
                .to.be.a('string')
                .and.satisfy((body: string) => body.startsWith('Time is'));
            done();
        });
    });

    it('should handle an error from DateService', (done: Mocha.Done) => {
        dateService.currentTime.rejects(new Error('error in the service'));
        indexService
            .helloWorld()
            .then((result: Message) => {
                expect(result.title).to.equals('Error');
                done();
            })
            .catch((error: unknown) => {
                done(error);
            });
    });

    it('should store a message', (done: Mocha.Done) => {
        const newMessage: Message = { title: 'Hello', body: 'World' };
        indexService.storeMessage(newMessage);
        expect(indexService.clientMessages[0]).to.equals(newMessage);
        done();
    });

    it('should get all messages', (done: Mocha.Done) => {
        const newMessage: Message = { title: 'Hello', body: 'World' };
        const newMessage2: Message = { title: 'Hello', body: 'Again' };
        indexService.clientMessages.push(newMessage);
        indexService.clientMessages.push(newMessage2);
        const messages = indexService.getAllMessages();
        expect(messages).to.equals(indexService.clientMessages);
        done();
    });
});
