import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
function App() {
  
  return (
    <>
      <div className="max-w-sm rounded-lg overflow-hidden shadow-lg m-4 bg-white hover:shadow-xl transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative">
        <img 
          className="w-full h-48 object-cover" 
          src="https://via.placeholder.com/600x400" 
          alt="Product" 
        />
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 m-2 rounded-full">
          New
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="font-bold text-xl mb-2 text-gray-800">
          Super Awesome Product
        </div>
        <p className="text-gray-700 text-base">
          This is a detailed description of the product. It's so amazing you'll wonder how you ever lived without it.
        </p>
      </div>

      {/* Call-to-Action Section */}
      <div className="flex items-center justify-between p-6 pt-0">
        <span className="text-xl font-bold text-gray-900">
          $49.99
        </span>
        <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </div>
    </>
  )
}

export default App
