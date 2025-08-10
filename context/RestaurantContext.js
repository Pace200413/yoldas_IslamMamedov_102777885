import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REST_KEY = 'restaurants';
const RestaurantContext = createContext();

export function useRestaurants() {
  return useContext(RestaurantContext);
}

export function RestaurantProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(REST_KEY);
        setRestaurants(raw ? JSON.parse(raw) : []);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(REST_KEY, JSON.stringify(restaurants));
  }, [restaurants]);

  const addRestaurant = (rest) => {
    setRestaurants(r => [...r, rest]);
  };

  const approveRestaurant = (id, isApproved = true) => {
    setRestaurants(r =>
      r.map(rest => (rest.id === id ? { ...rest, approved: isApproved } : rest))
    );
  };

  const updateRestaurant = (id, updates) => {
    setRestaurants(r =>
      r.map(x => (x.id === id ? { ...x, ...updates } : x))
    );
  };

  const upsertMenuItem = (restId, item) => {
    setRestaurants(r => r.map(rest => {
      if (rest.id !== restId) return rest;
      const exists = rest.menu?.some(x => x.id === item.id);
      const menu = exists
        ? rest.menu.map(x => (x.id === item.id ? item : x))
        : [...(rest.menu || []), item];
      return { ...rest, menu };
    }));
  };

  const deleteMenuItem = (restId, itemId) => {
    setRestaurants(r => r.map(rest => {
      if (rest.id !== restId) return rest;
      return {
        ...rest,
        menu: rest.menu?.filter(x => x.id !== itemId)
      };
    }));
  };

  const replaceAllRestaurants = (newList) => {
    setRestaurants(newList);
  };

  const mergeRestaurants = (incoming) => {
    setRestaurants(prev => {
      const map = new Map();
      [...prev, ...incoming].forEach(r => map.set(r.id, r));
      return Array.from(map.values());
    });
  };

  return (
    <RestaurantContext.Provider value={{
      restaurants,
      addRestaurant,
      approveRestaurant,
      updateRestaurant,
      upsertMenuItem,
      deleteMenuItem,
      replaceAllRestaurants,
      mergeRestaurants
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}
