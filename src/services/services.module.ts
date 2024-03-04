import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { Post, PostSchema } from 'src/schema/post.schema';
import { JwtModule } from '@nestjs/jwt';
import { Constants } from 'src/config/constants';

@Module({
    imports:[MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, {name:Post.name, schema:PostSchema}]),
    JwtModule.register({
        global: true,
        secret: Constants.jwtSecret,
        signOptions: { expiresIn: '10h' },
      }),],
    providers:[PostService, UserService],
    exports:[PostService, UserService]
})
export class ServicesModule {}
