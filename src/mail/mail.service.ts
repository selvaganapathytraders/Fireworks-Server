import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private otpStore = new Map<string, { otp: string; expiresAt: Date }>();

  private createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendPdf(to: string, file: Express.Multer.File) {
    const transporter = this.createTransporter();

    const mailOptions = {
      from: `"Selvaganapathy Fireworks" <${process.env.SENDER_EMAIL}>`,
      to,
      subject: 'Confirming your order!',
      text: 'Please find the attached PDF.',
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    };

    return transporter.sendMail(mailOptions);
  }

  async sendOtp(email: string): Promise<string> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Store OTP in memory (consider using Redis for production)
    this.otpStore.set(email, { otp, expiresAt });

    const transporter = this.createTransporter();

    const mailOptions = {
      from: `"Selvaganapathy Fireworks" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Your Login OTP - Selvaganapathy Fireworks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login Verification</h2>
          <p>Your OTP for login is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP will expire in 5 minutes.</p>
          <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© Selvaganapathy Fireworks</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return otp; // Return OTP for testing purposes (remove in production)
  }

  async verifyOtp(email: string, providedOtp: string): Promise<boolean> {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      return false; // No OTP found for this email
    }

    const { otp, expiresAt } = storedData;
    
    // Check if OTP has expired
    if (new Date() > expiresAt) {
      this.otpStore.delete(email); // Clean up expired OTP
      return false;
    }

    // Check if OTP matches
    if (otp === providedOtp) {
      this.otpStore.delete(email); // Clean up used OTP
      return true;
    }

    return false;
  }

  // Optional: Method to clean up expired OTPs periodically
  cleanupExpiredOtps() {
    const now = new Date();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}
