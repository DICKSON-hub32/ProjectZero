import React from "react";
import useRemoveSideBar from "./RemoveSidebar";
import { useSelector } from "react-redux";

export default function RealTimeDisplay(){
const setData=useSelector((state)=>state.user)
const socket=useSelector((state)=>state.ui.socketState)
const onClick=useRemoveSideBar()
console.log(setData.Temperature,setData.Potassium,'my set data data')
    return(
        <div onClick={onClick} className="flex items-center text-black text-lg font-semibold sticky overflow-y-auto top-16 z-10 gap-7 bg-white p-3 ">
           {socket===false&&<span className="fixed z-10 text-red-500 top-1"><i className="fa fa-times-circle pr-2" aria-hidden="true"> </i>
              {/* Failed to establish WebSocket. */}
            </span>}
        <div className="flex-1 bg- max-w-[17rem] flex flex-col items-center justify-center">
            <svg className="circular-svg " viewBox="0 0 36 36">
        <path className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path className="circle" id="circle"
              strokeDasharray={`${setData.Temperature},100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="20.35" className="percentage" id="percentage-text">{setData.Temperature}℃</text>
        
    </svg>
    <span>Temperature</span>
    </div>
    <div className="flex-1 bg- max-w-[17rem] flex flex-col items-center justify-center">
    <svg className="circular-svg" viewBox="0 0 36 36">
        <path className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path className="circle" id="circle"
              strokeDasharray={`${setData.Moisture},100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="20.35" className="percentage" id="percentage-text">{setData.Moisture}%</text>
    </svg>
    <span>Moisture</span>
    </div>
    <div className="flex-1 bg- max-w-[17rem] flex flex-col items-center justify-center">
    <svg className="circular-svg" viewBox="0 0 36 36">
        <path className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path className="circle" id="circle"
              strokeDasharray={`${setData.Humidity},100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="20.35" className="percentage" id="percentage-text">{setData.Humidity}%</text>
    </svg>
    <span>Humidity</span>
    </div>
    <div className="flex-1 bg- text-sm max-w-[17rem] flex flex-col items-center justify-center">
    <svg className="circular-svg" viewBox="0 0 36 36">
        <path className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path className="circle" id="circle"
              strokeDasharray={`${setData.Nitrogen},100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="20.35" className="percentage" id="percentage-text">{setData.Nitrogen}g/Kg</text>
    </svg>
    <span>Nitrogen</span>
    </div>    <div className="flex-1 text-sm bg- max-w-[17rem] flex flex-col items-center justify-center">
    <svg className="circular-svg" viewBox="0 0 36 36">
        <path className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path className="circle" id="circle"
              strokeDasharray={`${setData.Phosporous},100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="20.35" className="percentage" id="percentage-text">{setData.Phosporous}g/kg</text>
    </svg>
    <span>Phosporous</span>
    </div> <div className="flex-1 text-sm bg- max-w-[17rem] flex flex-col items-center justify-center">
    <svg className="circular-svg" viewBox="0 0 36 36">
        <path className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path className="circle" id="circle"
              strokeDasharray={`${setData.Potassium},100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="20.35" className="percentage" id="percentage-text">{setData.Potassium}g/kg</text>
    </svg>
    <span>Potassium</span>
    </div>
        </div>
    )
}