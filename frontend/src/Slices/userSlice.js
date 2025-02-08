import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({

name:'user',
initialState:{
    username:'',
    profile_pic: '',
    Temperature: 0,
    Humidity: 0,
    Moisture: 0,
    Nitrogen:0,
    Phosporous:0,
    Potassium:0,
    dark_mode:null,
    profile_pic:''

  },
  reducers: {
    updateData: (state, action) => {
      state.username = action.payload.user.username,
      state.profile_pic = action.payload.image===null?'':action.payload.image.image_url.slice(1),
      state.Temperature = action.payload.realTimeData===null?0:action.payload.realTimeData.Temperature,
      state.Humidity = action.payload.realTimeData===null?0:action.payload.realTimeData.Humidity,
      state.Moisture = action.payload.realTimeData===null?0:action.payload.realTimeData.Moisture;
      state.Nitrogen = action.payload.realTimeData===null?0:action.payload.realTimeData.Nitrogen,
      state.Phosporous = action.payload.realTimeData===null?0:action.payload.realTimeData.Phosporous,
      state.Potassium = action.payload.realTimeData===null?0:action.payload.realTimeData.Potassium;
    },
    updateSocketData:(state,action)=>{
      state.Temperature=action.payload.Temperature,
      state.Humidity=action.payload.Humidity,
      state.Moisture=action.payload.Moisture
    },
    updateImageUsername:(state,action)=>{
      state.username=action.payload ?. username ?? state.username
      state.profile_pic=action.payload ?. img_url ?? state.profile_pic
    }
    
  }
})

export const {updateData,updateSocketData,updateImageUsername}=userSlice.actions
export default userSlice.reducer