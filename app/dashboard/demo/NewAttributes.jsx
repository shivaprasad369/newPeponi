"use client"
import React, { useState } from "react";
import { HiMinusCircle } from "react-icons/hi";
import { IoIosAddCircle } from "react-icons/io";
// import { useSelector } from "react-redux";

export default function NewAttributes({
  attributes,
  setAttributes,
  setAttributeCount,
  attributeCount,
  index,
  attributeData,
  number,
  setNumber,
  setAttributeData
}) {
  // const theme=useSelector((state)=>state.theme)
  const [count, setCount] = useState(1);
  const handleAddAttributeValue = () => {
    setCount((prev) => prev + 1);
  };

  const handleRemoveAttributeValue = (valueIndex) => {
    setCount((prev) => (prev > 1 ? prev - 1 : prev));
    setAttributeData((prev) => {
      const updated = { ...prev };
      if (updated[index]) {
        updated[index].value = updated[index].value.filter((_, i) => i !== valueIndex);
      }
      return updated;
    });
    const newAttributes = [...attributes];
    newAttributes[index].value = newAttributes[index].value.filter(
      (_, i) => i !== valueIndex
    );
    setAttributes(newAttributes);
  };

  const handleRemoveAttribute = (num) => {
    if (attributeCount > 1) {
      setAttributeCount((prev) => prev - 1);
      setNumber((prev) => prev.filter((n) => n !== num));
      setCount(1)
      setAttributeData((prev) => {
        const updated = { ...prev };
        // Create new object excluding the current index
        const filtered = Object.entries(updated).reduce((acc, [key, value]) => {
          if (Number(key) !== num) {
            acc[key] = value;
          }
          return acc;
        }, {});
        return filtered;
      });

      const newAttributes = attributes.filter((_, i) => i !== num);
      setAttributes(newAttributes);
    }
  };
  
  const handleAttributeName = (e) => {
    setAttributeData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        id: number,
        attributeName: e.target.value,
        value: prev[index]?.value || [], 
      },
    }));
    const newAttributes = [...attributes];
    newAttributes[index].attributeName = e.target.value;
    setAttributes(newAttributes);
  };

  const handleAttributeValue = (e, valueIndex) => {
    setAttributeData((prev) => {
      const updatedAttributeData = { ...prev };
      const attribute = updatedAttributeData[index] || { value: [] };
      const updatedValues = [...(attribute.value || [])];
      updatedValues[valueIndex] = e.target.value;
      updatedAttributeData[index] = {
        ...attribute,
        value: updatedValues,
      };
      const newAttributes = [...attributes];
      newAttributes[index].value = updatedValues;
      setAttributes(newAttributes);
      return updatedAttributeData;
    });
  };

  return (
    <div id={number} className={`w-[100%] bg-slate-200 p-4 mt-2 flex gap-x-8 gap-y-4 justify-start items-start`}>
      <div className="w-[50%] flex flex-col gap-2 justify-start items-start">
        <label htmlFor="attributeName" className="text-lg font-semibold">
          Attribute <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={attributes[index]?.attributeName || ""}
          onChange={handleAttributeName}
          name="attributeName"
          className={`w-[100%] h-[60px] outline-none p-2 border-[1px] border-gray-400 rounded-md`}
          required
        />
      </div>
      <div className="w-[40%] flex gap-2 justify-start items-start">
        <div className="w-[100%] flex flex-col gap-2 justify-start items-start">
          <label htmlFor="attributeValues" className="text-lg font-semibold">
            Value <span className="text-red-500">*</span>
          </label>
          {Array.from({ length: count }).map((_, valueIndex) => (
            <div key={valueIndex} className="flex items-center gap-2 w-[100%]">
              <input
                value={attributes[index]?.value[valueIndex] || ""}
                onChange={(e) => handleAttributeValue(e, valueIndex)}
                type="text"
                name={`attributeValue-${valueIndex}`}
                className={`w-[100%] h-[60px] outline-none p-2 border-[1px] border-gray-400 rounded-md`}
                required
              />
              {count > 1 && (
                <span
                  onClick={() => handleRemoveAttributeValue(valueIndex)}
                  className="text-xl font-semibold cursor-pointer"
                >
                  <HiMinusCircle />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-[3%] mt-[2.5rem] flex flex-col gap-2 justify-start items-start">
        <span
          onClick={handleAddAttributeValue}
          className="text-xl font-semibold cursor-pointer"
        >
          <IoIosAddCircle />
        </span>
      </div>
      <div
        onClick={() => handleRemoveAttribute(index)}
        className="w-[20%] cursor-pointer mt-[2.5rem] flex flex-col gap-2 justify-start items-start"
      >
        <div
          className={`${
            index === 0 ? "hidden" : "bg-red-500"
          } text-white px-3 py-2 text-md font-semibold`}
        >
          <span>Remove Attribute</span>
        </div>
      </div>
    </div>
  );
}