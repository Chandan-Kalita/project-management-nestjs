import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const schema = z.object({

  sortBy: z.optional(z.enum(["id", "budget"])),
  id: z.optional(z.string()),
  proposalStatus: z.optional(z.enum(["ACCEPTED", "REJECTED", "PENDING"]))

});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openapi = zodToOpenAPI(schema);
export class GetProposalsDto extends createZodDto(schema) { }
