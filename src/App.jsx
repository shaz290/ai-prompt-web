import { useState } from 'react'
import reactLogo from './assets/react.svg';
import { Navbar } from './layout/Navbar';
import { Hero } from "@/sections/Hero"
import { About } from './sections/About';
import { MyDetails } from './sections/MyDetails';
import { Contact } from './sections/Contact';


function App() {


  return (
    <div className='mih-h-screen overflow-x-hidden'>
      <Navbar />
      <main>
        <Hero />
        <About/>
        <MyDetails/>
        <Contact/>
      </main>
    </div>
  )
}

export default App
