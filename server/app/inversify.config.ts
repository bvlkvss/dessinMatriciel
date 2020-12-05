import { Container } from 'inversify';
import { Application } from './app';
import { DatabaseController } from './controllers/database.controller';
import { EmailController } from './controllers/email.controller';
import { Server } from './server';
import { DatabaseService } from './services/database.service';
import { EmailService } from './services/email.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);
    container.bind(TYPES.EmailController).to(EmailController);
    container.bind(TYPES.EmailService).to(EmailService);
    container.bind(TYPES.DatabaseController).to(DatabaseController);
    container.bind(TYPES.DatabaseService).to(DatabaseService);
    return container;
};
