import { createSlice, nanoid } from "@reduxjs/toolkit";

const aiMessages=createSlice({
    name:'aiMessage',
    initialState:{
        requests:[
          
        ]           
    },
    reducers:{
        addRequestResponse:(state,action)=>{
            state.requests.push(
                {
                    id:nanoid(),
                    request:action.payload.request,
                    response:[action.payload.response]
                }
                
            )
            console.log(state.requests.slice(-1),'hebhhb')
        },

        addResponse:(state,action)=>{
            pass
        },
        addAiMessages:(state,action)=>{
            state.requests.push(action.payload)
            console.log(state.requests)
        }
    }
})

export const {addRequestResponse,addResponse} = aiMessages.actions
export default aiMessages.reducer