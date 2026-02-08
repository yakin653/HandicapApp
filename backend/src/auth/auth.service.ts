import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  // ✅ LOGIN
  async login(loginDto: LoginDto) {
    console.log('🔐 Login attempt:', loginDto.email);
    
    // Vérifier que l'email et le mot de passe sont fournis
    if (!loginDto.email || !loginDto.password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }
    
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email }
    });
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      console.log('❌ User not found:', loginDto.email);
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // Vérifier le mot de passe avec bcrypt
    let isPasswordValid = false;
    try {
      // Vérifier si le mot de passe est hashé (commence par $2b$ ou $2a$)
      if (user.password.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      } else {
        // Pour les anciens mots de passe non hashés (migration)
        isPasswordValid = user.password === loginDto.password;
        // Si le mot de passe est correct mais non hashé, le hasher
        if (isPasswordValid) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(loginDto.password, saltRounds);
          user.password = hashedPassword;
          await this.usersRepository.save(user);
          console.log('✅ Password migrated to bcrypt for user:', user.email);
        }
      }
    } catch (error) {
      console.error('❌ Error comparing password:', error);
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', loginDto.email);
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // Générer le token JWT
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    
    // Login réussi
    console.log('✅ Login successful for user:', user.email);
    return {
      success: true,
      token: token,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        handicapType: user.handicapType,
        accompagnantType: user.accompagnantType,
      }
    };
  }

  // ✅ REGISTER
  async register(registerDto: RegisterDto) {
    console.log('📝 [SERVICE] Register attempt:', registerDto.email);
    
    // Vérifier que l'email et le mot de passe sont fournis
    if (!registerDto.email || !registerDto.password) {
      console.log('❌ [SERVICE] Missing email or password');
      return {
        success: false,
        error: 'Email and password are required',
        message: 'Registration failed: Email and password are required'
      };
    }

    // Vérifier que le userType est fourni
    if (!registerDto.userType) {
      console.log('❌ [SERVICE] Missing userType');
      return {
        success: false,
        error: 'User type is required (handicap or accompagnant)',
        message: 'Registration failed: User type is required'
      };
    }

    // Vérifier la cohérence des données
    if (registerDto.userType === UserType.HANDICAP && !registerDto.handicapType) {
      console.log('❌ [SERVICE] Missing handicapType for handicap user');
      return {
        success: false,
        error: 'Handicap type is required for handicap users',
        message: 'Registration failed: Handicap type is required'
      };
    }

    if (registerDto.userType === UserType.ACCOMPAGNANT && !registerDto.accompagnantType) {
      console.log('❌ [SERVICE] Missing accompagnantType for accompagnant user');
      return {
        success: false,
        error: 'Accompagnant type is required for accompagnant users',
        message: 'Registration failed: Accompagnant type is required'
      };
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email }
    });
    
    if (existingUser) {
      console.log('❌ [SERVICE] User already exists - REGISTRATION BLOCKED:', registerDto.email);
      return {
        success: false,
        error: 'User already exists with this email. Please use login instead.',
        message: 'Registration failed: This email is already registered. Please login instead.',
        code: 'USER_ALREADY_EXISTS'
      };
    }
    
    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
    
    // Générer un code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Créer le nouvel utilisateur
    try {
      const user = this.usersRepository.create({
        email: registerDto.email,
        password: hashedPassword,
        username: registerDto.username || registerDto.email.split('@')[0],
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        userType: registerDto.userType,
        handicapType: registerDto.handicapType || null,
        accompagnantType: registerDto.accompagnantType || null,
        isVerified: false,
        verificationCode: verificationCode,
      });
      
      const savedUser = await this.usersRepository.save(user);
      console.log('✅ [SERVICE] User registered successfully:', savedUser.id);
      
      // Envoyer l'email de vérification
      await this.emailService.sendVerificationEmail(savedUser.email, verificationCode);
      
      // Générer le token JWT
      const payload = { email: savedUser.email, sub: savedUser.id };
      const token = this.jwtService.sign(payload);
      
      return {
        success: true,
        message: 'User registered successfully. Please verify your email.',
        token: token,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          username: savedUser.username,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          userType: savedUser.userType,
          handicapType: savedUser.handicapType,
          accompagnantType: savedUser.accompagnantType,
          isVerified: savedUser.isVerified,
        }
      };
    } catch (error) {
      // Si erreur de contrainte unique (email déjà existant)
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        console.log('❌ [SERVICE] Database constraint violation - user already exists');
        return {
          success: false,
          error: 'User already exists with this email. Please use login instead.',
          message: 'Registration failed: This email is already registered.',
          code: 'USER_ALREADY_EXISTS'
        };
      }
      throw error;
    }
  }

  // ✅ FORGOT PASSWORD - ENVOI DU CODE
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    console.log('🔑 Forgot password:', forgotPasswordDto.email);
    
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email }
    });
    
    if (!user) {
      return {
        success: false,
        error: 'No account found with this email'
      };
    }

    // Générer un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Stocker le code avec expiration (15 minutes)
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setMinutes(resetPasswordExpires.getMinutes() + 15);
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetPasswordExpires;
    await this.usersRepository.save(user);
    
    console.log(`🔐 Code généré pour ${user.email}: ${resetCode}`);
    
    // ✅ ENVOI D'EMAIL RÉEL
    const emailSent = await this.emailService.sendResetPasswordEmail(
      user.email, 
      resetCode
    );
    
    if (!emailSent) {
      return {
        success: false,
        error: 'Failed to send email. Please try again.'
      };
    }

    return {
      success: true,
      message: 'Password reset code sent to ' + forgotPasswordDto.email,
      resetCode: resetCode // ✅ On retourne le code pour le test
    };
  }

  // ✅ VÉRIFICATION DU CODE DE RÉINITIALISATION
  async verifyResetCode(verifyCodeDto: VerifyCodeDto) {
    console.log('🔍 Verify reset code:', verifyCodeDto.email, verifyCodeDto.code);
    
    const user = await this.usersRepository.findOne({
      where: { email: verifyCodeDto.email }
    });
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== verifyCodeDto.code) {
      return {
        success: false,
        error: 'Invalid reset code'
      };
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return {
        success: false,
        error: 'Reset code has expired'
      };
    }

    return {
      success: true,
      message: 'Code verified successfully',
    };
  }

  // ✅ VÉRIFICATION DE L'EMAIL
  async verifyEmail(verifyCodeDto: VerifyCodeDto) {
    console.log('🔍 Verify email code:', verifyCodeDto.email, verifyCodeDto.code);
    
    const user = await this.usersRepository.findOne({
      where: { email: verifyCodeDto.email }
    });
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    if (user.isVerified) {
      return {
        success: false,
        error: 'Email already verified'
      };
    }

    if (!user.verificationCode || user.verificationCode !== verifyCodeDto.code) {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }

    // Marquer l'email comme vérifié
    user.isVerified = true;
    user.verificationCode = null;
    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  // ✅ RÉINITIALISATION DU MOT DE PASSE
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    console.log('🔄 [SERVICE] Reset password request:', resetPasswordDto.email);
    
    // Vérifier que l'email, le code et le nouveau mot de passe sont fournis
    if (!resetPasswordDto.email || !resetPasswordDto.code || !resetPasswordDto.newPassword) {
      console.log('❌ [SERVICE] Missing email, code or new password');
      return {
        success: false,
        error: 'Email, reset code and new password are required'
      };
    }
    
    // Trouver l'utilisateur
    const user = await this.usersRepository.findOne({
      where: { email: resetPasswordDto.email }
    });
    
    if (!user) {
      console.log('❌ [SERVICE] User not found:', resetPasswordDto.email);
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Vérifier le code de réinitialisation
    if (!user.resetPasswordCode || user.resetPasswordCode !== resetPasswordDto.code) {
      console.log('❌ [SERVICE] Invalid reset code');
      return {
        success: false,
        error: 'Invalid reset code'
      };
    }

    // Vérifier l'expiration du code
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      console.log('❌ [SERVICE] Reset code expired');
      return {
        success: false,
        error: 'Reset code has expired'
      };
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);
    
    try {
      // Mettre à jour le mot de passe et effacer le code de réinitialisation
      user.password = hashedPassword;
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      
      await this.usersRepository.save(user);
      
      console.log('✅ [SERVICE] Password successfully updated in database for:', user.email);

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.error('❌ [SERVICE] Error saving password:', error);
      return {
        success: false,
        error: 'Failed to update password: ' + (error.message || 'Unknown error')
      };
    }
  }

  // ✅ MÉTHODE DE TEST
  async testEmail(email: string) {
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await this.emailService.sendResetPasswordEmail(email, testCode);
    
    return {
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email',
      testCode: testCode,
    };
  }


// ✅ AJOUTE CES MÉTHODES À LA FIN DE TA CLASSE AuthService

async findAllUsers() {
  try {
    const users = await this.usersRepository.find();
    console.log(`📊 Found ${users.length} users in database`);
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
}

async findUserByEmail(email: string) {
  try {
    const user = await this.usersRepository.findOne({
      where: { email: email }
    });
    console.log(`🔍 Search for user ${email}:`, user ? 'FOUND' : 'NOT FOUND');
    return user;
  } catch (error) {
    console.error('❌ Error finding user:', error);
    return null;
  }
}

async countUsers() {
  try {
    const count = await this.usersRepository.count();
    console.log(`📈 Total users in database: ${count}`);
    return count;
  } catch (error) {
    console.error('❌ Error counting users:', error);
    return 0;
  }
}

}