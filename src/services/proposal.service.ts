import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schema/post.schema';
import { CreateProposalDto } from '../controllers/proposal/dto/proposal-create.dto';
import { PrismaService } from './helpers/prisma.service';
const fs = require("node:fs/promises");
import { v4 as uuid } from "uuid";
import { firebaseAdmin } from './helpers/firebase.service';
import { getDownloadURL } from 'firebase-admin/storage';
import { GetProposalsDto } from '../controllers/proposal/dto/proposal-get.dto';
import { ChangeProposalStatusDto } from 'src/controllers/proposal/dto/change-proposal-status.dto';

@Injectable()
export class ProposalService {
    constructor(
        private prismaClient: PrismaService,
    ) { }

    async create(body: CreateProposalDto, user: { id: any; }, files: { photo: Express.Multer.File, income_proof: Express.Multer.File, address_proof: Express.Multer.File }) {
        try {
            const proposal = await this.prismaClient.$transaction(async (tx) => {

                const bucket = firebaseAdmin.storage().bucket("gs://jrpl-dev.appspot.com")

                const photo_name = `chandan_test/${uuid()}${files.photo[0].originalname}`;
                const income_proof_name = `chandan_test/${uuid()}${files.income_proof[0].originalname}`;
                const address_proof_name = `chandan_test/${uuid()}${files.address_proof[0].originalname}`;


                const photo_ref = bucket.file(photo_name)
                await photo_ref.save(files.photo[0].buffer);
                const photo_path = await getDownloadURL(photo_ref);

                const income_proof_ref = bucket.file(income_proof_name)
                await income_proof_ref.save(files.income_proof[0].buffer);
                const income_proof_path = await getDownloadURL(income_proof_ref);

                const address_proof_ref = bucket.file(address_proof_name)
                await address_proof_ref.save(files.address_proof[0].buffer);
                const address_proof_path = await getDownloadURL(address_proof_ref);

                if (!address_proof_path || !income_proof_path || !photo_path) {
                    throw new Error("Error in file upload");
                }

                const proposal = tx.proposal.create({
                    data: {
                        project_title: body.project_title,
                        project_description: body.project_description,
                        objective: body.objective,
                        duration: body.duration,
                        budget: body.budget,
                        state: body.state,
                        district: body.district,
                        bank_name: body.bank_name,
                        ifsc_code: body.ifsc_code,
                        account_number: body.account_number,
                        income_source: body.income_source,
                        income: body.income,
                        land_size: body.land_size,
                        photo_path: photo_path,
                        address_proof_path: address_proof_path,
                        income_proof_path: income_proof_path,
                        user_id: user.id
                    }
                })
                if (!proposal) {
                    await photo_ref.delete()
                    await income_proof_ref.delete()
                    await address_proof_ref.delete()
                    throw new Error("Error in db insert");
                }
                return proposal;

            }, {
                timeout: 10000
            })
        } catch (error) {
            console.log(error);
            // throw new HttpException(error, 400);
            throw new HttpException(error.message, 400);
        }
    }
    async getProposals(user, filters: GetProposalsDto | undefined) {
        if (user.userType == "USER") {
            const whereObj = {
                user_id: user.id
            }
            if (filters) {
                if (filters.proposalStatus) {
                    whereObj["status"] = filters.proposalStatus
                }
            }
            return {
                proposals: await this.prismaClient.proposal.findMany({
                    where: whereObj,
                    select: {
                        id: true,
                        project_title: true,
                        objective: true,
                        budget: true,
                        status: true,
                    }
                }),
                count: await this.prismaClient.proposal.count({
                    where: whereObj
                })
            }
        }else{
            const whereObj = {}
            if (filters) {
                if (filters.proposalStatus) {
                    whereObj["status"] = filters.proposalStatus
                }
            }
            return {
                proposals: await this.prismaClient.proposal.findMany({
                    where: whereObj,
                    select: {
                        id: true,
                        project_title: true,
                        objective: true,
                        budget: true,
                        status: true,
                    }
                }),
                count: await this.prismaClient.proposal.count({
                    where: whereObj
                })
            }

        }
    }

    async getProposalsCount(user){
        let count;
        if (user.userType == "ADMIN") {
            count = await this.prismaClient.proposal.groupBy({
                by:['status'],
                _count:{
                    id:true,                
                }
            })
            
        }
        let a = {ALL:0};
        for(let i = 0; i<count.length; i++){
            a[count[i].status] = count[i]._count.id
            a["ALL"] += count[i]._count.id
        }
        return a;
    }

    async getProposalDetails(user, id){
        if(user.userType == "ADMIN"){
            return await this.prismaClient.proposal.findFirst({ 
                where:{
                    id
                },
                include:{
                    user:true,
                }
            })
        }else{
            return await this.prismaClient.proposal.findFirst({ 
                where:{
                    id,
                    user_id:user.id
                },
                include:{
                    user:true,
                }
            })
        }
    }

    async changeProposalDetailStatus(user, newStatus:ChangeProposalStatusDto){
        let data = {status:newStatus.status};
        if(newStatus.status == "REJECTED"){
            data["adminComment"] = newStatus.comment
            data["rejectionReason"] = {push:newStatus.rejectionField}
        }
        console.log(data);
        
        return await this.prismaClient.proposal.update({
            data,
            where:{
                id: newStatus.id,
            }
        })
    }
}
