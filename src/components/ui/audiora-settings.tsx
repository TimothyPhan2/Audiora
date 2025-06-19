import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Globe, 
  Bell, 
  Shield, 
  CreditCard, 
  Settings as SettingsIcon,
  Save,
  Loader2,
  Crown,
  Calendar,
  Mail,
  Languages,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const languageOptions = [
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'french', label: 'French', flag: '🇫🇷' },
  { value: 'italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
  { value: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { value: 'korean', label: 'Korean', flag: '🇰🇷' },
  { value: 'mandarin', label: 'Mandarin', flag: '🇨🇳' }
];

const proficiencyLevels = [
  { value: 'Beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'Intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'Advanced', label: 'Advanced', description: 'Quite experienced' },
  { value: 'Fluent', label: 'Fluent', description: 'Near-native level' }
];

export default function AudioraSettings() {
  const { user, updateUserPreferences, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state - initialized from user data
  const [formData, setFormData] = useState({
    selectedLanguage: '',
    proficiencyLevel: '',
    emailNotifications: true,
    pushNotifications: false,
    weeklyProgress: true,
    achievementAlerts: true,
    marketingEmails: false,
    timezone: 'UTC'
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        selectedLanguage: user.learning_languages?.[0] || '',
        proficiencyLevel: user.proficiency_level || '',
        emailNotifications: true, // These would come from user preferences in a real app
        pushNotifications: false,
        weeklyProgress: true,
        achievementAlerts: true,
        marketingEmails: false,
        timezone: user.timezone || 'UTC'
      });
    }
  }, [user]);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (user) {
      const hasLanguageChange = formData.selectedLanguage !== (user.learning_languages?.[0] || '');
      const hasProficiencyChange = formData.proficiencyLevel !== (user.proficiency_level || '');
      setHasChanges(hasLanguageChange || hasProficiencyChange);
    }
  }, [formData, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!user || !hasChanges) return;

    setIsLoading(true);
    
    try {
      // Only update the fields that can be changed via updateUserPreferences
      await updateUserPreferences({
        userId: user.id,
        selectedLanguage: formData.selectedLanguage as any,
        proficiencyLevel: formData.proficiencyLevel as any
      });

      toast.success('Settings updated successfully!', {
        description: 'Your learning preferences have been saved.'
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings', {
        description: error instanceof Error ? error.message : 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if user data is not available
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-teal-400 mx-auto mb-4" />
          <p className="text-text-cream300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="container-center py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-teal-500/20 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-accent-teal-400" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          </div>
          <p className="text-text-cream300">Manage your account and learning preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="frosted-glass border-accent-teal-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-accent-teal-400" />
                    <CardTitle className="text-text-cream100">Profile Information</CardTitle>
                  </div>
                  <CardDescription className="text-text-cream400">
                    Your basic account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-text-cream200">Username</Label>
                      <Input
                        id="username"
                        value={user.username || ''}
                        disabled
                        className="bg-base-dark3/50 border-accent-teal-500/30 text-text-cream300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-text-cream200">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ''}
                        disabled
                        className="bg-base-dark3/50 border-accent-teal-500/30 text-text-cream300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="frosted-glass border-accent-teal-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-accent-teal-400" />
                    <CardTitle className="text-text-cream100">Learning Preferences</CardTitle>
                  </div>
                  <CardDescription className="text-text-cream400">
                    Customize your language learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-text-cream200">Primary Language</Label>
                      <Select 
                        value={formData.selectedLanguage} 
                        onValueChange={(value) => handleInputChange('selectedLanguage', value)}
                      >
                        <SelectTrigger className="bg-base-dark3/50 border-accent-teal-500/30 text-text-cream100">
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
                    <div className="space-y-2">
                      <Label className="text-text-cream200">Proficiency Level</Label>
                      <Select 
                        value={formData.proficiencyLevel} 
                        onValueChange={(value) => handleInputChange('proficiencyLevel', value)}
                      >
                        <SelectTrigger className="bg-base-dark3/50 border-accent-teal-500/30 text-text-cream100">
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent className="bg-base-dark2 border-accent-teal-500/30">
                          {proficiencyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value} className="text-text-cream100 focus:bg-accent-teal-500/20">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{level.label}</span>
                                <span className="text-xs text-text-cream400">{level.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="frosted-glass border-accent-teal-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-accent-teal-400" />
                    <CardTitle className="text-text-cream100">Notifications</CardTitle>
                  </div>
                  <CardDescription className="text-text-cream400">
                    Choose what notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-text-cream200">Email Notifications</Label>
                      <p className="text-sm text-text-cream400">Receive lesson reminders and updates</p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    />
                  </div>
                  <Separator className="bg-accent-teal-500/20" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-text-cream200">Weekly Progress Reports</Label>
                      <p className="text-sm text-text-cream400">Get weekly summaries of your learning</p>
                    </div>
                    <Switch
                      checked={formData.weeklyProgress}
                      onCheckedChange={(checked) => handleInputChange('weeklyProgress', checked)}
                    />
                  </div>
                  <Separator className="bg-accent-teal-500/20" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-text-cream200">Achievement Alerts</Label>
                      <p className="text-sm text-text-cream400">Celebrate your milestones</p>
                    </div>
                    <Switch
                      checked={formData.achievementAlerts}
                      onCheckedChange={(checked) => handleInputChange('achievementAlerts', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <Button
                onClick={handleSaveSettings}
                disabled={!hasChanges || isLoading}
                className="button-gradient-primary text-white px-6 py-2 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="frosted-glass border-accent-teal-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-accent-teal-400" />
                    <CardTitle className="text-text-cream100">Account Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Subscription</span>
                    <Badge 
                      variant={user.subscription_tier === 'pro' ? 'default' : 'secondary'}
                      className={user.subscription_tier === 'pro' 
                        ? 'bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 text-base-dark2' 
                        : 'bg-base-dark3 text-text-cream300'
                      }
                    >
                      {user.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Member since</span>
                    <span className="text-text-cream400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Last active</span>
                    <span className="text-text-cream400 text-sm">
                      {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="frosted-glass border-accent-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-text-cream100">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Current Language</span>
                    <div className="flex items-center gap-2">
                      {formData.selectedLanguage && (
                        <>
                          <span>{languageOptions.find(l => l.value === formData.selectedLanguage)?.flag}</span>
                          <span className="text-text-cream200 text-sm">
                            {languageOptions.find(l => l.value === formData.selectedLanguage)?.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Level</span>
                    <Badge variant="outline" className="border-accent-teal-500/30 text-text-cream200">
                      {formData.proficiencyLevel || 'Not set'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-cream300">Timezone</span>
                    <span className="text-text-cream400 text-sm">{user.timezone}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="frosted-glass border-accent-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-text-cream100">Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.subscription_tier === 'free' && (
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent border-accent-teal-500/30 text-accent-teal-400 hover:bg-accent-teal-500/10"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing History
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}