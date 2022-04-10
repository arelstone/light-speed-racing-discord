import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { OnReadyEvent } from './events/on-ready.event';
import { OnUserJoinEvent } from './events/on-user-join.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [OnReadyEvent, OnUserJoinEvent],
})
export class DiscordEventModule {}