import React, { useEffect } from "react";
import { api } from "../api";
import { useDispatch } from "react-redux";
import { addRequestResponse } from "../Slices/aiMessagesSlice";


export default async function useGetAiMessages(){
  const dispatch=useDispatch()
  try{
    const messages=await api.get('aiMessages/')
    console.log('my overal ai mesages',messages.data)
    messages.data.forEach(element => {
      dispatch(
        addRequestResponse({request:element.request,response:element.response,
    })) 
    });
    
  }catch(error){
    console.error(error)
   
  }

}