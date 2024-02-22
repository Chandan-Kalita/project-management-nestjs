import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ select: false, required: true, })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User).index({
  email: 1,
});
// UserSchema.pre<User>('save', function (next) {
//     console.log('mongoose middleware');
    
//   this.password = undefined;
//   next();
// });
