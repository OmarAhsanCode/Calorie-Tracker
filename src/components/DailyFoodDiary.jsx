import React, { useState, useEffect } from 'react';
import { foodService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DailyFoodDiary = ({ selectedDate = new Date().toISOString().split('T')[0] }) => {
  const { user, profile } = useAuth();
  const [foodEntries, setFoodEntries] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, selectedDate]);

  const loadFoodEntries = async () => {
    try {
      setIsLoading(true);
      setError('');

      const entries = await foodService.getFoodEntries(user.id, selectedDate);
      const nutrition = await foodService.getDailyNutrition(user.id, selectedDate);

      setFoodEntries(entries);
      setDailyTotals(nutrition);

    } catch (error) {
      console.error('Error loading food entries:', error);
      setError('Failed to load food entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await foodService.deleteFoodEntry(entryId);
      await loadFoodEntries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete entry');
    }
  };

  const groupEntriesByMeal = (entries) => {
    return entries.reduce((groups, entry) => {
      const meal = entry.meal_type;
      if (!groups[meal]) groups[meal] = [];
      groups[meal].push(entry);
      return groups;
    }, {});
  };

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍪'
    };
    return icons[mealType] || '🍽️';
  };

  const getMealTotals = (entries) => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + entry.ai_calculated_calories,
      protein: totals.protein + entry.ai_calculated_protein,
      carbs: totals.carbs + entry.ai_calculated_carbs,
      fat: totals.fat + entry.ai_calculated_fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const groupedEntries = groupEntriesByMeal(foodEntries);
  const caloriesRemaining = profile?.daily_calorie_goal ? profile.daily_calorie_goal - dailyTotals.calories : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Food Diary
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(selectedDate).toLocaleDateString()}
        </span>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Daily Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(dailyTotals.calories)}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Calories</div>
          {caloriesRemaining !== null && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {caloriesRemaining > 0 ? `${Math.round(caloriesRemaining)} left` : `${Math.abs(Math.round(caloriesRemaining))} over`}
            </div>
          )}
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(dailyTotals.protein)}g
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Protein</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {Math.round(dailyTotals.carbs)}g
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">Carbs</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(dailyTotals.fat)}g
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">Fat</div>
        </div>
      </div>

      {/* Meal Sections */}
      {foodEntries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">🍽️</div>
          <p className="text-gray-500 dark:text-gray-400">No food entries for today</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Start by analyzing some food!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
            const mealEntries = groupedEntries[mealType] || [];
            if (mealEntries.length === 0) return null;

            const mealTotals = getMealTotals(mealEntries);

            return (
              <div key={mealType} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {getMealIcon(mealType)} {mealType}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(mealTotals.calories)} cal
                  </span>
                </div>

                <div className="space-y-2">
                  {mealEntries.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {entry.food_description}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.ai_calculated_quantity && `${entry.ai_calculated_quantity} • `}
                          {Math.round(entry.ai_calculated_calories)} cal, {Math.round(entry.ai_calculated_protein)}g protein
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete entry"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyFoodDiary;
