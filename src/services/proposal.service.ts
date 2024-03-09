import { HttpException, Injectable, UploadedFile } from '@nestjs/common';
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
import { UpdateProposalDto } from 'src/controllers/proposal/dto/proposal-update.dto';

@Injectable()
export class ProposalService {
    constructor(
        private prismaClient: PrismaService,
    ) { }

    async create(body: CreateProposalDto, user: { id: string; }, files: { photo: Express.Multer.File, income_proof: Express.Multer.File, address_proof: Express.Multer.File }) {
        try {
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
                console.log("File upload done");
                
                const proposal = await this.prismaClient.proposal.create({
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
                        photo_path_ref: photo_name,
                        address_proof_path_ref:address_proof_name,
                        income_proof_path_ref:income_proof_name,
                        // user_id: user.id,
                        user:{
                            connect:{
                                id:user.id
                            }
                        }
                    },
                })
                console.log({proposal});
                if (!proposal) {
                    console.log({proposal});
                    
                    await photo_ref.delete()
                    await income_proof_ref.delete()
                    await address_proof_ref.delete()
                    throw new Error("Error in db insert");
                }
                return proposal;

            
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
        } else {
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

    async getProposalsCount(user) {
        let count;
        if (user.userType == "ADMIN") {
            count = await this.prismaClient.proposal.groupBy({
                by: ['status'],
                _count: {
                    id: true,
                }
            })

        }
        let a = { ALL: 0 };
        for (let i = 0; i < count.length; i++) {
            a[count[i].status] = count[i]._count.id
            a["ALL"] += count[i]._count.id
        }
        return a;
    }

    async getProposalDetails(user, id) {
        if (user.userType == "ADMIN") {
            return await this.prismaClient.proposal.findFirst({
                where: {
                    id
                },
                include: {
                    user: true,
                }
            })
        } else {
            return await this.prismaClient.proposal.findFirst({
                where: {
                    id,
                    user_id: user.id
                },
                include: {
                    user: true,
                }
            })
        }
    }

    async changeProposalDetailStatus(user, newStatus: ChangeProposalStatusDto) {
        let data = { status: newStatus.status };
        if (newStatus.status == "REJECTED") {
            data["adminComment"] = newStatus.comment
            data["rejectionReason"] = { push: newStatus.rejectionField }
        }
        console.log(data);

        return await this.prismaClient.proposal.update({
            data,
            where: {
                id: newStatus.id,
            }
        })
    }

    async update(body: UpdateProposalDto, user: { id: any; }, files: any) {
        /*
        create new refs
        get old refs
        update data
        delete old refs
        */
        try {
            const proposal = await this.prismaClient.$transaction(async (tx) => {

                const bucket = firebaseAdmin.storage().bucket("gs://jrpl-dev.appspot.com")
                let imageData = await tx.proposal.findFirst({
                    where:{
                        id: body.id
                    },
                    select:{
                        photo_path_ref:true,
                        income_proof_path_ref:true,
                        address_proof_path_ref:true,
                    }
                })
                async function uploadFiles(file){
                    const file_name = `chandan_test/${uuid()}${files[file][0].originalname}`;
                    const file_ref = bucket.file(file_name)
                    await file_ref.save(files[file][0].buffer);
                    const file_url = await getDownloadURL(file_ref);
                    if(!file_url){
                        throw new Error("Error in file upload");
                    }
                    return {file_name, file_url}
                }

                let updatedFiles:any = {};

                let deletableFiles = []
                if (files.photo) {
                    let photo_loc = await uploadFiles("photo")
                    updatedFiles["photo_path"] = photo_loc.file_url
                    updatedFiles["photo_path_ref"] = photo_loc.file_name
                    deletableFiles.push(imageData.photo_path_ref)
                }
                if (files.income_proof) {
                    let income_loc = await uploadFiles("income_proof")
                    updatedFiles["income_proof_path"] = income_loc.file_url
                    updatedFiles["income_proof_path_ref"] = income_loc.file_name
                    deletableFiles.push(imageData.income_proof_path_ref)
                }
                if (files.address_proof) {
                    let address_loc = await uploadFiles("address_proof")
                    updatedFiles["address_proof_path"] = address_loc.file_url
                    updatedFiles["address_proof_path_ref"] = address_loc.file_name
                    deletableFiles.push(imageData.address_proof_path_ref)
                }


                const proposal = tx.proposal.update({
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
                        user_id: user.id,
                        ...updatedFiles
                    },
                    where:{
                        id:body.id
                    }
                })
                if (!proposal) {
                    if(updatedFiles.address_proof_path_ref){
                        await bucket.file(updatedFiles.address_proof_path_ref).delete()
                    }
                    if(updatedFiles.income_proof_path_ref){
                        await bucket.file(updatedFiles.income_proof_path_ref).delete()
                    }
                    if(updatedFiles.photo_path_ref){
                        await bucket.file(updatedFiles.photo_path_ref).delete()
                    }
                    throw new Error("Error in db insert");
                }else{
                    deletableFiles.forEach((path)=>{
                        bucket.file(path).delete()
                    })
                }
                return proposal;

            }, {
                timeout: 10000
            })
            return proposal;
        } catch (error) {
            console.log(error);
            // throw new HttpException(error, 400);
            throw new HttpException(error.message, 400);
        }
    }

    async reapply(body: UpdateProposalDto, user: { id: any; }, files: any) {
        /*
        create new refs
        get old refs
        update data
        delete old refs
        */
        try {
            const proposal = await this.prismaClient.$transaction(async (tx) => {

                const bucket = firebaseAdmin.storage().bucket("gs://jrpl-dev.appspot.com")
                let prevData = await tx.proposal.findFirst({
                    where:{
                        id: body.id
                    },
                })
                async function uploadFiles(file){
                    const file_name = `chandan_test/${uuid()}${files[file][0].originalname}`;
                    const file_ref = bucket.file(file_name)
                    await file_ref.save(files[file][0].buffer);
                    const file_url = await getDownloadURL(file_ref);
                    if(!file_url){
                        throw new Error("Error in file upload");
                    }
                    return {file_name, file_url}
                }

                async function copyFile(ref){
                    const old_ref = bucket.file(ref)
                    const new_file_name = `chandan_test/${uuid()}.${old_ref.name.split('.')[old_ref.name.split('.').length-1]}`
                    const new_ref = bucket.file(new_file_name)
                    await old_ref.copy(new_file_name)
                    const file_url = await getDownloadURL(new_ref);
                    if(!file_url){
                        throw new Error("Error in file upload");
                    }
                    return {file_name:new_file_name, file_url}
                }

                let updatedFiles:any = {};

                if (files.photo) {
                    let photo_loc = await uploadFiles("photo")
                    prevData["photo_path"] = photo_loc.file_url
                    prevData["photo_path_ref"] = photo_loc.file_name
                }else{
                    let photo_loc = await copyFile(prevData.photo_path_ref)
                    prevData["photo_path"] = photo_loc.file_url
                    prevData["photo_path_ref"] = photo_loc.file_name
                }

                if (files.income_proof) {
                    let income_loc = await uploadFiles("income_proof")
                    prevData["income_proof_path"] = income_loc.file_url
                    prevData["income_proof_path_ref"] = income_loc.file_name
                }else{
                    let income_loc = await copyFile(prevData.income_proof_path_ref)
                    prevData["income_proof_path"] = income_loc.file_url
                    prevData["income_proof_path_ref"] = income_loc.file_name
                }

                if (files.address_proof) {
                    let address_loc = await uploadFiles("address_proof")
                    prevData["address_proof_path"] = address_loc.file_url
                    prevData["address_proof_path_ref"] = address_loc.file_name
                }else{
                    let address_loc = await copyFile(prevData.address_proof_path_ref)
                    prevData["address_proof_path"] = address_loc.file_url
                    prevData["address_proof_path_ref"] = address_loc.file_name
                }

                for(const updatedField in body){
                    prevData[updatedField] = body[updatedField]
                    prevData["prevVersionId"] = body.id;
                }
                delete prevData.id;
                delete prevData.adminComment;
                delete prevData.rejectionReason;
                delete prevData.status;
                const proposal = tx.proposal.create({
                    data: prevData,
                })

                if (!proposal) {
                    if(updatedFiles.address_proof_path_ref){
                        await bucket.file(updatedFiles.address_proof_path_ref).delete()
                    }
                    if(updatedFiles.income_proof_path_ref){
                        await bucket.file(updatedFiles.income_proof_path_ref).delete()
                    }
                    if(updatedFiles.photo_path_ref){
                        await bucket.file(updatedFiles.photo_path_ref).delete()
                    }
                    throw new Error("Error in db insert");
                }
                return proposal;

            }, {
                timeout: 10000
            })
            return proposal;
        } catch (error) {
            console.log(error);
            // throw new HttpException(error, 400);
            throw new HttpException(error.message, 400);
        }
    }
}
