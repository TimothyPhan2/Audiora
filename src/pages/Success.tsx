import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserSubscription } from '@/lib/stripe';
import { getProductByPriceId } from '@/stripe-config';
import { useAuthStore } from '@/stores/authStore';

export function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscriptionData = await getUserSubscription();
        setSubscription(subscriptionData);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, navigate]);

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="frosted-glass p-8 md:p-12 rounded-2xl border border-accent-teal-500/20 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Payment Successful!</span> 🎉
            </h1>
            <p className="text-lg text-text-cream300 mb-2">
              Welcome to Audiora Pro!
            </p>
            <p className="text-text-cream400">
              Your subscription has been activated and you now have access to all premium features.
            </p>
          </motion.div>

          {/* Subscription Details */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-6 bg-accent-teal-500/10 rounded-xl border border-accent-teal-500/20"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-accent-teal-500/20 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-accent-teal-500/20 rounded w-1/2 mx-auto"></div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-6 bg-red-500/10 rounded-xl border border-red-500/20"
            >
              <p className="text-red-400">{error}</p>
            </motion.div>
          ) : subscription && product ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-6 bg-accent-teal-500/10 rounded-xl border border-accent-teal-500/20"
            >
              <h3 className="text-xl font-semibold text-text-cream100 mb-2">
                {product.name}
              </h3>
              <p className="text-text-cream300 mb-4">
                ${product.price} / {product.interval}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-text-cream400">
                <Sparkles className="w-4 h-4" />
                <span>Status: {subscription.subscription_status}</span>
              </div>
            </motion.div>
          ) : null}

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-text-cream100 mb-4">
              What's included in your Pro subscription:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-cream300">
              {product?.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('/dashboard')}
              className="button-gradient-primary text-white flex items-center gap-2 px-6 py-3"
            >
              <Music className="w-4 h-4" />
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => navigate('/lessons')}
              variant="outline"
              className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10 px-6 py-3"
            >
              Browse Songs
            </Button>
          </motion.div>

          {/* Session ID for reference */}
          {sessionId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 pt-6 border-t border-accent-teal-500/20"
            >
              <p className="text-xs text-text-cream400">
                Session ID: {sessionId}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}