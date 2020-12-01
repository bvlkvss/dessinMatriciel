/* tslint:disable */
import {expect}  from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { EmailService } from './email.service';

const dummyDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAGaArcDAREAAhEBAxEB/8QAHgABAQEBAAIDAQEAAAAAAAAAAAgJBwUGAwQKAQL/xAAyEAABBAMBAAAGAQIEBgMAAAAAAwQFBgIHCAEJERITFBUWISIXJDFBIyUmJyhCGFJi/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AP38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEZbd7v0Rq+7O9P1tS49CdBtU0c1ud+ba3/irtSJxc4uMmbi//AIb+NoWkoZ9+K4TY2zfd51b'

describe('Database service', () => {

    let emailService: EmailService;
    let sandbox: sinon.SinonSandbox;
    //let mockFile: string[] = [];

    beforeEach(async () => {
        emailService = new EmailService();
        sandbox = sinon.createSandbox();
    });

    afterEach(async () => {
        sandbox.restore();
    })



    it('validate an email should return true for a valid email', async () => {
        let email = 'validemail@validsite.ca'
        expect((emailService as any).validateEmail(email)).to.equal(true);
    });

    it('validate an email should return false for an invalid email', async () => {
        let email = 'validemail@validsite.csasaas'
        expect((emailService as any).validateEmail(email)).to.equal(false);
    });

    it('validate an image should return true if a png is given as param and image starts with png bytes', async () => {
        let bufferedDataUrl = Buffer.allocUnsafe(2);
        bufferedDataUrl[0] = 0x89;
        bufferedDataUrl[1] = 0x50;
        console.log(bufferedDataUrl);
        expect((emailService as any).validateImage(bufferedDataUrl, 'png')).to.equal(true);
    });

    it('validate an image should return true if a jpeg is given as param and image starts with jpeg bytes', async () => {
        let bufferedDataUrl = Buffer.allocUnsafe(2);
        bufferedDataUrl[0] = 0xff;
        bufferedDataUrl[1] = 0xd8;
        expect((emailService as any).validateImage(bufferedDataUrl, 'jpeg')).to.equal(true);
    });

    it('validate an image should return false if a jpeg is given as param and image starts with png bytes', async () => {
        let bufferedDataUrl = Buffer.allocUnsafe(2);
        bufferedDataUrl[0] = 0x89;
        bufferedDataUrl[1] = 0x50;
        expect((emailService as any).validateImage(bufferedDataUrl, 'jpeg')).to.equal(false);
    });

    it('validate an image should return false if another type is given as param', async () => {
        let bufferedDataUrl = Buffer.allocUnsafe(2);
        bufferedDataUrl[0] = 0x89;
        bufferedDataUrl[1] = 0x50;
        expect((emailService as any).validateImage(bufferedDataUrl, 'dummyType')).to.equal(false);
    });

    it('should return false if email is not validated when sendEmail is called', async () => {
        let email = {
            email:"invalidEmail",
            image:"dummyStr",
            name:"dummyName",
            type:"dummyType",
        }
        let x = await emailService.sendEmail(email)
        return expect(x).to.equal(false)
    });

    it('should return false if image is not validated when sendEmail is called', async () => {
        let email = {
            email:"correct@email.ca",
            image:dummyDataUrl,
            name:"dummyName",
            type:"dummyType",
        }
        let x = await emailService.sendEmail(email)
        return expect(x).to.equal(false)
    });

    it('should return true if image is validated when sendEmail is called and email is sent', async () => {
        let email = {
            email:"correct@email.ca",
            image:dummyDataUrl,
            name:"dummyName",
            type:"jpeg",
        }


        sandbox.stub(emailService['sendEmailViaAxios']).returns(new Promise((resolve)=>{return true}));
        return expect(await emailService.sendEmail(email)).to.equal(true)
    });

    it('should return false if image is validated when sendEmail is called and email is not sent', async () => {
        let email = {
            email:"correct@email.ca",
            image:dummyDataUrl,
            name:"dummyName",
            type:"jpeg",
        }

        sandbox.stub(emailService['axiosInstance'],'post').rejects(new Error("ss")
        )
        return expect(await emailService.sendEmail(email)).to.equal(false)
    });

});