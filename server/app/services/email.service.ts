import { EmailData } from '@common/classes/email-data';
import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import * as FD from 'form-data';
import { injectable } from 'inversify';

const API_URL = 'http://log2990.step.polymtl.ca/email';
const EMAIL_API_KEY = '7e4d9af7-fe9a-43e8-b7af-bc03b0b9ef08';
const PNG_STARTING_BYTES = '8950';
const JPEG_STARTING_BYTES = 'ffd8';

@injectable()
export class EmailService {
    emailData: EmailData;
    axiosInstance: AxiosInstance;
    constructor() {
        dotenv.config();
        this.axiosInstance = axios.create({
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Team-Key': EMAIL_API_KEY,
            },
        });
    }

    async sendEmail(email: EmailData): Promise<boolean> {
        if (this.validateEmail(email.email)) {
            const imgToSend = email.image.split(',');
            const bufferedDataUrl = Buffer.from(imgToSend[1], 'base64');
            if (!this.validateImage(bufferedDataUrl, email.type)) return false;
            const formData = new FD();
            formData.append('to', email.email);
            formData.append('payload', bufferedDataUrl, {
                contentType: `image/${email.type}`,
                filename: `${email.name}.${email.type}`,
                knownLength: bufferedDataUrl.byteLength,
            });
            return await this.sendEmailviaAxios(formData);
        }
        return false;
    }

    private async sendEmailviaAxios(formData: FD): Promise<boolean> {
        return this.axiosInstance
            .post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Team-Key': EMAIL_API_KEY,
                    ...formData.getHeaders(),
                },
            })
            .then((res) => {
                console.log('Email Sent successfuly ');
                return true;
            })
            .catch((error) => {
                console.log('Error with sending email');
                console.log(error.message);
                return false;
            });
    }

    private validateImage(imageBuffer: Buffer, type: string): boolean {
        const validationBuffer = Buffer.alloc(2);
        imageBuffer.copy(validationBuffer, 0, 0, 2);

        if (type === 'jpeg') return validationBuffer.includes(JPEG_STARTING_BYTES, 0, 'hex');
        else if (type === 'png') return validationBuffer.includes(PNG_STARTING_BYTES, 0, 'hex');

        return false;
    }

    private validateEmail(email: string): boolean {
        const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        return regex.test(String(email).toLowerCase());
    }
}
