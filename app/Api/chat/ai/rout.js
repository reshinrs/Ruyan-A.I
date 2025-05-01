export const maxDuration=60;

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import connectDB from "../../../config/db";
import  Chat from "@/models/chat";


//initialize openai client with deepseek api key and base url
const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY
});

export async function POST(params) {
    try {
        const {userID}=getAuth(req)

        //extract chatid and rpompt from the request body
        const{chatId ,prompt}=await req.json();
        if(!useId){
            return NextResponse.json({
                success:false,
                message:"User not authenticated",
            });
        }

        //find the chat document in the databae on userid and chatid
        await connectDB();
        const data =await Chat.findOne({userID,_id:chatId})

        //Create a use message objext
        const userPrompt={
            role:"user",
            content:prompt,
            timeStamp:DataTransfer.now()
        }
        data.message.push(userPrompt)

        //call the deeepseek api for chat completion
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "RUYAN-chat",store:true,
          });
          const message=completion.choices[0].message;
          message.timeStamp=Date.now()
          data.message.push(message);
          data.save();
          return NextResponse.json({success:true,data:message})
    } catch (error) {
        return NextResponse.json({success:false,error:error.message});
    }
    
}
