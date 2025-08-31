import React, { useState, useEffect } from 'react';
import { profileService, weightService, supabase } from '../lib/supabase';

const OnboardingForm = ({ userId, userEmail, userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: userName || '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
    goal_type: '',
    daily_calorie_goal: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection test successful:', data);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
      }
    };
    
    testConnection();
  }, []);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Desk job, no exercise' },
    { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 'moderately_active', label: 'Moderately Active', description: 'Exercise 3-5 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Exercise 6-7 days/week' },
    { value: 'extremely_active', label: 'Extremely Active', description: 'Very intense exercise/physical job' }
  ];

  const goalTypes = [
    { value: 'lose_weight', label: 'Lose Weight', description: 'Create a calorie deficit' },
    { value: 'maintain', label: 'Maintain Weight', description: 'Stay at current weight' },
    { value: 'gain_weight', label: 'Gain Weight', description: 'Build muscle or gain weight' }
  ];



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
        if (!formData.age || formData.age < 13 || formData.age > 120) newErrors.age = 'Please enter a valid age (13-120)';
        if (!formData.gender) newErrors.gender = 'Please select your gender';
        break;
      
      case 2:
        if (!formData.height_cm || formData.height_cm < 100 || formData.height_cm > 250) {
          newErrors.height_cm = 'Please enter a valid height (100-250 cm)';
        }
        if (!formData.weight_kg || formData.weight_kg < 30 || formData.weight_kg > 300) {
          newErrors.weight_kg = 'Please enter a valid weight (30-300 kg)';
        }
        break;
      
      case 3:
        if (!formData.activity_level) newErrors.activity_level = 'Please select your activity level';
        if (!formData.goal_type) newErrors.goal_type = 'Please select your goal';
        break;
      
      case 4:
        if (!formData.daily_calorie_goal || formData.daily_calorie_goal < 1000 || formData.daily_calorie_goal > 5000) {
          newErrors.daily_calorie_goal = 'Please enter a valid calorie goal (1000-5000)';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      console.log('Starting profile creation for user:', userId);
      
      const profileData = {
        id: userId,
        email: userEmail || '',
        ...formData,
        age: parseInt(formData.age),
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        daily_calorie_goal: parseInt(formData.daily_calorie_goal)
      };

      console.log('Profile data to be created:', profileData);

      const profile = await profileService.createProfile(profileData);
      console.log('Profile created successfully:', profile);

      // Also log initial weight
      console.log('Logging initial weight...');
      await weightService.logWeight(
        userId,
        parseFloat(formData.weight_kg),
        new Date().toISOString().split('T')[0],
        'Initial weight from onboarding'
      );
      console.log('Initial weight logged successfully');

      onComplete(profile);
    } catch (error) {
      console.error('Detailed error creating profile:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      let errorMessage = 'Failed to create profile. Please try again.';
      
      // Provide more specific error messages
      if (error.message.includes('duplicate key')) {
        errorMessage = 'Profile already exists. Please contact support.';
      } else if (error.message.includes('violates check constraint')) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      } else if (error.message.includes('connection')) {
        errorMessage = 'Connection error. Please check your internet and try again.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome! Let's get to know you</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Tell us about yourself to personalize your experience</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your age"
                min="13"
                max="120"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['male', 'female', 'other'].map(gender => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleInputChange('gender', gender)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.gender === gender
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Physical Stats</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Help us calculate your calorie needs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm) *
              </label>
              <input
                type="number"
                value={formData.height_cm}
                onChange={(e) => handleInputChange('height_cm', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your height in centimeters"
                min="100"
                max="250"
                step="0.1"
              />
              {errors.height_cm && <p className="text-red-500 text-sm mt-1">{errors.height_cm}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Weight (kg) *
              </label>
              <input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your current weight in kilograms"
                min="30"
                max="300"
                step="0.1"
              />
              {errors.weight_kg && <p className="text-red-500 text-sm mt-1">{errors.weight_kg}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity & Goals</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Tell us about your lifestyle and goals</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Activity Level *
              </label>
              <div className="space-y-3">
                {activityLevels.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleInputChange('activity_level', level.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                      formData.activity_level === level.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{level.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{level.description}</div>
                  </button>
                ))}
              </div>
              {errors.activity_level && <p className="text-red-500 text-sm mt-1">{errors.activity_level}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Goal *
              </label>
              <div className="space-y-3">
                {goalTypes.map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => handleInputChange('goal_type', goal.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                      formData.goal_type === goal.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{goal.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</div>
                  </button>
                ))}
              </div>
              {errors.goal_type && <p className="text-red-500 text-sm mt-1">{errors.goal_type}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Daily Calorie Goal</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Set your target daily calories</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Calorie Goal *
              </label>
              <input
                type="number"
                value={formData.daily_calorie_goal}
                onChange={(e) => handleInputChange('daily_calorie_goal', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your daily calorie goal (e.g., 2000)"
                min="1000"
                max="5000"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Enter your desired daily calorie intake goal
              </p>
              {errors.daily_calorie_goal && <p className="text-red-500 text-sm mt-1">{errors.daily_calorie_goal}</p>}
            </div>

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">{errors.submit}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
