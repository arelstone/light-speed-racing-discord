import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Formatters } from 'discord.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FtpService } from 'src/common/ftp.service';
import { GithubService, ServerConfigFiles } from 'src/common/github.service';
import { Config } from 'src/config/config.types';
import { ServerSetupConfig } from 'src/config/server-setup.config';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { RoleGuard } from 'src/guards/role.guard';
import { ServerConfigDto } from './server-config.dto';
import { ServerService } from './server.service';

@SubCommand({
  name: 'sync',
  description: 'Sync the configuration for a championship',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class SyncSubCommand
  implements DiscordTransformedCommand<ServerConfigDto>
{
  private readonly serverConfigTempPath = join(
    __dirname,
    '..',
    '..',
    '__server-config__',
  );

  constructor(
    private readonly service: ServerService,
    private readonly github: GithubService,
    private readonly config: ConfigService<Config>,
    private readonly ftp: FtpService,
  ) {}

  @UseGuards(new RoleGuard('admin', 'host', 'moderator', 'steward'))
  async handler(@Payload() dto: ServerConfigDto) {
    try {
      const serverFiles = await this.fetchServerConfigOnGithub(dto);

      this.storeTempFiles({
        'settings.json': serverFiles['settings.json'],
        'assistRules.json': serverFiles['assistRules.json'],
        'event.json': serverFiles['event.json'],
        'eventRules.json': serverFiles['eventRules.json'],
        'entryList.json': await this.fetchEntryList(dto),
      });

      await this.ftp.connectAndUploadFrom(this.serverConfigTempPath);

      return `Configuration for ${Formatters.bold(
        dto.championship,
      )} was updated. You need to restart the server manually to apply these configurations`;
    } catch (error) {
      return error.message;
    }
  }

  private storeTempFiles(content: Record<string, Record<string, unknown>>) {
    if (!existsSync(this.serverConfigTempPath)) {
      mkdirSync(this.serverConfigTempPath);
    }

    for (const fileName in content) {
      writeFileSync(
        join(this.serverConfigTempPath, fileName),
        JSON.stringify(content[fileName], null, 2),
      );
    }
  }

  private adminPassword(dto: ServerConfigDto) {
    const { defaultAdminPassword } =
      this.config.get<ServerSetupConfig>('server-setup');

    return dto.adminPassword ?? defaultAdminPassword;
  }

  private async fetchEntryList(dto: ServerConfigDto) {
    return await this.service.entryListFor(
      dto.championship,
      dto.forceentrylist,
    );
  }

  private async fetchServerConfigOnGithub(dto: ServerConfigDto) {
    const serverFiles = await this.github.fetchChampionshipConfig(
      dto.championship,
    );

    return {
      ...serverFiles,
      ...this.replace(
        'settings.json',
        'adminPassword',
        this.adminPassword(dto),
        serverFiles,
      ),
    };
  }

  private replace(
    fileName: string,
    key: string,
    value: unknown,
    serverFiles: ServerConfigFiles,
  ) {
    return {
      ...serverFiles,
      [fileName]: {
        ...serverFiles[fileName],
        [key]: value,
      },
    };
  }
}