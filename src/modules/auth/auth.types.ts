export type LoginRequestDTO = {
  email: string;
  password: string;
};

export type RefreshTokenRequestDTO = {
  refreshToken: string;
};

export type TokensResponseDTO = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUserResponseDTO = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponseDTO = {
  tokens: TokensResponseDTO;
  user: AuthUserResponseDTO;
};
