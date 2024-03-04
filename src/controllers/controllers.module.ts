import { Module } from '@nestjs/common';
import { PostController } from './post/post.controller';
import { UserController } from './user/user.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
    imports:[ServicesModule],
    controllers:[PostController, UserController]
})
export class ControllersModule {}
