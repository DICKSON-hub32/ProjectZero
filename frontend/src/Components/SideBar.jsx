import React, { useState } from "react";
import { api } from "../api";
import { Navigate,useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../Constants";
import { updateImageUsername} from "../Slices/userSlice";
import { useDispatch,useSelector } from "react-redux";
import { displaySettings,showInput  } from "../Slices/uiSlice";
import Settings from "./Settings";
import { useLocation } from "react-router-dom";

export default function SideBar() {
     const navigate=useNavigate()
     const location = useLocation()
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
     
     // Function to check if current path matches the menu item
     const isActiveRoute = (path) => {
        return location.pathname === path
     }

    return (
        <div className={`text-md font-semibold fixed border-none lg:relative bg-gray-800 lg:top-0 lg:z-0 h-screen w-[20%] top-16 ${!sideBar ? 'translate-x-[-105%]' : 'translate-x-0'} transition-all duration-[0.3s] flex flex-col pl-2 z-20`}>
            
            {/* AgriTech Header */}
            <div className="pt-4 pb-6 px-2 border-b border-gray-600">
                <h2 className="text-xl font-bold text-white">AgriTech</h2>
            </div>

            {/* Navigation Items */}
            <div onClick={()=>{navigate('/chat_ai')}} className={`pt-2 mt-2 px-2 mr-2 py-3 cursor-pointer rounded-md transition-colors duration-200 ${
                isActiveRoute('/chat_ai') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white hover:bg-gray-700'
            }`}>
                <span>AgriBot</span>
            </div>
            
            <div onClick={()=>{navigate('/automation')}} className={`pt-2 mt-2 px-2 py-3 mr-2 cursor-pointer rounded-md transition-colors duration-200 ${
                isActiveRoute('/automation') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white hover:bg-gray-700'
            }`}>
                <span>Automate</span>
            </div>

            <div className="cursor-pointer py-3 hover:bg-gray-700 rounded-md px-2 mr-2 text-white transition-colors duration-200">
                <span>Users</span>
            </div>

            <div>
                <span onClick={handleSettings} className={`flex justify-between pr-3 mr-2 cursor-pointer lg:sticky lg:top-0 py-3 rounded-md px-2 transition-colors duration-200 ${
                    isSettings 
                        ? 'bg-blue-600 text-white' 
                        : 'text-white hover:bg-gray-700'
                }`}>
                    Settings
                </span>
            </div>
            
            <div onClick={()=>{navigate('/')}} className={`cursor-pointer py-3 mr-2 rounded-md px-2 transition-colors duration-200 ${
                isActiveRoute('/') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white hover:bg-gray-700'
            }`}>
                <span>Home</span>
            </div>
            
            {/* Spacer to push logout to bottom */}
            <div className="flex-grow"></div>
            
            <div className="cursor-pointer py-2 bg-red-500 rounded-md px-2 text-white transition-colors duration-200 mb-4 mr-2">
                <span className="">Logout 
                    <i onClick={handleLogout} className="fa fa-sign-out text-sm  ml-2  text-white" aria-hidden="true"></i>
                </span>
            </div>
        </div>
    );
}