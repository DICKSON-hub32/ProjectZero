import React, { useState, useEffect } from "react";
import { ACCESS_TOKEN } from "../Constants";
import { json } from "react-router-dom";
import { setSocketState,updateSocket } from "../Slices/uiSlice";
import { useSelector,useDispatch } from "react-redux";
import { updateSocketData } from "../Slices/userSlice";


export default function useSocketComponent() {
    const dispatch=useDispatch()
    const socket=useSelector((state)=>state.ui.socket)
    useEffect(() => {
        if(socket!==true){
        const access=localStorage.getItem(ACCESS_TOKEN)
        const ws = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}ws/data/?access=${access}`);

        ws.onopen = function (e) {
            console.log("WebSocket established successfully");
            dispatch(setSocketState(true));
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log('message from the websocket = ',data)
            const real_data=data.message.data;
            dispatch(updateSocket(real_data))

        };

        ws.onerror = (e) => {
            console.error("WebSocket error:", e);
        };

        ws.onclose = (e) => {
            console.log("WebSocket closed:", e);
            setTimeout(()=>{
                dispatch(setSocketState(true)),
                dispatch(updateSocket(false))
                },4000)
        };



        // Cleanup function to close the WebSocket connection when the component unmounts
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }}, []);

   
return
    
}
