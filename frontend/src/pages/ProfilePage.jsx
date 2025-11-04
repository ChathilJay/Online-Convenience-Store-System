import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingBag, CreditCard, Package, Lock, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout, updateUser, changePassword } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser({});
    } else {
      setEditedUser({
        name: user.name,
        phone_number: user.phone_number || '',
        street: user.street || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
      });
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      const result = await updateUser(editedUser);
      if (result.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setEditedUser({});
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    try {
      const result = await changePassword(passwords.current, passwords.new);
      if (result.success) {
        setSuccess('Password changed successfully');
        setIsChangingPassword(false);
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-gray-500 mb-6">
            Home › <span className="text-black">Profile</span>
          </div>

          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <p className="text-gray-600">Customer since {new Date().getFullYear()}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editedUser.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <User size={20} className="text-gray-400" />
                        <span className="text-lg">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Email Address</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail size={20} className="text-gray-400" />
                      <span className="text-lg">{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone_number"
                        value={editedUser.phone_number}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Phone size={20} className="text-gray-400" />
                        <span className="text-lg">{user.phone_number || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-600 block">Address</label>
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="street"
                          placeholder="Street"
                          value={editedUser.street}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={editedUser.city}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={editedUser.state}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <input
                          type="text"
                          name="postal_code"
                          placeholder="Postal Code"
                          value={editedUser.postal_code}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <input
                          type="text"
                          name="country"
                          placeholder="Country"
                          value={editedUser.country}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent md:col-span-2"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <MapPin size={20} className="text-gray-400" />
                        <span className="text-lg">
                          {[user.street, user.city, user.state, user.postal_code, user.country]
                            .filter(Boolean)
                            .join(', ') || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      onClick={handleProfileUpdate}
                      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                  <h3 className="text-lg font-bold mb-6">Change Password</h3>
                  
                  {isChangingPassword ? (
                    <div className="space-y-4">
                      <input
                        type="password"
                        name="current"
                        placeholder="Current Password"
                        value={passwords.current}
                        onChange={handlePasswordInputChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <input
                        type="password"
                        name="new"
                        placeholder="New Password"
                        value={passwords.new}
                        onChange={handlePasswordInputChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <input
                        type="password"
                        name="confirm"
                        placeholder="Confirm New Password"
                        value={passwords.confirm}
                        onChange={handlePasswordInputChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handlePasswordChange}
                          className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswords({ current: '', new: '', confirm: '' });
                            setError('');
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                    >
                      <Lock size={20} />
                      Change Password
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <Package size={20} />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => navigate('/payment-history')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <CreditCard size={20} />
                    <span>Payment History</span>
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <ShoppingBag size={20} />
                    <span>View Cart</span>
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <ShoppingBag size={20} />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <button
                  onClick={handleLogout}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
