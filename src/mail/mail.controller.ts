import { Controller, Post, UploadedFile, Body, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
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
    try {
      await this.mailService.sendPdf(email, file);
      return { message: 'Email sent successfully' };
    } catch (err) {
      console.error('Mail sending error:', err);
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}