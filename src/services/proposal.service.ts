import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schema/post.schema';
import { CreateProposalDto } from '../controllers/proposal/dto/proposal-create.dto';
import { PrismaService } from './helpers/prisma.service';
const fs = require("node:fs/promises");
import { v4 as uuid } from "uuid";
import { firebaseAdmin } from './helpers/firebase.service';
import { getDownloadURL } from 'firebase-admin/storage';

@Injectable()
export class ProposalService {
    constructor(
        private prismaClient: PrismaService,
    ) { }

    async create(body: CreateProposalDto, user: { id: any; }, files: { photo: Express.Multer.File, income_proof: Express.Multer.File, address_proof: Express.Multer.File }) {
        const bucket = firebaseAdmin.storage().bucket("gs://jrpl-dev.appspot.com")
        const fileRef = bucket.file("task.pdf")
        await fileRef.save(files.income_proof[0].buffer);
        return await getDownloadURL(fileRef);
        return await this.prismaClient.$transaction(async (tx) => {
            const photo_path = `${uuid()}${files.photo[0].originalname}`;
            const income_proof_path = `${uuid()}${files.income_proof[0].originalname}`;
            const address_proof_path = `${uuid()}${files.address_proof[0].originalname}`;
            // await fs.writeFile(photo_path, files.photo[0].buffer)
            // await fs.writeFile(income_proof_path, files.income_proof[0].buffer)
            // await fs.writeFile(income_proof_path, files.income_proof[0].buffer)

            // const sender = await tx.account.update({
            //   data: {
            //     balance: {
            //       decrement: amount,
            //     },
            //   },
            //   where: {
            //     email: from,
            //   },
            // })

            // // 2. Verify that the sender's balance didn't go below zero.
            // if (sender.balance < 0) {
            //   throw new Error(`${from} doesn't have enough to send ${amount}`)
            // }

            // // 3. Increment the recipient's balance by amount
            // const recipient = await tx.account.update({
            //   data: {
            //     balance: {
            //       increment: amount,
            //     },
            //   },
            //   where: {
            //     email: to,
            //   },
            // })

            // return recipient
        })
    }
}
