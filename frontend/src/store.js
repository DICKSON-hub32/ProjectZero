import { configureStore } from "@reduxjs/toolkit"
import uiReducer from './Slices/uiSlice'
import userReducer from './Slices/userSlice'
import aiMessagesReducer from './Slices/aiMessagesSlice'


const store = configureStore({
    reducer: {
        ui: uiReducer,
        user: userReducer,
        aiMessages:aiMessagesReducer
    }
})

export default store