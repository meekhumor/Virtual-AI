import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="flex items-center justify-center mt-44">
          <div className="text-center">
            <img src="/error-404.png" alt="404" className="w-1/2 mx-auto mb-5" />
            <p className="text-2xl text-gray-500">Oops! Page not found.</p>
            <Link to="/" className="mt-8 inline-block px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Go Home</Link>
          </div>
        </div>
      );
}

export default NotFound
