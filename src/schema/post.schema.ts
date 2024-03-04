import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type PostDocument = mongoose.HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, })
  body: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  author: User
}

export const PostSchema = SchemaFactory.createForClass(Post);
// UserSchema.pre<User>('save', function (next) {
//     console.log('mongoose middleware');
    
//   this.password = undefined;
//   next();
// });
