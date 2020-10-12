export interface Command {
    isResize: boolean;
    execute(): void;
    unexecute(): void;
}
