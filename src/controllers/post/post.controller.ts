import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Authenticate } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { PostService } from 'src/services/post.service';

@Controller('post')
export class PostController {
    constructor(private readonly postService:PostService){}

    @UseGuards(Authenticate)
    @Post()
    async create(@Body() body:any, @User() user){
        return await this.postService.create(body, user)
    }
}
