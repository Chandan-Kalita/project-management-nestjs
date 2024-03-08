import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const schema = z.object({
  id:z.string(),
  project_title: z.string(),
  project_description: z.string(),
  objective: z.string(),
  duration: z.string().transform((data) => parseInt(data)),
  budget: z.string().transform((data) => parseInt(data)),
  state: z.string(),
  district: z.string(),
  bank_name: z.string(),
  ifsc_code: z.string(),
  account_number: z.string(),
  income_source: z.string(),
  income: z.string(),
  land_size: z.string().transform((data) => parseInt(data)),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openapi = zodToOpenAPI(schema);
export class UpdateProposalDto extends createZodDto(schema) { }
