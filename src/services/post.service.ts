import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schema/post.schema';

@Injectable()
export class PostService {
    constructor(
    ) { }

    async create(post: { title: any; body: any; }, user: { id: any; }) {
        // const createdPost = await new this.postModel({title:post.title, body:post.body, author:user.id})
        // return createdPost; 
    }
}
