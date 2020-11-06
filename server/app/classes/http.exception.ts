import * as Httpstatus from 'http-status-codes';

export class HttpException extends Error {
    constructor(public status: number = Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR, message: string) {
        super(message);
        this.name = 'HttpException';
    }
}
