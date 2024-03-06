import { Body, Controller, FileTypeValidator, HttpException, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Authenticate } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { ProposalService } from 'src/services/proposal.service';
import { CreateProposalDto } from './dto/proposal-create.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
        @Body() body: any,
        @User() user,
        @UploadedFiles(
        ) files: { photo: Express.Multer.File, income_proof: Express.Multer.File, address_proof: Express.Multer.File },
    ) {
        const { photo, income_proof, address_proof } = files;

        if (!['image/jpg', 'image/jpeg', 'image/png'].includes(photo[0].mimetype)) {
            throw new HttpException('Photo must be of image type', 400);
        } else if (photo[0].size > 2 * 1024 * 1000) {
            throw new HttpException('Photo size must be of less than 2 MB', 400);
        }

        if (!['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(income_proof[0].mimetype) || !['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(address_proof[0].mimetype)) {
            throw new HttpException('Document must be of image or pdf type', 400);
        } else if (income_proof[0].size > 2 * 1024 * 1000 || address_proof[0].size > 2 * 1024 * 1000) {
            throw new HttpException('Document size must be of less than 2 MB', 400);
        }

        // console.log(files);
        return await this.proposalService.create(body, user, files)

        // console.log(files.photo[0].buffer.toString());

        // return await fs.writeFile("./task.pdf", files.photo[0].buffer)
        // return await this.postService.create(body, user)
    }
}