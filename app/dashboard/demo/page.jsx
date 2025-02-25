"use client"
import React, { useEffect, useState } from 'react'
import { FaSitemap } from 'react-icons/fa'
import { MdCategory } from 'react-icons/md'
import useGetCategory from '../attributes/useGetCategory'
import { IoIosAddCircle } from 'react-icons/io'
import { HiMinusCircle } from 'react-icons/hi'
import AttributeUi from './AttributeUi'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import Attributetabel from './Attributetabel'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import NewAttributes from './NewAttributes'
import Head from 'next/head'
import CategoryTable from '../attributes/category-table'
export default function Attribute() {
    const {category, loading, error, getCategory} = useGetCategory()
    const {category:subCategory, loading:subCategoryLoading, error:subCategoryError, getCategory:getSubCategory} = useGetCategory()
    const {category:subCategoryLv2, loading:subCategoryLv2Loading, error:subCategoryLv2Error, getCategory:getSubCategoryLv2} = useGetCategory()
    const [categoryId, setCategoryId] = useState(null)
    const [subCategoryId, setSubCategoryId] = useState(null)
    const [subCategoryLv2Id, setSubCategoryLv2Id] = useState(null)
    const [attributeData, setAttributeData] = useState([])
    const [attributeCount, setAttributeCount] = useState(1)
    const [isEdit, setIsEdit] = useState(false)
    const queryClient = useQueryClient()    
    const [isCancel, setIsCancel] = useState(false)
    const [attributes, setAttributes] = useState([{ attributeName: "", value: [''] }]);
    const [number, setNumber] = useState([1])
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

    useEffect(() => {
        getCategory()
    }, [])
    useEffect(() => {
        if(categoryId){
            getSubCategory(categoryId)
        }
    }, [categoryId])
    useEffect(() => {
        if(subCategoryId){
            getSubCategoryLv2(subCategoryId)
        }
    }, [subCategoryId])
    const handleNewAddAttribute = () => {
        setAttributeCount((prev) => prev + 1)
        setNumber((prev) => [...prev, Number(attributeCount) + 1])
        const newAttributes = [...attributes];
        newAttributes.push({ attributeName: "", value: [''] });
        setAttributes(newAttributes);

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const Attributes = Object.values(attributes).map((item) => ({
          attributeName: item.attributeName,
          values: item.value,
        }));
        try {
          if (categoryId && subCategoryId ) {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attribute`,
                {   Attributes ,
                categoryId,
                subCategoryId
            });
            if (response.status === 200) {
              toast.success(response.data.message);
              queryClient.invalidateQueries({queryKey:['attribute']})
              setAttributeData([])
              setAttributes([{ attributeName: "", value: [''] }]);
              setAttributeCount(1) 
              setCategoryId('')
              setIsCancel(false)
              setSubCategoryId('')
              setSubCategoryLv2Id('')
           setNumber([0])
            }
          } else {
            toast.error('Please select all the fields'); 
          }
        } catch (error) {
          if (error.response) {
            toast.error(error.response.data.message || 'Something went wrong!');
          } else {
            toast.error('An unexpected error occurred. Please try again later.');
          }
        }
      };
    const handleReset = () => {
        setAttributeData([])
        setAttributeCount(1) 
        setCategoryId('')
        setSubCategoryId('')
        setSubCategoryLv2Id('')
        setNumber([0])
    }
    const handleEdit=(value)=>{
       
        setIsCancel(true)
        window.scrollTo(0, 0);
        setCategoryId(value.CategoryID)
        setSubCategoryId(value.subcategory)
        // setSubCategoryLv2Id(value.subcategorytwo)
        setAttributeData(value.attributes)
        setAttributeCount(value.attributes.length)
        setNumber(value.attributes.map((item) => item.attribute_id))
        setIsEdit(true)
      }
      const handleEditSubmit = async (e) => {
        e.preventDefault();
        const Attributes = Object.values(attributeData).map((item) => ({
            attributeName: item.attributeName,
            attributeId: item.attribute_id,
            values: item.values
          }));
          try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/attribute`,{
                Attributes,
                categoryId,
                subCategoryId
                // subCategoryLv2Id
            })
            if(response.status === 200){
                toast.success(response.data.message)
                queryClient.invalidateQueries({queryKey:['attribute']})
                setAttributeData([])
                setAttributeCount(1) 
                setCategoryId('')
                setIsCancel(false)
                setSubCategoryId('')
                // setSubCategoryLv2Id('')
                setIsEdit(false)
                setNumber([0])
            }
          } catch (error) {
            toast.error(error.response.data.message || 'Something went wrong!')
          }
      }
  return (
    <>
    <Head>
        <title>Attribute</title>
      </Head>
    <div className={`w-[100%] h-[100%] flex justify-center items-center text-black`}>
        <ToastContainer/>
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
             onEdit={handleEdit}
             />  }    
    </div>
    </div>
    </>
  )
}
