import React, { useState } from 'react';
import { foodService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FoodLogger = ({ onFoodLogged }) => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [error, setError] = useState('');

  const mealTypes = [
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snack', label: '🍪 Snack' }
  ];

  // This function would integrate with your existing AI analysis
  const handleAnalyzeAndLog = async (analysisData) => {
    if (!user || !analysisData) return;

    try {
      setIsAnalyzing(true);
      setError('');

      // Extract nutrition data from your AI analysis result
      const nutritionData = extractNutritionData(analysisData);

      // Save each food item from the AI analysis
      const savedEntries = [];
      for (const foodItem of nutritionData.foods) {
        const entryData = {
          user_id: user.id,
          food_description: foodItem.description,
          ai_calculated_calories: foodItem.calories,
          ai_calculated_protein: foodItem.protein || 0,
          ai_calculated_carbs: foodItem.carbs || 0,
          ai_calculated_fat: foodItem.fat || 0,
          ai_calculated_quantity: foodItem.quantity || '',
          meal_type: selectedMealType,
          date: new Date().toISOString().split('T')[0]
        };

        const savedEntry = await foodService.addFoodEntry(entryData);
        savedEntries.push(savedEntry);
      }

      // Notify parent component
      if (onFoodLogged) {
        onFoodLogged(savedEntries);
      }

      setAnalysisResult(null);
      console.log('Food entries saved successfully:', savedEntries);

    } catch (error) {
      console.error('Error saving food entries:', error);
      setError('Failed to save food entries. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to extract nutrition data from your AI response
  const extractNutritionData = (analysisData) => {
    // Adapt this to match your AI response format
    // Example based on your existing NutritionResults component:
    if (analysisData.food && Array.isArray(analysisData.food)) {
      return {
        foods: analysisData.food.map(item => ({
          description: item.name,
          calories: parseFloat(item.calories) || 0,
          protein: parseFloat(item.protein) || 0,
          carbs: parseFloat(item.carbs) || 0,
          fat: parseFloat(item.fat) || 0,
          quantity: item.quantity || ''
        }))
      };
    }

    // Fallback for single food item
    return {
      foods: [{
        description: analysisData.description || 'Food item',
        calories: parseFloat(analysisData.calories) || 0,
        protein: parseFloat(analysisData.protein) || 0,
        carbs: parseFloat(analysisData.carbs) || 0,
        fat: parseFloat(analysisData.fat) || 0,
        quantity: analysisData.quantity || ''
      }]
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Log Your Food
      </h3>

      {/* Meal Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meal Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {mealTypes.map(meal => (
            <button
              key={meal.value}
              onClick={() => setSelectedMealType(meal.value)}
              className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                selectedMealType === meal.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              {meal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Point */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400 mb-2">
          🔗 Integration Point
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This component integrates with your existing AI analysis.
          When analysis is complete, call <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">handleAnalyzeAndLog(analysisResult)</code>
        </p>
        
        {/* Example of how you would call it from your existing components */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <strong>Example usage in NutritionResults:</strong><br/>
          {`<FoodLogger onFoodLogged={handleFoodLogged} />`}<br/>
          {`// Then call: foodLogger.handleAnalyzeAndLog(nutritionData)`}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Saving food entries...</span>
        </div>
      )}
    </div>
  );
};

export default FoodLogger;
