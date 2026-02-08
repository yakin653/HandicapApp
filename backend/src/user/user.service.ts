import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getFirstUser() {
    const user = await this.usersRepository.findOne({
      order: { id: 'ASC' }
    });
    
    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    }
    
    return {
      success: false,
      error: 'No users found'
    };
  }

  async updateFirstUser(updateData: any) {
    const user = await this.usersRepository.findOne({
      order: { id: 'ASC' }
    });
    
    if (user) {
      await this.usersRepository.update(user.id, {
        ...updateData,
        updatedAt: new Date()
      });
      
      const updatedUser = await this.usersRepository.findOneBy({ id: user.id });
      
      return {
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      };
    }
    
    return {
      success: false,
      error: 'No user found to update'
    };
  }

  async getAllUsers() {
    const users = await this.usersRepository.find();
    return {
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }))
    };
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    }
    
    return {
      success: false,
      error: 'User not found'
    };
  }
}