import { useState } from 'react'
import Register from './Pages/Register'
import Login from './Pages/Login'
import Home from './Pages/Home'
import Form from './Components/Form'
import {Navigate,Routes,Route,BrowserRouter} from 'react-router-dom'
import ProtectedRoute from './Components/ProtectedRoute'
import NotFound from './Components/NotFound'
import ChatAi from './Pages/ChatAi'
import Automation from './Pages/Automation'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='*' element={<NotFound/>} >
        </Route>
        <Route element={<ProtectedRoute/>}>
           <Route path='/' element={<Home/>} exact/>
        </Route>
        <Route path="/login" element={<Login route='api/token/' method='login'/>} />
        <Route path="/register" element={<Register route='register/' method='register'/>} />
        <Route element={<ProtectedRoute/>}>
        <Route path='/chat_ai' element={<ChatAi/>} exact/>
        </Route>,
        <Route element={<ProtectedRoute/>}>
        <Route path='/automation' element={<Automation/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
//<Route path="/" element={<Home />} />
