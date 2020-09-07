import { DateController } from '@app/controllers/date.controller';
import { IndexController } from '@app/controllers/index.controller';
import { DateService } from '@app/services/date.service';
import { IndexService } from '@app/services/index.service';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);
    container.bind(TYPES.IndexController).to(IndexController);
    container.bind(TYPES.IndexService).to(IndexService);

    container.bind(TYPES.DateController).to(DateController);
    container.bind(TYPES.DateService).to(DateService);

    return container;
};
