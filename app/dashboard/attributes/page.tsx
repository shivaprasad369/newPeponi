"use client"
import React, {  useState } from 'react'

import axios from 'axios'


import { useQuery } from '@tanstack/react-query'

import Head from 'next/head'
import CategoryTable from './category-table'
import toast,{ Toaster } from 'react-hot-toast'
export default function Attribute() {
   
   
    const [isCancel, setIsCancel] = useState(false)
 
    const {data:attributeD, isLoading:attributeLoading, isError:attributeError, refetch:attributeRefetch} = useQuery({
        queryKey:['attribute'],
        queryFn:async()=>{  
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attribute`)
                if(response.status === 200){
                    return response.data
                }
            } catch (error) {
                toast.error(error.response.data.message || 'Something went wrong!')
            }
        }
    })

  return (
    <>
    <Head>
        <title>Attribute</title>
      </Head>
    <div className={`w-[100%] h-[100%] flex justify-center items-center text-black`}>
        <Toaster/>
    <div className='w-[100%] p-2 flex flex-col gap-3 h-[100%]'>
        <div className='flex mt-2 justify-start px-4  gap-2 w-[100%] items-center'>
            <h1 className='text-4xl font-normal'>  Manage Attributes</h1>
        </div>
      
            {!attributeLoading && !isCancel &&
             <CategoryTable 
             setIsCancel={setIsCancel}
             data={attributeD} 
             isLoading={attributeLoading} 
             isError={attributeError}
             onEdit={async (ids) => {}}
             onDelete={async (ids) => {}}
             />  }    
    </div>
    </div>
    </>
  )
}
