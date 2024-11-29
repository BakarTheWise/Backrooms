'use client'
import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import { Bell } from 'lucide-react'
import React from 'react'

const UserPanel = () => {
    const {user} = useUser()
  return (
    <>
        

        <div className="flex justify-between items-center gap-5">
          <div className="hidden md:flex justify-between items-center gap-5">
        
            <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
            <div className="flex items-center gap-3 cursor-pointer">
            <SignedIn>
                <UserButton afterSignOutUrl="/sign-in" />
            </SignedIn>
        <span className='text-white text-[23px] font-bold'>{user?.username}</span>
            </div>
          </div>
        </div>
    </>
  )
}

export default UserPanel