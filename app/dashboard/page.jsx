import AddNewInterview from "./_components/AddNewInterview"
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import InterviewList from "./_components/InterviewList"

function Dashboard() { 
  return (
    <div className='p-10'>
      
      <h2 className='font-bold text-2xl'>Dashboard</h2>
      <h2 className='text-gray-500'>Create and start Ai mockup interview</h2>

      <div className='grid grid-cols-1 and md:grid-cols-3 my-5'>
        <AddNewInterview/>
      </div>

      {/*previous Interview List*/}
      <InterviewList/>
    </div>
  )
}

export default Dashboard
