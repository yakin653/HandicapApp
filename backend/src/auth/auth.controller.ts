import { Controller, Post, Body, Get, Param, HttpCode, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('📥 [CONTROLLER] Login request received:', { email: loginDto.email });
    const result = await this.authService.login(loginDto);
    
    if (!result.success) {
      console.log('❌ [CONTROLLER] Login failed, throwing 401:', result.error);
      throw new HttpException(
        {
          success: false,
          error: result.error || 'Invalid email or password',
          message: 'Login failed'
        },
        HttpStatus.UNAUTHORIZED
      );
    }
    
    console.log('✅ [CONTROLLER] Login successful, returning 200');
    return result;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    console.log('📥 [CONTROLLER] Register request received:', { email: registerDto.email });
    console.log('📥 [CONTROLLER] Full request body:', JSON.stringify(registerDto));
    
    const result = await this.authService.register(registerDto);
    
    if (!result.success) {
      console.log('❌ [CONTROLLER] Register failed, throwing 409:', result.error);
      console.log('❌ [CONTROLLER] Error details:', JSON.stringify(result));
      
      // Si l'utilisateur existe déjà, renvoyer un 409 Conflict
      if (result.code === 'USER_ALREADY_EXISTS') {
        throw new HttpException(
          {
            success: false,
            error: result.error || 'User already exists',
            message: result.message || 'This email is already registered. Please use login instead.',
            code: 'USER_ALREADY_EXISTS'
          },
          HttpStatus.CONFLICT
        );
      }
      
      // Autres erreurs
      throw new HttpException(
        {
          success: false,
          error: result.error || 'Registration failed',
          message: result.message || 'Registration failed'
        },
        HttpStatus.BAD_REQUEST
      );
    }
    
    console.log('✅ [CONTROLLER] Register successful, returning 201');
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    
    if (!result.success) {
      throw new HttpException(
        {
          success: false,
          error: result.error || 'Failed to send reset code',
          message: result.message || 'Failed to send reset code'
        },
        HttpStatus.BAD_REQUEST
      );
    }
    
    return result;
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(@Body() verifyCodeDto: VerifyCodeDto) {
    const result = await this.authService.verifyResetCode(verifyCodeDto);
    
    if (!result.success) {
      throw new HttpException(
        {
          success: false,
          error: result.error || 'Invalid or expired reset code',
          message: result.message || 'Invalid or expired reset code'
        },
        HttpStatus.BAD_REQUEST
      );
    }
    
    return result;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    console.log('📥 [CONTROLLER] Reset password request received:', { email: resetPasswordDto.email });
    const result = await this.authService.resetPassword(resetPasswordDto);
    
    if (!result.success) {
      console.log('❌ [CONTROLLER] Reset password failed:', result.error);
      throw new HttpException(
        {
          success: false,
          error: result.error || 'Password reset failed',
          message: result.message || 'Password reset failed'
        },
        HttpStatus.BAD_REQUEST
      );
    }
    
    console.log('✅ [CONTROLLER] Reset password successful');
    return result;
  }

  @Post('test-email')
  async testEmail(@Body() body: { email: string }) {
    return this.authService.testEmail(body.email);
  }

  @Get('test-connection')
  testConnection() {
    return { 
      success: true, 
      message: 'Backend is connected!',
      timestamp: new Date().toISOString()
    };
  }

  @Get('check-users')
  async checkUsers() {
    const users = await this.authService.findAllUsers();
    return {
      success: true,
      count: users.length,
      users: users
    };
  }

  @Get('check-user/:email')
  async checkUser(@Param('email') email: string) {
    const user = await this.authService.findUserByEmail(email);
    return {
      exists: !!user,
      user: user
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyCodeDto: VerifyCodeDto) {
    const result = await this.authService.verifyEmail(verifyCodeDto);
    
    if (!result.success) {
      throw new HttpException(
        {
          success: false,
          error: result.error || 'Email verification failed',
          message: result.message || 'Email verification failed'
        },
        HttpStatus.BAD_REQUEST
      );
    }
    
    return result;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: User }) {
    const user = req.user;
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        handicapType: user.handicapType,
        accompagnantType: user.accompagnantType,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    };
  }
}