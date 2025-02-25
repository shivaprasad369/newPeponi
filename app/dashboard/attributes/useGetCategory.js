"use client"
import axios from "axios"
import { useState } from "react"

const useGetCategory = () => {
    const [category, setCategory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const getCategory = async (id) => {
        try {
            
            setLoading(true)
            if(id){
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category/update/get?id=${id}`)
                console.log(response.data)
                setCategory(response.data.result)
          
            }else{
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category`)
                console.log(response.data)
                setCategory(response.data.result)
            }
            setLoading(false)
        } catch (error) {
            setError(error)
            setLoading(false)
        }
    }

    return {category, loading, error, getCategory}
}

export default useGetCategory