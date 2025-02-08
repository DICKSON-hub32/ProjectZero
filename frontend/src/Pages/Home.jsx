import React from "react";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import Graph from "../Components/Graph";
import RealTimeDisplay from "../Components/RealTimeDisplay";
import useOnStartData from "../Components/OnStartData";
import {useSelector,useDispatch} from 'react-redux'
import useSocketComponent from "../Components/Websocket";
import MessageInput from "../Components/MessageInput";
import Settings from "../Components/Settings";

export default function Home(){
    
    const socket=useSelector((state)=>state.ui.socket)
    useSocketComponent()
    const isFetching=useOnStartData()
    
     if(isFetching){
        return <div className="self-center h-screen flex items-center justify-center "><div class="fa-3x">  <i class="fa-solid fa-circle-notch fa-spin "></i>
        </div></div>
        
     }

    return(
        
        <div className="flex flex-row lg:h-screen ">
        <SideBar/>  
       <div className="overflow-y-auto flex-1  h-screen">
       <NavBar  />
       {socket===true?<RealTimeDisplay />:  <div className="fa-3x flex items-center justify-center"><i className="fas fa-spinner fa-spin mt-3"></i></div>}
       <Graph />

       </div>
       <Settings/>

       </div>
        
    )
}