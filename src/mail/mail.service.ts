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
      subject: 'Order Confirmation - Selvaganapathy Fireworks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #333; font-size: 24px;">Selvaganapathy Fireworks</h1>
          </div>
          
          <!-- Content -->
          <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Order Confirmation</h2>
            
            <p style="color: #666; margin-bottom: 20px;">
              Thank you for your order. Please find your invoice attached.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #666;">
                <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              Thank you for choosing us.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Selvaganapathy Fireworks</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: file.originalname || 'invoice.pdf',
          content: file.buffer,
          contentType: 'application/pdf'
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
      subject: 'Login OTP - Selvaganapathy Fireworks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #333; font-size: 24px;">Selvaganapathy Fireworks</h1>
          </div>
          
          <!-- Content -->
          <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Login Verification</h2>
            
            <p style="color: #666; margin-bottom: 30px;">
              Your OTP code:
            </p>
            
            <!-- OTP Code -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 4px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px;">
              Valid for 5 minutes
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Selvaganapathy Fireworks</p>
          </div>
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
