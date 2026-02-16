import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../component/Footer/Footer'
import Navbar from '../component/Navbar/Navbar'
function Root() {
  return (
<>
<Navbar/>
<Outlet/>
<Footer/>
</>  )
}

export default Root