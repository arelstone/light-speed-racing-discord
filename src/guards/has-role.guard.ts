import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { CommandInteraction, GuildMember } from 'discord.js';
import { NotBotGuard } from './not-bot.guard';

export class HasRoleGuard implements DiscordGuard {
  private readonly requiredRoles: string[];

  constructor(...requiredRoles: string[]) {
    this.requiredRoles = requiredRoles.map((role) => role.toLowerCase());
  }

  @UseGuards(NotBotGuard)
  canActive(
    event: 'interactionCreate',
    [{ member }]: [CommandInteraction],
  ): boolean | Promise<boolean> {
    return this.requiredRoles.some((role) =>
      this.hasRole(member as GuildMember, role),
    );
  }

  private hasRole(member: GuildMember, role: string): boolean {
    return member.roles.cache.map((role) => role.name).includes(role);
  }
}
