import React,{useEffect, useState} from "react";
import { updateImageUsername } from "../Slices/userSlice";
import { showInput, updateLocationGraphData } from "../Slices/uiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { displaySettings,updateLocation } from "../Slices/uiSlice";
import { api } from "../api";

export default function(){
    const input=useSelector((state)=>state.ui.input)
    const [sideBarData,updateData]=useState({username:''})
    const isSettings=useSelector((state)=>state.ui.isSettings)
    const setData=useSelector((state)=>state.user)
    const onloadLocation=useSelector((state)=>state.ui.locations)
    const [active,setActive]=useState('1')
    const [locations,setLocation]=useState({
        country:'',county:'',sub_county:''
    })
    const [edit,enableEdit]=useState(false)
    const dispatch=useDispatch()



    function handleLocation(e){
        setLocation({...locations,[e.target.id]:e.target.value})
    }

    function handleEdit(e){
        enableEdit(true)
    }
    async function saveChanges(e){
     const res=await api.post('locationData/',locations)
     dispatch(updateLocation(locations))
     enableEdit(false)
     dispatch(updateLocationGraphData(res.data))
     
        
    }

   function handleOverlay(){
        dispatch(displaySettings(false))
   }

    async function sendProfilePic(file) {
        try {
            const formdata=new FormData
            formdata.append('image',file)
            const result = await api.patch('api/user/media/',formdata);
            const img_url=result.data.image_url.slice(1)
            dispatch(updateImageUsername({img_url:img_url}))
            
        } catch (error) {
            console.log(error);
        }
    }

    function toggleInput(e){
        dispatch(showInput())
       }

    async function changeUserInfo(e) {
        if (e.target.id === 'pic') {
            const file = e.target.files[0];
            const file_reader = new FileReader();

            file_reader.onload = (event) => {
                const img_object = new Image();
             if(file!=''){
                img_object.onload = async () => {
                    await sendProfilePic(file);
                };
                img_object.src = event.target.result;
            }
            };
            file_reader.readAsDataURL(file);
        } else if (e.target.name === 'username') {
            updateData({'username':e.target.value});
        }
    }

    async function handleSubmit() {
        if (sideBarData.username !== '') {
            
            dispatch(updateImageUsername({username:sideBarData.username}))

            await api.patch(`api/user/update/`, { 'username': sideBarData.username });
        }
    }

    function handleInnerDiv (e) {
        e.stopPropagation();

    }
function handleBtn(e){
   setActive(e.target.id)
}

    return(
        
        <div onClick={handleOverlay} className={`${isSettings?'':'hidden'} h-full bg-opacity-80 flex flex-col justify-center items-center bg-slate-700  text-wrap fixed z-50 right-0 left-0 text-gray-900 text-lg font-semibold   w-[100%]`}>
            <div onClick={handleInnerDiv} className="md:w-[40rem] relative flex flex-row pt-6 px-3 gap-2 min-h-[10rem] max-w-[34rem] w-[80%] h-[60%] rounded-[.3rem] bg-[#e2e0d6]">
            <div className="sb text-black">
            <button id='1' className={`${active!='1'&&'bg-transparent'} `} onClick={handleBtn}>Edit profile</button>
                <button id='2' className={`${active!='2'&&'bg-transparent'}`} onClick={handleBtn}>Location</button>
                <button id='3' className={`${active!='3'&&'bg-transparent'}`} onClick={handleBtn}>User data</button>
            </div>
           {active==='1'&& <div className="y flex flex-col top-2  right-0">
              <div className="flex flex-col items-center gap-2">

                <input type="file" id="pic" className="hidden" onChange={changeUserInfo} />
                 <div className=" flex justify-center items-center">
                <img  src={import.meta.env.VITE_API_URL+ setData.profile_pic} alt="profile " className="w-[30%] h-[30%px] rounded-[50%] " />
                 </div>
                 <label htmlFor="pic" className="   cursor-pointer  hover:bg-[#FFFDF6] rounded-md px-2" name="profile_pic">Change_profile_pic..</label>
                 </div>

                 <div className="flex flex-col items-center">
                    <label onClick={toggleInput} className="   hover:bg-[#FFFDF6] rounded-md px-2 cursor-pointer" name="username">Change_Username<i className={`fa fa-caret-down ${input ? '': 'rotate-180' } ml-3`} aria-hidden="true"></i></label>
                    <div className=" flex  items-center my-2 justify-center flex-col sm:flex-row">
                    <input value={sideBarData.username} type="text" onChange={changeUserInfo} name="username" placeholder="Enter New Username" className={`outline-indigo-200 text-slate-900 px-1 ${!input && 'hidden'}`} />
                    <button onClick={handleSubmit} className={`bg-slate-900 mt-2 w-[4rem] self-center rounded-md text-center px-[2px] ml-2 py-[1px] ${!input && 'hidden'}`}>Submit</button>
                    </div>
                    <div className=" cursor-pointer   hover:bg-[#FFFDF6] rounded-md " name="darkmode">LightMode <i class="fa-solid fa-star-and-crescent text-sm"></i></div>
                    </div>
            </div>}
            {active==='2'&&<div className="flex flex-col items-start min-w-[9rem] gap-3 w-[100%]">
                <div className="Locations px-4  bg-white pt-2 h-[97%] rounded-md w-[100%] max-w-96">
                    <div className="  flex flex-row justify-between">
                        <span>Location</span>
                        {edit===false?<button onClick={handleEdit} className="text-black bg-red-400 text-sm outline-none mb-3 focus:outline-none ">Edit</button>:
                        <button onClick={saveChanges} className="text-black bg-green-400 text-sm mb-3 border-none focus:outline-none">Save Changes</button>
                        }
                    </div>
                    <div className="fx flex w-full flex-row gap-1 justify-between">
                    <label htmlFor="Country">Country :</label>
                        <input list="Country" readOnly={!edit&&true}  id="country"  value={edit?locations.country:onloadLocation.country} onChange={handleLocation} className="border-2"/>
                        <datalist id="Country">
                        <option value="Kenya">Kenya</option>                       
                        </datalist>
                    </div>
                    <div className="fx flex w-full flex-row justify-between gap-1 bg-white">
                    <label htmlFor="County">County :</label>
                        <input list="County" id="county" readOnly={!edit && locations.country===''} value={edit?locations.county:onloadLocation.county} onChange={handleLocation} className={`border-2`}/>
                        <datalist id="County">
                       {locations.country==='Kenya'&&<><option value="Nairobi">Nairobi</option>
                        <option value="Machakos">Machakos</option></>}
                        </datalist>
                    </div>
                    <div className="fx flex w-full flex-row gap-1 justify-between bg-white">
                    <label htmlFor="Sub-county">Sub-County :</label>
                        <input list="Sub-county" readOnly={!edit && locations.county===''}  id="sub_county" value={edit?locations.sub_county:onloadLocation.sub_county} onChange={handleLocation} className={` border-2`}/>
                        <datalist id="Sub-county">

                        {locations.county==='Nairobi'&&<><option value="Westlands">Westlands</option>,
                        <option value="Kibra">Kibra</option></>}

                        {locations.county==='Machakos'&&<><option value="Kathiani"></option>
                        <option value="Kangundo"></option></>}
                        </datalist>
                    </div>
                    <div className="w-full flex justify-center items-center">
                        <button className={`mt-2 text-black  bg-red-400 ${!edit&&'hidden'} focus:outline-none border-none text-sm`} onClick={()=>{enableEdit(false);setLocation({
        country:'',county:'',sub_county:''
    })}}>Discard Changes</button>
                    </div>

                </div>

             </div>}
            </div>
        </div>
    )
}