import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const schema = z.object({
  id:z.string(),
  project_title: z.optional(z.string()),
  project_description: z.optional(z.string()),
  objective: z.optional(z.string()),
  duration: z.optional(z.string().transform((data) => parseInt(data))),
  budget: z.optional(z.string().transform((data) => parseInt(data))),
  state: z.optional(z.string()),
  district: z.optional(z.string()),
  bank_name: z.optional(z.string()),
  ifsc_code: z.optional(z.string()),
  account_number: z.optional(z.string()),
  income_source: z.optional(z.string()),
  income: z.optional(z.string()),
  land_size: z.optional(z.string().transform((data) => parseInt(data))),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openapi = zodToOpenAPI(schema);
export class ReapplyProposalDto extends createZodDto(schema) { }
