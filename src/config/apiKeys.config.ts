import { registerAs } from '@nestjs/config';
import 'dotenv/config';

const config = {
  giphy: process.env.GIPHY_API_KEY,
  github: process.env.GITHUB_PAT,
};

export type ApiKeysConfig = typeof config;

export default registerAs('apiKeys', (): ApiKeysConfig => config);
