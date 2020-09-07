import { Message } from '@common/communication/message';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class DateService {
    async currentTime(): Promise<Message> {
        return {
            title: 'Time',
            body: new Date().toString(),
        };
    }
}
