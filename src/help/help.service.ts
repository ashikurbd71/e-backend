import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { CreateHelpDto } from './dto/create-help.dto';
import { UpdateHelpDto } from './dto/update-help.dto';
import { Help, SupportStatus } from './entities/help.entity';

@Injectable()
export class HelpService {
  constructor(
    @InjectRepository(Help)
    private readonly helpRepo: Repository<Help>,
    @Inject('MAILER_TRANSPORT')
    private readonly mailer: Transporter,
  ) {}

  async create(createHelpDto: CreateHelpDto) {
    const entity = this.helpRepo.create({
      email: createHelpDto.email,
      issue: createHelpDto.issue,
      status: createHelpDto.status ?? SupportStatus.PENDING,
    });
    const saved = await this.helpRepo.save(entity);
    await this.sendSupportEmail(saved);
    return saved;
  }

  async findAll() {
    return this.helpRepo.find();
  }

  async findOne(id: number) {
    const entity = await this.helpRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Help ticket ${id} not found`);
    return entity;
  }

  async update(id: number, updateHelpDto: UpdateHelpDto) {
    const entity = await this.findOne(id);
    const merged = this.helpRepo.merge(entity, updateHelpDto);
    return this.helpRepo.save(merged);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.helpRepo.softRemove(entity);
    return { success: true };
  }

  private async sendSupportEmail(help: Help) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL ?? 'admin.clv@gmail.com';
      await this.mailer.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to: adminEmail,
        subject: `New Support Issue from ${help.email}`,
        text: `Issue:\n${help.issue}\nStatus: ${help.status}\nTicket ID: ${help.id}`,
      });
    } catch (e) {
      console.error('Failed to send support email:', e);
    }
  }
}
