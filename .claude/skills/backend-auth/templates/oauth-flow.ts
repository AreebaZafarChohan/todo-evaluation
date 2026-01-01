import { Request, Response } from 'express';

const OAUTH_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '{{googleClientId}}',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '{{googleClientSecret}}',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '{{googleRedirectUri}}',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '{{githubClientId}}',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '{{githubClientSecret}}',
    redirectUri: process.env.GITHUB_REDIRECT_URI || '{{githubRedirectUri}}',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
};

export function getOAuthUrl(provider: 'google' | 'github', state: string): string {
  const config = OAUTH_CONFIG[provider];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: provider === 'google'
      ? 'openid email profile'
      : 'read:user user:email',
    state,
  });
  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  provider: 'google' | 'github',
  code: string
): Promise<{ accessToken: string; idToken?: string; refreshToken?: string } | null> {
  const config = OAUTH_CONFIG[provider];

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
  };
}

export async function getUserInfo(provider: 'google' | 'github', accessToken: string) {
  const endpoints = {
    google: 'https://www.googleapis.com/oauth2/v3/userinfo',
    github: 'https://api.github.com/user',
  };

  const response = await fetch(endpoints[provider], {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
