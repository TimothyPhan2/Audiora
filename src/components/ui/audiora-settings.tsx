import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Crown, 
  CreditCard, 
  Shield, 
  Settings as SettingsIcon,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserSettings {
  username: string;
  learning_languages: string[];
  proficiency_level: string;
  timezone: string;
  subscription_tier: 'free' | 'pro';
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  last_active_at: string;
}

interface SubscriptionData {
  tier: 'free' | 'pro';
  status: string;
  started_at: string | null;
  expires_at: string | null;
  auto_renew: boolean;
  payment_method: string | null;
}

const languageOptions = [
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'french', label: 'French', flag: '🇫🇷' },
  { value: 'italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
];

const proficiencyLevels = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Fluent', label: 'Fluent' },
];

const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

export default function AudioraSettings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    learning_languages: [] as string[],
    proficiency_level: '',
    timezone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    fetchUserSettings();
  }, [isAuthenticated, navigate]);

  const fetchUserSettings = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user settings
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.warn('Subscription fetch error:', subscriptionError);
      }

      setSettings(userData);
      setSubscription(subscriptionData || {
        tier: 'free',
        status: 'active',
        started_at: null,
        expires_at: null,
        auto_renew: false,
        payment_method: null,
      });

      // Initialize form data
      setFormData({
        username: userData.username || '',
        learning_languages: userData.learning_languages || [],
        proficiency_level: userData.proficiency_level || '',
        timezone: userData.timezone || 'UTC',
      });

    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          learning_languages: formData.learning_languages,
          proficiency_level: formData.proficiency_level,
          timezone: formData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Settings saved successfully!');
      await fetchUserSettings(); // Refresh data
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <div className="frosted-glass p-8 rounded-xl border border-accent-teal-500/20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-teal-400 mx-auto mb-4" />
          <p className="text-text-cream200">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="container-center py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-text-cream400 hover:text-text-cream200 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">Settings</h1>
              <p className="text-text-cream300 mt-1">Manage your account and preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-accent-teal-400" />
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="frosted-glass p-4 rounded-xl border border-red-500/30 bg-red-500/10"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-teal-500/20 rounded-lg">
                  <User className="h-5 w-5 text-accent-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-text-cream100">Profile Information</h2>
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-text-cream200">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100"
                    placeholder="Enter your username"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="text-text-cream200">Email</Label>
                  <div className="flex items-center gap-3 p-3 bg-base-dark3/30 rounded-lg border border-accent-teal-500/20">
                    <Mail className="h-4 w-4 text-accent-teal-400" />
                    <span className="text-text-cream300">{user?.email}</span>
                  </div>
                </div>

                {/* Learning Languages */}
                <div className="space-y-2">
                  <Label className="text-text-cream200">Learning Languages</Label>
                  <Select
                    value={formData.learning_languages[0] || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, learning_languages: [value] }))}
                  >
                    <SelectTrigger className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-base-dark2 border-accent-teal-500/30">
                      {languageOptions.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-text-cream100 focus:bg-accent-teal-500/20">
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Proficiency Level */}
                <div className="space-y-2">
                  <Label className="text-text-cream200">Proficiency Level</Label>
                  <Select
                    value={formData.proficiency_level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, proficiency_level: value }))}
                  >
                    <SelectTrigger className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent className="bg-base-dark2 border-accent-teal-500/30">
                      {proficiencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="text-text-cream100 focus:bg-accent-teal-500/20">
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label className="text-text-cream200">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-base-dark2 border-accent-teal-500/30">
                      {timezoneOptions.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value} className="text-text-cream100 focus:bg-accent-teal-500/20">
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="button-gradient-primary text-white w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Account Status & Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Account Status */}
            <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-teal-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-accent-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-cream100">Account Status</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-cream300">Role</span>
                  <span className="text-text-cream100 capitalize">{settings?.role}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-cream300">Member Since</span>
                  <span className="text-text-cream100">{formatDate(settings?.created_at || null)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-cream300">Last Active</span>
                  <span className="text-text-cream100">{formatDate(settings?.last_active_at || null)}</span>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-teal-500/20 rounded-lg">
                  {subscription?.tier === 'pro' ? (
                    <Crown className="h-5 w-5 text-accent-teal-400" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-accent-teal-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-text-cream100">Subscription</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-cream300">Plan</span>
                  <div className="flex items-center gap-2">
                    {subscription?.tier === 'pro' && <Crown className="h-4 w-4 text-yellow-400" />}
                    <span className="text-text-cream100 capitalize font-medium">
                      {subscription?.tier || 'Free'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-cream300">Status</span>
                  <div className="flex items-center gap-2">
                    {subscription?.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-text-cream100 capitalize">
                      {subscription?.status || 'Active'}
                    </span>
                  </div>
                </div>

                {subscription?.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Expires</span>
                    <span className="text-text-cream100">{formatDate(subscription.expires_at)}</span>
                  </div>
                )}

                {subscription?.payment_method && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Payment</span>
                    <span className="text-text-cream100">{subscription.payment_method}</span>
                  </div>
                )}

                {subscription?.tier === 'free' && (
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="button-gradient-primary text-white w-full mt-4"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}