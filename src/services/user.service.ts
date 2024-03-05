import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/controllers/user/dto/user-create.dto';
import { SignInUserDto } from 'src/controllers/user/dto/user-sign-in.dto';
import { PrismaService } from './helpers/prisma.service';
@Injectable()
export class UserService {
  constructor(
    private prismaClient: PrismaService,
    private jwtService: JwtService,
  ) { }
  async create(user: CreateUserDto) {
    try {
      const existingUser = await this.prismaClient.user.findFirst(
        {
          select: {
            email: true
          },
          where: {
            email: user.email
          }
        }
      );
      if (existingUser) {
        throw new Error('email already registered');
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      const createdUser = await this.prismaClient.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
          phoneNumber: user.phoneNumber
        }
      })
      return await this.genJwt({ id: createdUser.id, email: createdUser.email });
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException({ error: { message: error.message } });
    }
  }

  findAll(): any {
    return 'this.cats';
  }

  async signIn(data: SignInUserDto) {
    try {
      const user = await this.prismaClient.user.findFirst(
        {
          select: {
            email: true,
            password: true,
            id: true,
            userType: true,
          },
          where: {
            email: data.email
          }
        }
      );
      if (!user) {
        throw new Error('user not found');
      }
      const matched = await bcrypt.compare(data.password, user.password);
      if (matched) {
        return await this.genJwt({ id: user.id, email: user.email });
      }
      throw new Error('wrong password');
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException({ error: { message: error.message } });
    }
  }

  async authorizeUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prismaClient.user.findFirst({ where: { id: payload.sub }, select: { id: true, name: true, phoneNumber: true, email: true, userType: true } });
      if (!user) {
        throw new Error();
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException()
    }
  }

  async genJwt(data: any) {
    const payload = { sub: data.id, email: data.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async profile(user) {
    return user;
  }


  async createAdmin() {
    const user = {
      email: "admin@gmail.com",
      password: "123456"
    }
    try {
      const existingUser = await this.prismaClient.user.findFirst(
        {
          select: {
            email: true
          },
          where: {
            email: user.email
          }
        }
      );
      if (existingUser) {
        throw new Error('email already registered');
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      const createdUser = await this.prismaClient.user.create({
        data: {
          email: user.email,
          password: user.password,
          userType: "ADMIN"
        }
      })
      return await this.genJwt({ id: createdUser.id, email: createdUser.email });
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException({ error: { message: error.message } });
    }
  }
}
