import { 
  Controller, 
  Post, 
  UploadedFile, 
  Body, 
  UseInterceptors, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async sendPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('email') email: string,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.mailService.sendPdf(email, file);
      return { message: 'Email sent successfully' };
    } catch (err) {
      console.error('Mail sending error:', err);
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.mailService.sendOtp(email);
      return { 
        message: 'OTP sent successfully',
        email: email 
      };
    } catch (err) {
      console.error('OTP sending error:', err);
      throw new HttpException('Failed to send OTP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    if (!email || !otp) {
      throw new HttpException('Email and OTP are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const isValid = await this.mailService.verifyOtp(email, otp);
      
      if (isValid) {
        return { 
          message: 'OTP verified successfully',
          verified: true 
        };
      } else {
        throw new HttpException(
          'Invalid or expired OTP', 
          HttpStatus.UNAUTHORIZED
        );
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('OTP verification error:', err);
      throw new HttpException(
        'Failed to verify OTP', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
