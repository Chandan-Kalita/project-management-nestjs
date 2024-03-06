import { Module } from '@nestjs/common';
import { ProposalController } from './proposal/proposal.controller';
import { UserController } from './user/user.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
    imports: [ServicesModule],
    controllers: [ProposalController, UserController]
})
export class ControllersModule { }
