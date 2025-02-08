import React, { useState } from "react";
import { api } from "../api";
import { Navigate,useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../Constants";
import { updateImageUsername} from "../Slices/userSlice";
import { useDispatch,useSelector } from "react-redux";
import { displaySettings,showInput  } from "../Slices/uiSlice";
import Settings from "./Settings";

export default function SideBar() {
     const navigate=useNavigate()
     const sideBar=useSelector((state)=>state.ui.sideBar)
     const isSettings=useSelector((state)=>state.ui.isSettings)

     const dispatch=useDispatch()
     function handleLogout(){
        localStorage.clear(ACCESS_TOKEN)
        localStorage.clear(REFRESH_TOKEN)
        navigate('/login')
     }
   

    function handleSettings(){
        dispatch(displaySettings())
     }
     
    


    return (
        
        <div  className={`text-md font-semibold fixed border-none lg:relative bg-[#ECE8D9] lg:top-0 lg:z-0  h-screen w-[20%] top-16 ${!sideBar ? 'translate-x-[-105%]' : 'translate-x-0'} transition-all duration-[0.3s] flex flex-col  pl-2 z-20`}>
            <div onClick={()=>{navigate('/chat_ai')}} className="pt-2 mt-2 px-2 py-3 cursor-pointer  hover:bg-[#FAF6E9] rounded-md">
                <span >AgriBot</span>
            </div>
            <div onClick={()=>{navigate('/automation')}} className="pt-2 mt-2 px-2 py-3 cursor-pointer  hover:bg-[#FAF6E9] rounded-md">
                <span >Automate</span>
            </div>

            <div className="cursor-pointer py-3 hover:bg-[#FAF6E9] rounded-md px-2">
                <span>Users</span>
            </div>

            <div>
                <span onClick={handleSettings} className="flex justify-between pr-3 duration-slow cursor-pointer lg:sticky lg:top-0 hover:bg-[#FAF6E9] py-3 rounded-md px-2">Settings </span>
            </div>
            <div onClick={()=>{navigate('/')}} className="cursor-pointer py-3 hover:bg-[#FAF6E9] rounded-md px-2">
            <span >Home</span>
            </div>
            <div className="cursor-pointer  py-3 hover:bg-[#FAF6E9] rounded-md px-2" >
                <span>Logout <i onClick={handleLogout} className="fa fa-sign-out text-sm text-rose-600" aria-hidden="true"></i>
               </span>
            </div>
        </div>
    );
}
