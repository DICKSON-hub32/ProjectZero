import React from "react";
import { useDispatch } from "react-redux";
import { displaySideBar } from "../Slices/uiSlice";

function useRemoveSideBar(){
  const dispatch=useDispatch()
   const handleRemoveSideBar=(event)=>{
    if(event.target.id!=='sideBar'&& window.innerWidth<=1024){
      dispatch(displaySideBar(false))
    }
   }
   return handleRemoveSideBar;
}

export default useRemoveSideBar;