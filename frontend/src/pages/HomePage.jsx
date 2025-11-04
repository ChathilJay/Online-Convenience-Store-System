import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-4xl font-bold text-center">Welcome to the Online Store</h1>
      <div className="flex justify-center mt-10">
        <Link to="/products" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
