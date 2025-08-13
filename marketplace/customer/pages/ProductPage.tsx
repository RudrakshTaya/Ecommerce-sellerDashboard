import React from 'react';
import { useParams } from 'react-router-dom';

const ProductPage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-earth-900 mb-8">Product Details</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-warm-100">
          <p className="text-earth-600">Product {id} details coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
