import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const schema = z.object({

  id: z.string(),
  status: z.enum(["ACCEPTED", "REJECTED"]),
  comment: z.optional(z.string()),
  rejectionField: z.optional(z.string())
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openapi = zodToOpenAPI(schema);
export class ChangeProposalStatusDto extends createZodDto(schema) { }
