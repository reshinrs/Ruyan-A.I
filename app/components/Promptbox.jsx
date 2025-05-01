import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
const Promptbox = ({ setIsloading, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const handlekeydown=(e)=>{
    if(e.key==="Enter" && !e.shiftKey){
      e.preventDefault();
      sendPrompt(e);
    }
  }
  const {user,chats,setChats,selectChat,setSelectChat,
    }=useAppContext();
    const sendPrompt=async(e)=>{
      const promptCopy=prompt;
      try{
        e.preventDefault();
        if(!user) return toast.error('Login To Send Message');
        if(isLoading)return toast.error('Wait For The Previous Prompt Response');
          setIsloading(true)
          setPrompt("")
          const userPrompt={
            role:"user",
            content:prompt,
            timeStamp:Date.now(),
          }
          //saving user prompt in chats array
          setChats((prevChats)=>prevChats.map((chat)=>chats._id===selectChat._id?{
            ...chat,
            messages:[...chat.messages,userPrompt]
          }:chat
        ))
        //saving user prompt in chats
        setSelectChat((prev)=>({
          ...prev,
          messages:[...prev.messages,userPrompt]
          
        }))

        const {data}=await axios.post('/api/chat/ai',{
          chatId:selectChat._id,
          prompt
        })
        if(data.success){
          setChats((prevChats)=>prevChats.map((chat)=>chat._id===selectChat._id?{...chat,messages:[...chat.messages,data.data]}:chat))

          const message=data.data.content;
          const messageTokens= message.split(" ");
          let assistantMessage={
            role:'assistant',
            content:"",
            timeStamp:Date.now(),
          }
          setSelectChat((prev)=>({
            ...prev,
            messages:[...prev.messages,assistantMessage],
          }))
          for(let i=0;i<messageTokens;i++){
            setTimeout(()=>{
              assistantMessage.content=messageTokens.slice(0,i+1).join(" ");
              setSelectChat((prev)=>{
                const updatedMessages=[...prev.messages.slice(0,-1),assistantMessage]
                return{...prev, messages:updatedMessages}
              })
            },i*100)
          }
        }
        else{
          toast.error(data.message);
          setPrompt(promptCopy);
        }
        
      }
      
      catch(error){
        toast.error(error.message);  // untouched because it's dynamic
        setPrompt(promptCopy);
      }
      finally{
        setIsloading(false);
      }
    }
  return (
    <form onSubmit={sendPrompt}
      className={`w-full ${
        false ? "max-w3xl " : "max-w-2xl"
      } bg-[#0057a3] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea onKeyDown={handlekeydown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent  "
        rows={2}
        placeholder="Communicate with Ruyan"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 ">
          <p className="flex items-center gap2 text-xs border border-gray-300/40 px2 py2 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            Analyse
          </p>
          <p className="flex items-center gap2 text-xs border border-gray-300/40 px2 py2 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            className={`${
              prompt ? "bg-red-400 " : "bg-[#000000]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default Promptbox;
