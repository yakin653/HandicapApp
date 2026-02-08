import { Injectable } from '@nestjs/common';
const nodemailer = require('nodemailer'); // ✅ Utilise require au lieu de import

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({ // ✅ createTransport au lieu de createTransporter
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ton-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'ton-app-password',
      },
    });
  }

  async sendResetPasswordEmail(email: string, resetCode: string): Promise<boolean> {
    try {
      console.log('📧 Attempting to send email to:', email);
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'MecaLens <noreply@mecalens.com>',
        to: email,
        subject: '🔐 Code de réinitialisation MecaLens',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #BB86FC; text-align: center;">MecaLens</h1>
            <h2 style="text-align: center;">Réinitialisation de mot de passe</h2>
            
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe MecaLens.</p>
            
            <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #BB86FC; font-size: 32px; margin: 0;">${resetCode}</h1>
            </div>
            
            <p>Utilisez ce code dans l'application pour réinitialiser votre mot de passe.</p>
            <p>Ce code expirera dans 10 minutes.</p>
            
            <p style="color: #666;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', email);
      return true;
      
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    try {
      console.log('📧 Attempting to send verification email to:', email);
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'MecaLens <noreply@mecalens.com>',
        to: email,
        subject: '✅ Vérification de votre compte MecaLens',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #BB86FC; text-align: center;">MecaLens</h1>
            <h2 style="text-align: center;">Vérification de votre compte</h2>
            
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit sur MecaLens.</p>
            
            <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #BB86FC; font-size: 32px; margin: 0;">${verificationCode}</h1>
            </div>
            
            <p>Utilisez ce code dans l'application pour vérifier votre compte.</p>
            <p>Ce code expirera dans 24 heures.</p>
            
            <p style="color: #666;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully to:', email);
      return true;
      
    } catch (error) {
      console.error('❌ Verification email sending failed:', error);
      return false;
    }
  }
}