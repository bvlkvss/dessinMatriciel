import axios, { AxiosInstance} from 'axios';
import * as dotenv from 'dotenv';
import * as FD from 'form-data';
import { injectable } from 'inversify';

const URL = 'https://log2990.step.polymtl.ca/email';

@injectable()
export class EmailServerService {

  axiosInstance: AxiosInstance;
  constructor() {
    dotenv.config();
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Team-Key': `${process.env.EMAIL_API_KEY}`
      }
    });
  }

  async sendEmail(email: EmailAttr): Promise<boolean> {
    if (this.checkEmail(email.email)) {
      const imgToSend = email.base64Img;
      const formData = new FD();
      formData.append('to', email.email);
      formData.append('payload', Buffer.from(imgToSend, 'base64'), {contentType: `image/${email.formatImage}`,
      filename: `${email.fileName}.${email.formatImage}`,
      knownLength: Buffer.from(imgToSend, 'base64').byteLength});
      this.axiosInstance.post(URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'X-Team-Key': `${process.env.EMAIL_API_KEY}`,
            ... formData.getHeaders()
        }})
        .then((res) => {
          console.log('Email Sent successfuly');
          return true;
        })
        .catch((error) => {
          console.log('Error with sending email');
          console.log(error.message);
          return false;
        });
      }
    return false;
  }

  async sendImageViaEmail(email: string): Promise<boolean> {
    if (this.checkEmail(email)) {
      const imgToSend = email.base64Img;
      const formData = new FD();
      formData.append('to', email.email);
      formData.append('payload', Buffer.from(imgToSend, 'base64'), {contentType: 'image/svg+xml',
      filename: `${email.fileName}.${email.formatImage}`,
      knownLength: Buffer.from(imgToSend, 'base64').byteLength});
      this.axiosInstance.post(URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'X-Team-Key': `${process.env.EMAIL_API_KEY}`,
            ... formData.getHeaders()
        }})
        .then((res) => {
          console.log('Successfully sent!');
          return true;
        })
        .catch((error) => {
          console.log('Error with sending email');
          console.log(error.message);
        });
      }
    return false;
  }

  checkEmail(email: string): boolean {
    const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return regex.test(String(email).toLowerCase());
  }
}
