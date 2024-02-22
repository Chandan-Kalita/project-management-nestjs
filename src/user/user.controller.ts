import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user-create.dto';
import { SignInUserDto } from './dto/user-sign-in.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  findAll(): string {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }


  @Post('sign-in')
  signIn(@Body() user: SignInUserDto) {
    return this.userService.signIn(user);
  }
}
