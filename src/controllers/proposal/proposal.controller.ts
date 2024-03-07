import { Body, Controller, FileTypeValidator, Get, HttpException, MaxFileSizeValidator, Param, ParseFilePipe, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Authenticate } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { ProposalService } from 'src/services/proposal.service';
import { CreateProposalDto } from './dto/proposal-create.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetProposalsDto } from './dto/proposal-get.dto';
import { ChangeProposalStatusDto } from './dto/change-proposal-status.dto';
const fs = require("node:fs/promises");
@Controller('proposal')
export class ProposalController {
    constructor(private readonly proposalService: ProposalService) { }

    @UseGuards(Authenticate)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'photo' },
        { name: 'income_proof' },
        { name: 'address_proof' },
    ]))
    async create(
        @Body() body: CreateProposalDto,
        @User() user,
        @UploadedFiles(
        ) files: { photo: Express.Multer.File, income_proof: Express.Multer.File, address_proof: Express.Multer.File },
    ) {
        const { photo, income_proof, address_proof } = files;

        if (!photo || !['image/jpg', 'image/jpeg', 'image/png'].includes(photo[0].mimetype)) {
            throw new HttpException('Photo must be of image type', 400);
        } else if (photo[0].size > 2 * 1024 * 1000) {
            throw new HttpException('Photo size must be of less than 2 MB', 400);
        }

        if (!income_proof || !address_proof || !['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(income_proof[0].mimetype) || !['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(address_proof[0].mimetype)) {
            throw new HttpException('Document must be of image or pdf type', 400);
        } else if (income_proof[0].size > 2 * 1024 * 1000 || address_proof[0].size > 2 * 1024 * 1000) {
            throw new HttpException('Document size must be of less than 2 MB', 400);
        }
        return await this.proposalService.create(body, user, files)
    }

    @UseGuards(Authenticate)
    @Post("get")
    async getMany(@User() user, @Body() filters: GetProposalsDto | undefined) {
        return await this.proposalService.getProposals(user, filters)
    }

    @UseGuards(Authenticate)
    @Get("get-proposal-counts")
    async getProposalCount(@User() user) {
        return await this.proposalService.getProposalsCount(user)
    }

    @UseGuards(Authenticate)
    @Post("/change-status")
    async changeProposalStatus(@User() user, @Body() body:ChangeProposalStatusDto) {
        return await this.proposalService.changeProposalDetailStatus(user, body)
    }



    @UseGuards(Authenticate)
    @Get(":id")
    async getProposalDetails(@User() user, @Param("id") id:string) {
        return await this.proposalService.getProposalDetails(user, id)
    }


}
