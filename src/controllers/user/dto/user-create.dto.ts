import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const schema = z.object({
  email: z.string(),
  password: z.string(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openapi = zodToOpenAPI(schema);
export class CreateUserDto extends createZodDto(schema) {}
