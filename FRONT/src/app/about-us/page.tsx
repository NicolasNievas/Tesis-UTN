import React from 'react';
import { Coffee, Heart, Award, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">About Us</h2>
          <p className="mt-4 text-lg text-gray-500">
            Discover the passion behind every cup
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center">
                <Coffee className="h-12 w-12 text-brown-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Premium Quality</h3>
              <p className="mt-2 text-gray-600">
                We select the finest coffee beans to ensure an exceptional experience.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center">
                <Heart className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Coffee Passion</h3>
              <p className="mt-2 text-gray-600">
                Every cup reflects our love and dedication to the art of coffee.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Excellence</h3>
              <p className="mt-2 text-gray-600">
                Committed to the highest quality standards in every product.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Community</h3>
              <p className="mt-2 text-gray-600">
                Building lasting relationships with our customers and suppliers.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-6">Our Story</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            At Coffee Craze, our passion for coffee drives us to offer the best experience 
            to our customers. Since our beginnings, we have been committed to excellence, 
            carefully selecting each bean and perfecting every process. Our mission is to 
            make every coffee moment special, providing high-quality products and exceptional 
            service that satisfies even the most demanding palate.
          </p>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to join the Coffee Craze experience?</h3>
          <button className="bg-brown-600 text-white px-8 py-3 rounded-lg hover:bg-brown-700 transition-colors">
            Discover Our Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;