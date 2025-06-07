import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Music, Brain, BookMarked, ListChecks, GraduationCap } from 'lucide-react';
import { landingFeatures, learningSteps } from '@/lib/mockData';

export function Landing() {
  // Hero section text animation references
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Feature sections with IntersectionObserver for animations
  const [stepsRef, stepsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [songSectionRef, songSectionInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
  // Text typing animation for hero section
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.classList.add('animate-fade-in');
    }
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 hero-gradient text-white overflow-hidden">
        {/* Positioned Image with Hyperlink */}
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-[calc(4rem+20px)] right-4 z-10 hover:opacity-80 transition-opacity duration-300"
        >
          <img 
            src="/white_circle_360x360.png" 
            alt="Powered by Bolt.new" 
            className="max-w-[30vw] sm:max-w-[25vw] md:max-w-[20vw] lg:max-w-[15vw] xl:max-w-[12vw] h-auto object-contain"
          />
        </a>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,195,154,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(2,195,154,0.12),transparent_50%)]"></div>
          {/* Floating Music Notes */}
          <div className="floating-note text-teal-400 text-4xl" style={{ left: '10%', top: '20%', textShadow: '0 0 10px rgba(2,128,144,0.5)' }}>♪</div>
          <div className="floating-note text-mint-400 text-3xl" style={{ left: '25%', top: '40%', textShadow: '0 0 10px rgba(2,195,154,0.5)' }}>♫</div>
          <div className="floating-note text-persian_green-400 text-5xl" style={{ left: '45%', top: '15%', textShadow: '0 0 10px rgba(0,168,150,0.5)' }}>♩</div>
          <div className="floating-note text-teal-400 text-4xl" style={{ left: '65%', top: '35%', textShadow: '0 0 10px rgba(2,128,144,0.5)' }}>♬</div>
          <div className="floating-note text-mint-400 text-3xl" style={{ left: '85%', top: '25%', textShadow: '0 0 10px rgba(2,195,154,0.5)' }}>♪</div>
          </div>
        
        
        <div className="container-center relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 
              ref={titleRef}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-white via-cream-200 to-cream-400"
            >
             Learn Languages with AI & Music
            </h1>
            
            <p className="text-lg md:text-xl text-cream-200 max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Audiora combines music with AI-powered insights for natural, effective language learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-teal-600 to-persian_green-600 hover:from-teal-700 hover:to-persian_green-700 text-white font-medium px-8 py-6 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="bg-transparent border-teal-400/30 text-teal-200 hover:bg-teal-500/10 px-8 py-6 text-lg">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-[#0c0a1d]">
        <div className="container-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-persian_green-500 bg-clip-text text-transparent">
              How Audiora Works
            </h2>
            <p className="text-lg text-cream-300 max-w-2xl mx-auto">
              Three simple steps to start learning your target language through music
            </p>
          </div>
          
          <div 
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {learningSteps.map((step, index) => {
              const IconComponent = {
                'Music': Music,
                'Brain': Brain,
                'GraduationCap': GraduationCap
              }[step.icon] || Music;
              
              return (
                <div key={step.id} 
                  className={`card transform transition-all duration-700 delay-${index * 150} ${
                    stepsInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="card-gradient backdrop-blur-sm p-6 rounded-xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-cream-100">{step.title}</h3>
                    <p className="text-cream-300">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Feature Highlights Section */}
      <section className="py-20 bg-[#0c0a1d]">
        <div className="container-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-persian_green-500 bg-clip-text text-transparent">
              Powerful Features for Effective Learning
            </h2>
            <p className="text-lg text-cream-300 max-w-2xl mx-auto">
              Everything you need to master a new language through music
            </p>
          </div>
          
          <div 
            ref={featuresRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {landingFeatures.map((feature, index) => {
              const IconComponent = {
                'Music': Music,
                'Brain': Brain,
                'BookMarked': BookMarked,
                'ListChecks': ListChecks
              }[feature.icon] || Music;
              
              return (
                <div
                  key={feature.id}
                  className={`card transform transition-all duration-700 delay-${index * 150} ${
                    featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="card-gradient backdrop-blur-sm p-6 rounded-xl flex items-start">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-cream-100">{feature.title}</h3>
                      <p className="text-cream-300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Song Discovery Section */}
      <section 
        ref={songSectionRef}
        className="py-20 bg-[#0c0a1d]"
      >
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-persian_green-500 bg-clip-text text-transparent">
              Discover Songs in Your Target Language
            </h2>
            <p className="text-lg text-cream-300 max-w-2xl mx-auto">
              Browse our extensive library of songs across different languages, genres, and difficulty levels.
            </p>
          </div>
          
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${songSectionInView ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Song Cards - These would be dynamic in the real app */}
            <div className="card-gradient backdrop-blur-sm rounded-xl group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden mb-4">
                <img 
                  src="https://images.pexels.com/photos/1001850/pexels-photo-1001850.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Despacito by Luis Fonsi" 
                  className="w-full h-48 object-cover rounded-md transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-white text-sm">Spanish • Beginner</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-white">Despacito</h3>
                <p className="text-cream-300 mb-3">Luis Fonsi</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cream-400">Pop</span>
                <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                  Learn Now
                </Button>
              </div>
              </div>
            </div>
            
            <div className="card-gradient backdrop-blur-sm rounded-xl group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden mb-4">
                <img 
                  src="https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="La Vie En Rose by Edith Piaf" 
                  className="w-full h-48 object-cover rounded-md transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-white text-sm">French • Intermediate</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-white">La Vie En Rose</h3>
                <p className="text-cream-300 mb-3">Edith Piaf</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cream-400">Classic</span>
                <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                  Learn Now
                </Button>
              </div>
              </div>
            </div>
            
            <div className="card-gradient backdrop-blur-sm rounded-xl group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden mb-4">
                <img 
                  src="https://images.pexels.com/photos/4087996/pexels-photo-4087996.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Je Veux by Zaz" 
                  className="w-full h-48 object-cover rounded-md transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-white text-sm">French • Advanced</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-white">Je Veux</h3>
                <p className="text-cream-300 mb-3">Zaz</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cream-400">Jazz</span>
                <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                  Learn Now
                </Button>
              </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-teal-600 to-persian_green-600 hover:from-teal-700 hover:to-persian_green-700 text-white px-8">
                Explore All Songs
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,195,154,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(2,195,154,0.12),transparent_50%)]"></div>
        </div>
        <div className="container-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Learning Languages Through Music Today
          </h2>
          <p className="text-lg text-cream-200 max-w-2xl mx-auto mb-8">
            Experience the future of language learning with our AI-powered music platform.
          </p>
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-persian_green-600 hover:from-teal-700 hover:to-persian_green-700 text-white font-medium px-8 py-6 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}