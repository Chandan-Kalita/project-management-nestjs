import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { Post, PostSchema } from 'src/schema/post.schema';
import { JwtModule } from '@nestjs/jwt';
import { Constants } from 'src/config/constants';
import { PrismaService } from './helpers/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: Constants.jwtSecret,
      signOptions: { expiresIn: '10h' },
    }),],
  providers: [ProposalService, UserService, PrismaService],
  exports: [ProposalService, UserService, PrismaService]
})
export class ServicesModule { }
