import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-craft-200 to-earth-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl font-bold text-craft-600">404</span>
          </div>
          <h1 className="text-3xl font-bold text-earth-900 mb-4">Page Not Found</h1>
          <p className="text-earth-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
