import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/user-create.dto';
import { SignInUserDto } from './dto/user-sign-in.dto';
import { Authenticate } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserService } from 'src/services/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Post()
  async create(@Body() user: CreateUserDto) {
    return await this.userService.create(user);
  }


  @Post('sign-in')
  async signIn(@Body() user: SignInUserDto) {
    return await this.userService.signIn(user);
  }


  @Get('authorize')
  async authorize(@Query('token') token:string){
    return await this.userService.authorizeUser(token);
  }

  @UseGuards(Authenticate)
  @Get('profile')
  async profile(@User() user:any){
    return user;
  }
}
