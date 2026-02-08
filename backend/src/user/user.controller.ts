import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile() {
    // Pour l'instant retourne le premier utilisateur
    // Plus tard: utiliser l'authentification JWT
    return this.userService.getFirstUser();
  }

  @Put('profile')
  async updateProfile(@Body() updateData: any) {
    console.log('📝 Update profile:', updateData);
    return this.userService.updateFirstUser(updateData);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }
}