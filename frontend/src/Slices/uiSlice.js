import {createSlice, nanoid} from '@reduxjs/toolkit'
import { React } from 'react';

const uiSlice=createSlice({
    name:'ui',
    initialState:{
        input:false,
        isSettings:false,
        sideBar:false,
     
        socket:'',
        socketState:'',
        farmTable:[],
        locations:{
            country:'',
            county:'',
            sub_county:''
        },
        locationGraphData:'',

                
          
    },
    reducers:{
        displaySideBar:(state,action)=>{
            if(action.payload!==undefined){
                
                state.sideBar=action.payload
            }else{
                state.sideBar=!state.sideBar
                
            }
            if(state.sideBar===false){
                state.isSettings=false
           }

           
        },
        addFarmRow: (state, action) => {
    if (action.payload.Temperature !== undefined && action.payload.Humidity !== undefined) {
        state.farmTable.push({
            crop: action.payload.crop_name,
            description: action.payload.description,
            Temperature: action.payload.Temperature,
            Humidity: action.payload.Humidity,
            Moisture: action.payload.Moisture,
            Nitrogen: action.payload.Nitrogen,
            Phosporous: action.payload.Phosporous,
            Potassium: action.payload.Potassium,
            Irrigation_interval_perday: action.payload.No_of_irigation_per_day,
            Irrigation_interval_perweek: action.payload.No_of_irigation_per_week,
            Soil_pH: action.payload.Soil_pH,
            isChosen: action.payload.isChosen,
            id: action.payload.id,
            Altitude: action.payload.Altitude
        });
    } else {
        // Initialize farmTable as an empty array if data is missing
        state.farmTable = [];
    }
},



        updateSocket:(state,action)=>{
              state.socketState=action.payload
        },
        displaySettings:(state)=>{
            state.isSettings=!state.isSettings
            console.log(state.isSettings)

        },
        showInput:(state,action)=>{
            if(action.payload !== undefined){
            state.input=action.payload
            }else{
                state.input=!state.input
            }
        },
       
        setSocketState:(state,action)=>{
            state.socket=action.payload
        },
        updateChosenCrop:(state,action)=>{
                  const {id,isChosen}=action.payload

                  state.farmTable=state.farmTable.map(element=>
                    element.id===id?{...element,isChosen}:element
                  )
        },
        updateLocation:(state,action)=>{
            state.locations=action.payload
        },
        updateLocationGraphData:(state,action)=>{
            state.locationGraphData=action.payload
        }
        
       
    }
})

export const {displaySettings,displaySideBar,showInput,updateChosenCrop,updateLocationGraphData,updateLocation,setSocketState,updateSocket,addFarmRow}=uiSlice.actions
export default uiSlice.reducer