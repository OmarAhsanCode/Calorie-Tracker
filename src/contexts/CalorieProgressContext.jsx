import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { foodService } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CalorieProgressContext = createContext();

export const useCalorieProgress = () => {
  const ctx = useContext(CalorieProgressContext);
  if (!ctx) throw new Error('useCalorieProgress must be used within CalorieProgressProvider');
  return ctx;
};

export const CalorieProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFat, setTodayFat] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const refreshTodayCalories = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const nutrition = await foodService.getDailyNutrition(user.id, todayStr);
      setTodayCalories(nutrition.calories || 0);
      setTodayProtein(nutrition.protein || 0);
      setTodayCarbs(nutrition.carbs || 0);
      setTodayFat(nutrition.fat || 0);
    } catch (e) {
      console.error('Failed to refresh today nutrition', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, todayStr]);

  const addCalories = (delta) => {
    if (typeof delta === 'number' && !isNaN(delta)) {
      setTodayCalories(prev => Math.max(0, prev + delta));
    }
  };

  const addNutrition = (nutrition) => {
    if (nutrition && typeof nutrition === 'object') {
      if (typeof nutrition.calories === 'number' && !isNaN(nutrition.calories)) {
        setTodayCalories(prev => Math.max(0, prev + nutrition.calories));
      }
      if (typeof nutrition.protein === 'number' && !isNaN(nutrition.protein)) {
        setTodayProtein(prev => Math.max(0, prev + nutrition.protein));
      }
      if (typeof nutrition.carbs === 'number' && !isNaN(nutrition.carbs)) {
        setTodayCarbs(prev => Math.max(0, prev + nutrition.carbs));
      }
      if (typeof nutrition.fat === 'number' && !isNaN(nutrition.fat)) {
        setTodayFat(prev => Math.max(0, prev + nutrition.fat));
      }
    }
  };

  const setTodayCaloriesTotal = (total) => {
    if (typeof total === 'number' && !isNaN(total)) {
      setTodayCalories(Math.max(0, total));
    }
  };

  useEffect(() => {
    if (user) refreshTodayCalories();
  }, [user, refreshTodayCalories]);

  return (
    <CalorieProgressContext.Provider value={{ 
      todayCalories, 
      todayProtein,
      todayCarbs,
      todayFat,
      isLoading, 
      refreshTodayCalories, 
      addCalories,
      addNutrition,
      setTodayCalories: setTodayCaloriesTotal 
    }}>
      {children}
    </CalorieProgressContext.Provider>
  );
};

export default CalorieProgressContext;