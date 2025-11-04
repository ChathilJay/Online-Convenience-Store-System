import React from 'react';
import { ChevronRight } from 'lucide-react';

const Footer = () => {
  return (
    <>
      <div className="bg-gray-100 py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="bg-black text-white rounded-2xl overflow-hidden flex">
            <div className="w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop" 
                alt="Promo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-1/2 p-16 flex flex-col justify-center">
              <p className="text-sm mb-4">LIMITED OFFER</p>
              <h2 className="text-5xl font-bold mb-4">35% off only this friday and get special gift</h2>
              <button className="bg-white text-black px-6 py-3 rounded-lg font-medium w-fit flex items-center gap-2 hover:bg-gray-100">
                Grab it now <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to our newsletter to get updates<br />to our latest collections</h2>
          <p className="text-gray-600 mb-6">Get 20% off on your first order just by subscribing to our newsletter</p>
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border rounded-lg"
            />
            <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800">
              Subscribe
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            You will be able to unsubscribe at any time.<br />
            Read our Privacy Policy <a href="#" className="underline">here</a>
          </p>
        </div>
      </div>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">NØSTRA</h3>
              <p className="text-gray-600 text-sm">Specializes in providing high-quality, stylish products for your wardrobe</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">SHOP</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#">All Collections</a></li>
                <li><a href="#">Winter Edition</a></li>
                <li><a href="#">Discount</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">COMPANY</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Affiliates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Terms of Use</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">PAYMENT METHODS</h4>
              <div className="flex gap-2">
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">MC</div>
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">PP</div>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-12">
            Copyright © 2025 Online Store. All right reserved
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
