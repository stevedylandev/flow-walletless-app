// pages/api/users/index.ts

import { User } from "@prisma/client";
import { BaseNextRequest, BaseNextResponse } from "next/dist/server/base-http";
import prisma from "../../../lib/prisma";

export default async function handle(
 req: BaseNextRequest,
 res: BaseNextResponse
) {
 const userEmail = JSON.parse(req.body).email;
 const userName = JSON.parse(req.body).name;

 try {
   const user = await prisma.user.findFirst({
     where: {
       email: userEmail,
     },
   });

   if (user == null) {
     await prisma.user.create({
       data: {
         email: userEmail,
         name: userName,
         flowWalletAddress: null,
         flowWalletJobId: null,
       },
     });
   } else {
     await checkWallet(user);
   }
 } catch (e) {
   console.log(e);
 }
}

const checkWallet = async (user: User) => {
 const jobId = user.flowWalletJobId;
 const address = user.flowWalletAddress;

 if (address != null) {
   return;
 }

 if (jobId != null) {
   const request: any = await fetch(`http://localhost:3000/v1/jobs/${jobId}`, {
     method: "GET",
   });

   const jsonData = await request.json();

   if (jsonData.state === "COMPLETE") {
     const address = await jsonData.result;
     await prisma.user.update({
       where: {
         id: user.id,
       },
       data: {
         flowWalletAddress: address,
       },
     });
     return;
   }

   if (request.data.state === "FAILED") {
     const request: any = await fetch("http://localhost:3000/v1/accounts", {
       method: "POST",
     });
     const jsonData = await request.json();
     await prisma.user.update({
       where: {
         id: user.id,
       },
       data: {
         flowWalletJobId: jsonData.jobId,
       },
     });
     return;
   }
 }

 if (jobId == null) {
   const request: any = await fetch("http://localhost:3000/v1/accounts", {
     method: "POST",
   });
   const jsonData = await request.json();
   await prisma.user.update({
     where: {
       id: user.id,
     },
     data: {
       flowWalletJobId: jsonData.jobId,
     },
   });
   return;
 }
};
