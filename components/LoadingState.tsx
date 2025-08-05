import React from 'react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'table' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  rows?: number;
  columns?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'spinner', 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  rows = 5,
  columns = 4
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderSpinner = () => (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className={`mt-4 text-gray-600 ${textSizes[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  const renderSkeleton = () => (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={`overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 p-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-gray-100">
            <div className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'skeleton':
      return renderSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'cards':
      return renderCardSkeleton();
    case 'spinner':
    default:
      return renderSpinner();
  }
};

export default LoadingState; 