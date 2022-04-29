import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  InjectDiscordClient,
  Payload,
  SubCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Client, InteractionReplyOptions, MessageEmbed } from 'discord.js';
import moment from 'moment-timezone';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { TimezoneDto, Timezones } from './timezone.dto';

@SubCommand({
  name: 'timezone',
  description: 'What is the server time',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class TimezoneSubCommand
  implements DiscordTransformedCommand<TimezoneDto>
{
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService,
  ) {}

  handler(@Payload() { tz }: TimezoneDto): InteractionReplyOptions {
    const { logo } = this.config.get('base');

    const embed = new MessageEmbed()
      .setThumbnail(logo)
      .setTimestamp()
      .setAuthor({
        name: this.client.user.tag,
        iconURL: logo,
      })
      .setFooter({
        text: this.client.user.tag,
        iconURL: logo,
      });

    return {
      embeds: [embed.addField(tz, moment.tz(tz).format('LLLL'))],
    };
  }
}
