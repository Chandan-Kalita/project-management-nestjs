import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schema/post.schema';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
      ) {}

    async create(post, user){
        const createdPost = await new this.postModel({title:post.title, body:post.body, author:user.id})
        return createdPost; 
    }
}
