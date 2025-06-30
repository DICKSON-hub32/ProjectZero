import React,{ useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { displaySettings,showInput,displaySideBar } from "../Slices/uiSlice";

export default function NavBar(){
  const setData=useSelector((state)=>state.user)
  const sideBar=useSelector((state)=>state.ui.sideBar)
  const dispatch = useDispatch();

  function handleSideBar(){
    dispatch(displaySideBar())
    console.log(sideBar)
    
}

  function checkScreenSize(){
    const width = window.innerWidth;
    if(width>=1024){
      dispatch(displaySideBar(true))
    }else if (width<=1024) {
      dispatch(displaySideBar(false))

    }
    
  }
  
  function debounce(func,wait){
    let timeout;
    return function(...args){
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(()=>func.apply(context,args),wait)
    }
  }
  const debouncedCheckScreenSize = debounce(() => {
    requestAnimationFrame(checkScreenSize);
}, 200);

 useEffect(()=>{
  window.addEventListener('resize', debouncedCheckScreenSize);
  checkScreenSize()
 },[])
  


   return( <div   className=" ml-[2px] flex items-center justify-between px-4 py-2 bg-gray-800 h-14 sticky top-0 z-10">
        <div>
            <img src={import.meta.env.VITE_API_URL+ setData.profile_pic} alt="profile " className="w-[45px] h-[45px] rounded-[50%]" />
        </div>
        <div>

            <p className="text-green-600 text-xl">{setData.username}</p>
        </div>
        <div onClick={handleSideBar} className={`lg:hidden `}>
        {sideBar?(<i className="fa-lg fa-solid fa-xmark cursor-pointer "></i>):(<i className={` fa-lg fa-solid fa-bars cursor-pointer `}></i>)}
        </div>
    </div>
   )
}