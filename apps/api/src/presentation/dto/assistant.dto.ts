import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AssistantChatDto {
  @ApiProperty({ example: 'Summarize today\'s operations.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8_000)
  public prompt!: string;
}

export class AssistantChatResponseDto {
  @ApiProperty({ example: 'Today\'s operations are on track, with no venue conflicts detected.', type: String })
  public answer!: string;
}
