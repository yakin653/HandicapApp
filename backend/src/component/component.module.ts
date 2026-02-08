import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentService } from './component.service';
import { ComponentController } from './component.controller';
import { Component } from './component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Component])],
  providers: [ComponentService],
  controllers: [ComponentController],
})
export class ComponentModule {}
