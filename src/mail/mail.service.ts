import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendPdf(to: string, file: Express.Multer.File) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Vishwa Fireworks" <${process.env.SENDER_EMAIL}>`,
      to,
      subject: 'Confirming your order!',
      text: 'Please find the attached PDF.',
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer, // ✅ Send from memory
        },
      ],
    };

    return transporter.sendMail(mailOptions);
  }
}
