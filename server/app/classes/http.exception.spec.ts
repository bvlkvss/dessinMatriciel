import { expect } from 'chai';
import { describe } from 'mocha';
import { HttpException } from './http.exception';


// tslint:disable:no-any


describe('HttpException', () => {
    let httpStub: HttpException = new HttpException(200, "mockMessage");

    beforeEach(async () => {

    });

    it('should creates httpException with the right arguments', async () => {

        expect(httpStub.message).to.be.equal("mockMessage");
        expect(httpStub.name).to.be.equal("HttpException");
        expect(httpStub.status).to.be.equal(200);





    });


});
