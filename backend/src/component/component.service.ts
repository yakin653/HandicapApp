import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Component } from './component.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ComponentService {
  constructor(
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
  ) {}

  // Créer un composant
  async create(componentData: Partial<Component>): Promise<Component> {
    const component = this.componentRepository.create({
      name: componentData.name ?? '',
      type: componentData.type ?? '',
      description: componentData.description ?? '',
      imageUrl: componentData.imageUrl ?? '',
    });
    return await this.componentRepository.save(component);
  }

  // Lister tous les composants
  async findAll(): Promise<Component[]> {
    return await this.componentRepository.find();
  }

  // Trouver un composant par id
 async findOne(id: number): Promise<Component> {
  const component = await this.componentRepository.findOne({ where: { id } });
  if (!component) {
    throw new NotFoundException(`Component with id ${id} not found`);
  }
  return component;
}
  // Mettre à jour un composant
  async update(id: number, componentData: Partial<Component>): Promise<Component> {
    await this.componentRepository.update(id, componentData);
    return this.findOne(id);
  }

  // Supprimer un composant
  async remove(id: number): Promise<void> {
    await this.componentRepository.delete(id);
  }
}
