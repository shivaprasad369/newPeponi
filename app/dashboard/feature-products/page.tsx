"use client"
import React from "react"
import { FaList, FaGripVertical } from "react-icons/fa"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useFeatureProduct } from "../../../hooks/useFeatureProduct"
import { Toaster } from "react-hot-toast"

export default function FeatureProduct() {
  const {
    category,
    setCategory,
    selectedItems,
    options,
    isLoading,
    handleSelectChange,
    handleRemoveItem,
    handleDragEnd,
  } = useFeatureProduct()  

  React.useEffect(() => {
    document.title = "Featured Product"
  }, [])

  return (
    <div className="w-full h-full pl-2 flex flex-col  text-[#252525] justify-start items-start">
      <Toaster/>
      <div className="flex pb-5 justify-start gap-2 w-full items-center border-b border-gray-300 mb-6">
        <h1 className="text-3xl font-semibold">Manage Featured Products</h1>
      </div>
      <div className="w-[70%] p-6 text-black mb-4 rounded-md border border-gray-300 bg-white shadow-sm">
        <CategorySelection category={category} setCategory={setCategory} />
        {category !== 0 && (
          <>
            <ProductsSection
              selectedItems={selectedItems}
              options={options}
              isLoading={isLoading}
              handleSelectChange={handleSelectChange}
              handleRemoveItem={handleRemoveItem}
              handleDragEnd={handleDragEnd}
            />
            <SortingNote />
            <SortedItemsList selectedItems={selectedItems} handleDragEnd={handleDragEnd} />
          </>
        )}
      </div>
    </div>
  )
}

function CategorySelection({ category, setCategory }: { category: number; setCategory: (value: number) => void }) {
  return (
    <div className="w-full flex flex-col gap-2 justify-start items-start mb-6">
      <label htmlFor="category" className="text-xl font-semibold">
        Category <span className="text-red-500">*</span>
      </label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value as unknown as number)}
        className="w-full h-[50px] outline-none border-2 bg-white border-gray-300 rounded-md p-2 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Category</option>
        <option value={1}>Artworks</option>
        <option value={2}>Portaits</option>
        <option value={3}>Art Prints</option>
        <option value={4}>Trending Products   </option>
      </select>
    </div>
  )
}

function ProductsSection({
  selectedItems,
  options,
  isLoading,
  handleSelectChange,
  handleRemoveItem,
  handleDragEnd,
}: {
  selectedItems: any[]
  options: any[]
  isLoading: boolean
  handleSelectChange: (productId: string) => void
  handleRemoveItem: (featuredId: string) => void
  handleDragEnd: (result: any) => void})
  {
  return (
    <>
      <label htmlFor="products" className="text-xl font-semibold block mb-2">
        Products <span className="text-red-500">*</span>
      </label>
      <div className="w-full gap-4 mt-2 border-2 border-gray-300 rounded-md p-4 text-black mb-4 flex flex-col justify-start items-stretch">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="selectedItems">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-full gap-2 flex flex-col"
              >
                {selectedItems.length > 0 ? (
                  selectedItems.map((item, index) => (
                    <Draggable key={item.ProductID} draggableId={String(item.ProductID)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="px-3 py-2 rounded-md border border-gray-300 bg-white flex items-center justify-between"
                          style={provided.draggableProps.style}
                        >
                          <div className="flex items-center gap-2">
                            <FaGripVertical className="text-gray-400" />
                            <span>{item.ProductName}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.FeaturedID)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No items selected</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <select
          id="products"
          onChange={(e) => handleSelectChange(e.target.value)}
          value=""
          className="w-full border-2 border-gray-300 bg-white text-black rounded-md p-2 outline-none focus:border-blue-500 transition-colors"
          disabled={isLoading}
        >
          <option value="" disabled>
            Select an item
          </option>
          {!isLoading &&
            options.map((option) => (
              <option key={option.ProductID} value={option.ProductID}>
                {option.ProductName}
              </option>
            ))}
        </select>
      </div>
    </>
  )
}

function SortingNote() {
  return (
    <span className="text-sm font-medium text-gray-600 block mt-4 mb-6">
      Note: Please drag and drop products to sort them.
    </span>
  )
}

function SortedItemsList({ selectedItems, handleDragEnd }: { selectedItems: any[]; handleDragEnd: (result: any) => void }) {
  return (
    <div className="w-full gap-2 mt-2 flex flex-col">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="selectedItemsSorted">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full gap-2 flex flex-col"
            >
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => (
                  <Draggable key={item.ProductID} draggableId={String(item.ProductID)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-full h-[60px] rounded-md border border-gray-300 ${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } flex items-center overflow-hidden`}
                        style={provided.draggableProps.style}
                      >
                        <div className="w-[60px] h-[60px] bg-gray-200 flex-shrink-0">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${item.Image}`}
                            alt={item.ProductName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="ml-4">{item.ProductName}</span>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <p className="text-center text-gray-500">No items selected</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
