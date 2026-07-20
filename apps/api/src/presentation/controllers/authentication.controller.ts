import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import {
  AUTHENTICATION_APPLICATION_SERVICE,
  AuthenticationApplicationService,
} from '../../application';
import type { AuthenticatedUser } from '../decorators/current-user.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  AuthenticationTokensResponseDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  UserProfileResponseDto,
} from '../dto/authentication.dto';
import { JwtAuthenticationGuard } from '../guards/jwt-authentication.guard';
import { SuccessResponse } from '../responses/success.response';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  public constructor(
    @Inject(AUTHENTICATION_APPLICATION_SERVICE)
    private readonly authenticationService: AuthenticationApplicationService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({ description: 'Authentication successful.', type: AuthenticationTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  public async login(@Body() dto: LoginDto): Promise<SuccessResponse<AuthenticationTokensResponseDto>> {
    return new SuccessResponse('Authentication successful.', await this.authenticationService.login(dto));
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account' })
  @ApiCreatedResponse({ description: 'Registration successful.', type: AuthenticationTokensResponseDto })
  @ApiConflictResponse({ description: 'An account with this email already exists.' })
  public async register(@Body() dto: RegisterDto): Promise<SuccessResponse<AuthenticationTokensResponseDto>> {
    return new SuccessResponse('Registration successful.', await this.authenticationService.register(dto));
  }

  @Get('me')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ description: 'User profile retrieved.', type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'A valid access token is required.' })
  public async me(@CurrentUser() user: AuthenticatedUser): Promise<SuccessResponse<UserProfileResponseDto>> {
    return new SuccessResponse('User profile retrieved.', await this.authenticationService.getProfile(user.sub));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a refresh token' })
  @ApiOkResponse({ description: 'Token refresh successful.', type: AuthenticationTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token.' })
  public async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<SuccessResponse<AuthenticationTokensResponseDto>> {
    return new SuccessResponse('Token refresh successful.', await this.authenticationService.refresh(dto.refreshToken));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate the active refresh token' })
  @ApiOkResponse({ description: 'Logout successful.' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token.' })
  public async logout(@Body() dto: LogoutDto): Promise<SuccessResponse<undefined>> {
    await this.authenticationService.logout(dto.refreshToken);
    return new SuccessResponse('Logout successful.', undefined);
  }
}
