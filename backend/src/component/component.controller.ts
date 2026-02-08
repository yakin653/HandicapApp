import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ComponentService } from './component.service';
import { Component } from './component.entity';

@Controller('components')
export class ComponentController {
  constructor(private readonly componentService: ComponentService) {}

  @Post()
  create(@Body() componentData: Partial<Component>) {
    return this.componentService.create(componentData);
  }

  @Get()
  findAll() {
    return this.componentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.componentService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() componentData: Partial<Component>) {
    return this.componentService.update(+id, componentData);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.componentService.remove(+id);
  }
}
