import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Crown, 
  CreditCard, 
  LogOut, 
  HelpCircle,
  Check,
  Star,
  Zap,
  Music,
  BookMarked,
  Headphones,
  Target,
  BarChart3,
  Users
} from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface UserProfile {
  username: string;
  languages: LanguageOption[];
  proficiency: string;
  plan: 'free' | 'pro';
  timezone: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
];

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

const AudioraSettings = () => {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'AudioLearner',
    languages: [LANGUAGES[0], LANGUAGES[1]],
    proficiency: 'Intermediate',
    plan: 'free',
    timezone: 'UTC+00:00'
  });

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageOption[]>(profile.languages);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveUsername = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setProfile(prev => ({ ...prev, username: tempUsername }));
    setIsEditingUsername(false);
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setTempUsername(profile.username);
    setIsEditingUsername(false);
  };

  const handleSaveLanguages = () => {
    setProfile(prev => ({ ...prev, languages: selectedLanguages }));
    setIsLanguageModalOpen(false);
  };

  const toggleLanguage = (language: LanguageOption) => {
    setSelectedLanguages(prev => {
      const exists = prev.find(l => l.code === language.code);
      if (exists) {
        return prev.filter(l => l.code !== language.code);
      } else {
        return [...prev, language];
      }
    });
  };

  const getPlanFeatures = (plan: string) => {
    switch (plan) {
      case 'free':
        return [
          { icon: Music, text: 'Access to 10 songs' },
          { icon: BookMarked, text: 'Basic vocabulary tools' },
          { icon: Target, text: 'Limited quizzes' }
        ];
      case 'pro':
        return [
          { icon: Music, text: 'Unlimited song access' },
          { icon: BookMarked, text: 'Advanced vocabulary tools' },
          { icon: Target, text: 'Unlimited quizzes' },
          { icon: Headphones, text: 'Pronunciation feedback' },
          { icon: BarChart3, text: 'Progress tracking' },
          { icon: Target, text: 'Personalized learning path' },
          { icon: Users, text: 'Priority support' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold gradient-text">Settings</h1>
          <p className="text-text-cream300">Customize your language learning experience</p>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="frosted-glass border border-accent-teal-500/20">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-accent-teal-400" />
                <h2 className="text-2xl font-semibold text-text-cream100">Profile Settings</h2>
              </div>

              {/* Username */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Username</label>
                <div className="flex items-center gap-3">
                  {isEditingUsername ? (
                    <>
                      <Input
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 placeholder:text-text-cream400/60 flex-1"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSaveUsername}
                        disabled={isLoading || !tempUsername.trim()}
                        className="button-gradient-primary text-white"
                        size="sm"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-text-cream100">{profile.username}</span>
                      <Button
                        onClick={() => setIsEditingUsername(true)}
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Learning Languages */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Learning Languages</label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 flex-wrap flex-1">
                    {profile.languages.map((lang) => (
                      <Badge key={lang.code} className="bg-accent-teal-500 text-white hover:bg-accent-teal-400">
                        {lang.flag} {lang.name}
                      </Badge>
                    ))}
                  </div>
                  <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-base-dark2 border-accent-teal-500/20 text-text-cream100">
                      <DialogHeader>
                        <DialogTitle className="text-text-cream100">Select Learning Languages</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                          <div
                            key={lang.code}
                            onClick={() => toggleLanguage(lang)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedLanguages.find(l => l.code === lang.code)
                                ? 'bg-accent-teal-500 border-accent-teal-400'
                                : 'bg-base-dark3/60 border-accent-teal-500/30 hover:bg-accent-teal-500/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{lang.flag}</span>
                              <span className="text-sm">{lang.name}</span>
                              {selectedLanguages.find(l => l.code === lang.code) && (
                                <Check className="w-4 h-4 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleSaveLanguages}
                        className="button-gradient-primary text-white w-full"
                      >
                        Save Languages
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Proficiency Level */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Proficiency Level</label>
                <Select
                  value={profile.proficiency}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, proficiency: value }))}
                >
                  <SelectTrigger className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-base-dark2 border-accent-teal-500/20">
                    {['Beginner', 'Intermediate', 'Advanced', 'Fluent'].map((level) => (
                      <SelectItem key={level} value={level} className="text-text-cream100 hover:bg-accent-teal-500/10 focus:bg-accent-teal-500/10">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subscription & Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="frosted-glass border border-accent-teal-500/20">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-accent-persian-500" />
                <h2 className="text-2xl font-semibold text-text-cream100">Subscription & Account</h2>
              </div>

              {/* Current Plan */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-text-cream100">Current Plan</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${
                        profile.plan === 'pro' 
                          ? 'bg-gradient-to-r from-accent-teal-500 to-accent-persian-500 text-white' 
                          : 'bg-base-dark3 text-text-cream300'
                      }`}>
                        {profile.plan === 'pro' ? 'Pro' : 'Free'}
                      </Badge>
                      <span className="text-sm text-green-400">● Active</span>
                    </div>
                  </div>
                  {profile.plan === 'free' ? (
                    <Button className="button-gradient-primary text-white">
                      <Star className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  ) : (
                    <Button variant="outline" className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Plan
                    </Button>
                  )}
                </div>

                {/* Plan Features */}
                <div className="bg-base-dark3/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-text-cream200 mb-3">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getPlanFeatures(profile.plan).map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-accent-teal-500/20 rounded-full">
                            <IconComponent className="w-3 h-3 text-accent-teal-400" />
                          </div>
                          <span className="text-text-cream200">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upgrade CTA for Free Users */}
                {profile.plan === 'free' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-accent-teal-500/10 to-accent-persian-500/10 border border-accent-teal-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-8 h-8 text-accent-persian-500" />
                      <div className="flex-1">
                        <h4 className="font-medium text-text-cream100">Unlock Pro Features</h4>
                        <p className="text-sm text-text-cream300">Get unlimited access to all songs, advanced vocabulary tools, and personalized learning paths</p>
                      </div>
                      <Button className="button-gradient-primary text-white">
                        Upgrade Now
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Timezone */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Timezone</label>
                <Select
                  value={profile.timezone}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger className="bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-base-dark2 border-accent-teal-500/20 max-h-60">
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz} className="text-text-cream100 hover:bg-accent-teal-500/10 focus:bg-accent-teal-500/10">
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logout */}
              <div className="pt-4 border-t border-accent-teal-500/20">
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="frosted-glass border border-accent-teal-500/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-accent-mint-400" />
                <h2 className="text-2xl font-semibold text-text-cream100">Support</h2>
              </div>
              <p className="text-text-cream300 mb-4">Need help? We're here to assist you with any questions.</p>
              <Button
                variant="outline"
                className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AudioraSettings;