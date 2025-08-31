import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common database operations

// Profile operations
export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  async createProfile(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Food operations
export const foodService = {
  async addFoodEntry(entryData) {
    const { data, error } = await supabase
      .from('food_entries')
      .insert([entryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getFoodEntries(userId, date) {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async updateFoodEntry(entryId, updates) {
    const { data, error } = await supabase
      .from('food_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteFoodEntry(entryId) {
    const { error } = await supabase
      .from('food_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) throw error;
  },

  async getDailyCalories(userId, date) {
    const { data, error } = await supabase
      .from('food_entries')
      .select('ai_calculated_calories')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (error) throw error;
    
    return data.reduce((total, entry) => total + entry.ai_calculated_calories, 0);
  },

  async getDailyNutrition(userId, date) {
    const { data, error } = await supabase
      .from('food_entries')
      .select('ai_calculated_calories, ai_calculated_protein, ai_calculated_carbs, ai_calculated_fat')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (error) throw error;
    
    return data.reduce((totals, entry) => ({
      calories: totals.calories + entry.ai_calculated_calories,
      protein: totals.protein + entry.ai_calculated_protein,
      carbs: totals.carbs + entry.ai_calculated_carbs,
      fat: totals.fat + entry.ai_calculated_fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  },

  async getAllFoodEntries(userId, limit = 100) {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getFoodEntriesByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Weight operations
export const weightService = {
  async logWeight(userId, weight, date, notes = null) {
    const { data, error } = await supabase
      .from('weight_logs')
      .upsert([{
        user_id: userId,
        weight_kg: weight,
        date,
        notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWeightHistory(userId, limit = 30) {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getLatestWeight(userId) {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async deleteWeightLog(logId) {
    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', logId);
    
    if (error) throw error;
  }
};
