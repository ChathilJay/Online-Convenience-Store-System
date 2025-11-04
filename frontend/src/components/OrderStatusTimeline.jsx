import React from 'react';
import { Package, CreditCard, Truck, CheckCircle, XCircle } from 'lucide-react';

const OrderStatusTimeline = ({ currentStatus, createdAt, updatedAt }) => {
  const statuses = [
    {
      key: 'placed',
      label: 'Order Placed',
      icon: Package,
      description: 'Your order has been placed'
    },
    {
      key: 'paid',
      label: 'Payment Confirmed',
      icon: CreditCard,
      description: 'Payment has been processed'
    },
    {
      key: 'dispatched',
      label: 'Dispatched',
      icon: Truck,
      description: 'Your order is on the way'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Order has been delivered'
    }
  ];

  const cancelledStatus = {
    key: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    description: 'Order has been cancelled'
  };

  // Check if order is cancelled
  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Order Cancelled</h3>
            <p className="text-sm text-red-700">This order has been cancelled</p>
          </div>
        </div>
        {updatedAt && (
          <p className="text-sm text-red-600">
            Cancelled on {new Date(updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    );
  }

  // Get the index of current status
  const currentStatusIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h3 className="font-bold text-lg mb-6">Order Status</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div 
          className="absolute left-6 top-0 w-0.5 bg-green-500 transition-all duration-500"
          style={{ 
            height: currentStatusIndex >= 0 
              ? `${(currentStatusIndex / (statuses.length - 1)) * 100}%` 
              : '0%' 
          }}
        />

        {/* Status Steps */}
        <div className="space-y-8 relative">
          {statuses.map((status, index) => {
            const Icon = status.icon;
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={status.key} className="flex items-start gap-4 relative">
                {/* Icon Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-400'
                  }
                  ${isCurrent ? 'ring-4 ring-green-200 animate-pulse' : ''}
                `}>
                  <Icon size={20} />
                </div>

                {/* Status Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {status.label}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                    {status.description}
                  </p>
                  {isCurrent && updatedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Updated {new Date(updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {index === 0 && isCompleted && createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated Delivery */}
      {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Estimated Delivery: </span>
            {currentStatus === 'placed' && '5-7 business days'}
            {currentStatus === 'paid' && '3-5 business days'}
            {currentStatus === 'dispatched' && '1-2 business days'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;
