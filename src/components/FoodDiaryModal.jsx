import { useState, useEffect, useCallback } from 'react';
import { foodService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FoodDiaryModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('recent'); // 'recent', 'week', 'month'

  const loadFoodEntries = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');

      let entries;
      if (viewMode === 'recent') {
        entries = await foodService.getAllFoodEntries(user.id, 50);
      } else if (viewMode === 'week') {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        entries = await foodService.getFoodEntriesByDateRange(user.id, startDate, endDate);
      } else if (viewMode === 'month') {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        entries = await foodService.getFoodEntriesByDateRange(user.id, startDate, endDate);
      }

      setFoodEntries(entries);
    } catch (error) {
      console.error('Error loading food entries:', error);
      setError('Failed to load food entries');
    } finally {
      setIsLoading(false);
    }
  }, [user, viewMode]);

  useEffect(() => {
    if (isOpen && user) {
      loadFoodEntries();
    }
  }, [isOpen, user, loadFoodEntries]);

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await foodService.deleteFoodEntry(entryId);
      await loadFoodEntries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete entry');
    }
  };

  const groupEntriesByDate = (entries) => {
    return entries.reduce((groups, entry) => {
      const date = entry.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
      return groups;
    }, {});
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDayTotals = (entries) => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.ai_calculated_calories || 0),
      protein: totals.protein + (entry.ai_calculated_protein || 0),
      carbs: totals.carbs + (entry.ai_calculated_carbs || 0),
      fat: totals.fat + (entry.ai_calculated_fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📖 Food Diary
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { value: 'recent', label: 'Recent (50)' },
              { value: 'week', label: 'Past Week' },
              { value: 'month', label: 'Past Month' }
            ].map(mode => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.value
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : foodEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No food entries yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start by analyzing some food to see your diary!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupEntriesByDate(foodEntries)).map(([date, dateEntries]) => {
                const dayTotals = getDayTotals(dateEntries);
                const groupedByMeal = groupEntriesByMeal(dateEntries);

                return (
                  <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Date Header */}
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(date)}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(dayTotals.calories)} cal • {Math.round(dayTotals.protein)}g protein
                        </div>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="p-6 space-y-4">
                      {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                        const mealEntries = groupedByMeal[mealType] || [];
                        if (mealEntries.length === 0) return null;

                        // Sort entries by time
                        mealEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                        return (
                          <div key={mealType} className="border border-gray-100 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 capitalize">
                              {getMealIcon(mealType)} {mealType}
                            </h4>
                            
                            <div className="space-y-2">
                              {mealEntries.map(entry => (
                                <div key={entry.id} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {entry.food_description}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        {formatTime(entry.created_at)}
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {entry.ai_calculated_quantity && `${entry.ai_calculated_quantity} • `}
                                      {Math.round(entry.ai_calculated_calories || 0)} cal
                                      {entry.ai_calculated_protein && `, ${Math.round(entry.ai_calculated_protein)}g protein`}
                                      {entry.ai_calculated_carbs && `, ${Math.round(entry.ai_calculated_carbs)}g carbs`}
                                      {entry.ai_calculated_fat && `, ${Math.round(entry.ai_calculated_fat)}g fat`}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-red-500 hover:text-red-700 p-1 ml-2"
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryModal;
