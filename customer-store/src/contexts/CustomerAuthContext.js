import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [bodyProfile, setBodyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if customer is already logged in
    const token = localStorage.getItem('customer_token');
    const savedCustomer = localStorage.getItem('customer_data');
    const savedBodyProfile = localStorage.getItem('customer_body_profile');
    
    if (token && savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
        if (savedBodyProfile) {
          setBodyProfile(JSON.parse(savedBodyProfile));
        }
      } catch (error) {
        console.error('Failed to parse customer data:', error);
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
        localStorage.removeItem('customer_body_profile');
      }
    }
    setLoading(false);
  }, []);

  const register = async (email, password, firstName, lastName, phone) => {
    try {
      const response = await axios.post('http://localhost:8082/api/customers/register', {
        email,
        password,
        firstName,
        lastName,
        phone
      });
      
      const { token, customer: customerData, bodyProfile: bodyProfileData } = response.data;
      
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_data', JSON.stringify(customerData));
      setCustomer(customerData);
      
      if (bodyProfileData) {
        localStorage.setItem('customer_body_profile', JSON.stringify(bodyProfileData));
        setBodyProfile(bodyProfileData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8082/api/customers/login', {
        email,
        password
      });
      
      const { token, customer: customerData, bodyProfile: bodyProfileData } = response.data;
      
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_data', JSON.stringify(customerData));
      setCustomer(customerData);
      
      if (bodyProfileData) {
        localStorage.setItem('customer_body_profile', JSON.stringify(bodyProfileData));
        setBodyProfile(bodyProfileData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    localStorage.removeItem('customer_body_profile');
    setCustomer(null);
    setBodyProfile(null);
  };

  const refreshBodyProfile = async () => {
    if (!customer?.id) return;
    
    try {
      const token = localStorage.getItem('customer_token');
      const response = await axios.get(
        `http://localhost:8082/api/body-profile/user/${customer.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const updatedProfile = response.data;
      localStorage.setItem('customer_body_profile', JSON.stringify(updatedProfile));
      setBodyProfile(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to refresh body profile:', error);
      return null;
    }
  };

  const value = {
    customer,
    bodyProfile,
    loading,
    register,
    login,
    logout,
    refreshBodyProfile,
    isAuthenticated: !!customer
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
