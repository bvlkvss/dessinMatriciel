// tslint:disable:no-empty
export abstract class Command {
    isResize: boolean;
    execute(): void {}
    unexecute(): void {}
}
