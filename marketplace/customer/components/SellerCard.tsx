import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingBag, Badge, Calendar } from 'lucide-react';
import { Seller } from '../lib/types';
import { format } from 'date-fns';

interface SellerCardProps {
  seller: Seller;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  return (
    <Link 
      to={`/sellers/${seller._id}`}
      className="group bg-white rounded-xl shadow-sm border border-warm-100 hover:shadow-lg transition-all duration-200 hover-lift block"
    >
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-24 bg-gradient-to-r from-craft-200 to-earth-200 rounded-t-xl overflow-hidden">
          {seller.coverImage ? (
            <img
              src={seller.coverImage}
              alt={`${seller.businessName} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-craft-300 to-earth-300" />
          )}
          
          {/* Verified Badge */}
          {seller.isVerified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <Badge className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden">
            <img
              src={seller.avatar || '/placeholder.svg'}
              alt={seller.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="pt-10 p-6 text-center">
        {/* Name and Business Name */}
        <h3 className="font-semibold text-earth-900 mb-1 group-hover:text-craft-600 transition-colors">
          {seller.businessName}
        </h3>
        <p className="text-sm text-earth-600 mb-3">
          by {seller.name}
        </p>

        {/* Rating */}
        <div className="flex items-center justify-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(seller.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-earth-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-earth-600">
            {seller.rating.toFixed(1)} ({seller.reviewCount})
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center space-x-1 text-earth-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {seller.location.city}, {seller.location.state}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-earth-600 mb-4 line-clamp-2">
          {seller.description}
        </p>

        {/* Specialties */}
        {seller.specialties && seller.specialties.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 justify-center">
              {seller.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-craft-100 text-craft-700 px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
              {seller.specialties.length > 3 && (
                <span className="text-xs text-earth-500">
                  +{seller.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-warm-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-earth-600">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm font-medium">{seller.totalSales}</span>
            </div>
            <span className="text-xs text-earth-500">Sales</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-earth-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {format(new Date(seller.joinedDate), 'MMM yyyy')}
              </span>
            </div>
            <span className="text-xs text-earth-500">Joined</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SellerCard;
