import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { UserRole } from '../../domain';

export class LoginDto {
  @ApiProperty({ example: 'fan@example.com' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ example: 'a-strong-password' })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  public password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'fan@example.com' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ example: 'a-strong-password' })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  public password!: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  public role?: UserRole;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  public refreshToken!: string;
}

export class LogoutDto extends RefreshTokenDto {}

export class AuthenticationTokensResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: String })
  public accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: String })
  public refreshToken!: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  public sub!: string;

  @ApiProperty({ example: 'fan@example.com' })
  public email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  public role!: UserRole;
}
