import {
  IsString,
  IsObject,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class ParametersDTO {
  @IsString()
  paramName: string;

  @IsString()
  paramValue: string;
}

class FulfillmentTextDTO {
  @IsArray()
  @IsNotEmpty({ each: true })
  text: string[];
}

class FulfillmentMessageDTO {
  @ValidateNested()
  @Type(() => FulfillmentTextDTO)
  text: FulfillmentTextDTO;
}

class OutputContextDTO {
  @IsString()
  name: string;

  @IsNotEmpty()
  lifespanCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParametersDTO)
  parameters: ParametersDTO[];
}

class IntentDTO {
  @IsString()
  name: string;

  @IsString()
  displayName: string;
}

class QueryResultDTO {
  @IsString()
  queryText: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ParametersDTO)
  parameters: ParametersDTO;

  @IsBoolean()
  allRequiredParamsPresent: boolean;

  @IsString()
  fulfillmentText: string;

  @IsArray()
  @ValidateNested()
  @Type(() => FulfillmentMessageDTO)
  fulfillmentMessages: FulfillmentMessageDTO[];

  @IsArray()
  @ValidateNested()
  @Type(() => OutputContextDTO)
  outputContexts: OutputContextDTO[];

  @ValidateNested()
  @Type(() => IntentDTO)
  intent: IntentDTO;

  @IsNumber()
  intentDetectionConfidence: number;

  @IsObject()
  diagnosticInfo: object;

  @IsString()
  languageCode: string;
}

export class RequestDTO {
  @IsString()
  responseId: string;

  @IsString()
  session: string;

  @IsObject()
  @ValidateNested()
  @Type(() => QueryResultDTO)
  queryResult: QueryResultDTO;

  @IsObject()
  originalDetectIntentRequest: object;
}
