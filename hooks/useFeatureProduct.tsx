"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

export function useFeatureProduct() {
  const [category, setCategory] = useState(0)
  const [selectedItems, setSelectedItems] = useState<any>([])
  const [options, setOptions] = useState([])
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-feature", category],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/feature/features/${category}`)
      if (res.status === 200) {
        return res.data.data[0]
      }
      throw new Error("Failed to fetch products")
    },
    enabled: !!category,
  })

  useEffect(() => {
    if (products && !isLoading) {
      setSelectedItems(products)
    }
  }, [products, isLoading])

  useEffect(() => {
    async function fetchFeaturedProduct() {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/feature/${category}`)
      if (res.status === 200) {
        setOptions(
          res.data.data[0].filter(
            (option:any) => !selectedItems.some((selected:any) => selected.ProductID === option.ProductID),
          ),
        )
      }
    }
    if (category) {
      fetchFeaturedProduct()
    }
  }, [category, selectedItems])

  const handleSelectChange = async (productId: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/feature`, {
        FeatureName: category,
        ProductID: productId,
      })
      if (res.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["products-feature"] })
        toast.success("Product added successfully")
      }
    } catch (err:any) {
      console.error(err.response.data.message)
      toast.error(err.response.data.message)
    }
  }

  const handleRemoveItem = async (featuredId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to remove this product?")
      if (!confirm) return
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/feature/${featuredId}`)
      if (res.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["products-feature"] })
        toast.success("Product removed successfully")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to remove product")
    }
  }

  const handleDragEnd = async(result:any)=> {
    const { source, destination } = result
    if (!destination) return
    const reorderedItems = Array.from(selectedItems)
    const [removed] = reorderedItems.splice(source.index, 1)
    reorderedItems.splice(destination.index, 0, removed)
    setSelectedItems(reorderedItems)
   
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/feature/reoder`, {
        id: removed.ProductID,
        position: result.destination.index,
      })

      toast.success("Product order updated successfully!")
    } catch (error) {
      toast.error("Failed to update product order.")
      console.error(error)
    }
  }

  return {
    category,
    setCategory,
    selectedItems,
    options,
    isLoading,
    handleSelectChange,
    handleRemoveItem,
    handleDragEnd,
  }
}

