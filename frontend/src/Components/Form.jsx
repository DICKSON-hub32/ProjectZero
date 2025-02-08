import React,{useEffect,useState} from "react"
import { REFRESH_TOKEN,ACCESS_TOKEN } from "../Constants"
import {Navigate,useNavigate} from 'react-router-dom'
import { api } from "../api"



export default function Form({method,route}){
    const navigate=useNavigate()
    const [loading,setLoading]=useState(false)
    const [data,setdata]=useState(
        {
            'username':'','email':'','password':'','submited':false
        }
    )

    function handleChange(e){
       const {name,value}=e.target
    setdata(prev=>{
        return {
            ...prev,[name]:value
        }
    })

    }
    
    async function handleSubmit(e){
      e.preventDefault()
      if(method==='login'){
        try{
         setdata(prev=>({...prev,'submited':true}))
         const res=await api.post(route,{username:data.username,password:data.password})
         localStorage.setItem(REFRESH_TOKEN,res.data.refresh)
         localStorage.setItem(ACCESS_TOKEN,res.data.access)
         setdata(prev=>({...prev,'submited':false}))
         navigate('/')
        }catch(error){
         setdata(prev=>({...prev,'submited':false}))
         console.log(error)
        }
    }
      else if (method === "register") {
        // Handle registration logic
     try{
        const res = await api.post(route, {
          username: data.username,
          email: data.email,
          password: data.password
        });
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      }
     catch(error){
      console.log(error);
    }
  }

    }

    return(
      <div  className="h-screen w-screen flex items-center justify-center bg-[url('https://wallpaperaccess.com/full/1598224.jpg')] bg-cover bg-center ">
        <form className="flex flex-col items-center justify-center bg-orange-600 gap-2 p-[2rem] flex-1 min-w-[rem] max-w-[25rem] rounded-lg mt-[2rem] ml-[2rem] bg-opacity-50" onSubmit={handleSubmit}>
            <input required className="border h-10 px-2  font-semibold bg-slate-300 p-[3px] rounded-md outline-0 w-[80%]" type="text"  name='username' placeholder="Username"  onChange={handleChange} value={data.username}/>
            {method==='register'&&<input required  className="border h-10 px-2  bg-slate-300 p-[3px] rounded-md outline-0 w-[80%]" type="email" name='email' placeholder="email" onChange={handleChange} value={data.email}/>}
            <input required className='border h-10 px-2  bg-slate-300 p-[3px] ro<i class="fa-solid fa-cog fa-spin"></i>unded-md outline-0 w-[80%]' type="password" name="password" placeholder="Password" onChange={handleChange} value={data.password}/>
            {data.submited?<div className="fa-3x loading-spinner"><i class="fas fa-spinner fa-spin font-[0]"></i></div>
            :<button type="submit" className="border-blue-300 border bg-slate-300 w-[6rem] h-[2rem] text-black rounded-md hover:bg-green-300 font-semibold">{method==='register'?'Sign_up':'Login'}</button>}
            <div className=" px-2  font-semibold text-slate-900 self-center flex flex-col items-center bg-slate-300 rounded-md"><span >{method==='register'?'Already have an account ':'Create acount ' }<i className="fa-solid fa-user"></i> ?</span> <span className="hover:cursor-pointer "><span >{method==='register'?'Login ':'Sign-Up '}</span>
             <i  onClick={()=>method==='register'?navigate('/login'):navigate('/register')} className="fa fa-sign-in hover:text-green-500 font-bold text-xl" aria-hidden="true"></i></span></div>

        </form>
        </div>
    )
}