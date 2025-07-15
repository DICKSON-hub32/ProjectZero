import React, { useState } from 'react';
import { Search, TrendingUp, Leaf, Droplets, Users, X, Sun, Cpu, Award, Shield, Phone, Mail, MapPin, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../Constants';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    username: '',
    password: '',
    submitted: false
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setData(prev => ({ ...prev, submitted: true }));
      setLoading(true);
      
      const res = await api.post('/api/token/', {
        username: data.username, 
        password: data.password
      });
      
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      
      setData(prev => ({ ...prev, submitted: false }));
      setLoading(false);
      onClose();
      navigate('/'); // Navigate to dashboard or home after login
    } catch (error) {
      setData(prev => ({ ...prev, submitted: false }));
      setLoading(false);
      console.log(error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-scroll">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to shambaSmart</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={data.username}
          />
          
          <input
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={data.password}
          />
          
          {data.submitted ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-semibold"
            >
              Login
            </button>
          )}
          
          <div className="text-center mt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <span 
              className="text-green-600 hover:text-green-700 cursor-pointer font-semibold"
              onClick={() => {
                onClose();
                navigate('/register');
              }}
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AgriGenixLanding() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    console.log('Section ID:', sectionId, 'Element:', element); // Debug
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      console.warn(`Element with ID ${sectionId} not found`);
    }
  };

  return (
<div className="min-h-screen overflow-y-scroll bg-gradient-to-br from-green-50 to-yellow-50 overflow-x-hidden">
{/* Header */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <Leaf className="text-green-600" size={32} />
            <span className="text-xl font-bold text-gray-800">shambaSmart</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-green-600 transition">About us</button>
            <button onClick={() => scrollToSection('solar')} className="text-gray-600 hover:text-green-600 transition">Solar Solutions</button>
            <button onClick={() => scrollToSection('technology')} className="text-gray-600 hover:text-green-600 transition">Technology</button>
            <button onClick={() => scrollToSection('why-choose')} className="text-gray-600 hover:text-green-600 transition">Why Choose Us</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-green-600 transition">Contact Us</button>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className='overflow-y-scroll h-screen'>
      <div className="relative ">
        <div 
          className="h-screen bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2829&q=80')`
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl">
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Revolutionizing Agriculture Ecosystem with Biotechnology
                </h1>
                
                <p className="text-xl text-gray-200 mb-8 max-w-2xl">
                  Explore how shambaSmart is transforming farming with cutting-edge biotech solutions that increase crop yields, reduce environmental impact, and ensure sustainable agriculture.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                  >
                    Learn More
                  </button>
                  <button 
                    onClick={() => scrollToSection('solar')}
                    className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-green-600 transition flex items-center gap-2"
                  >
                    Explore Our Solutions
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Search className="text-green-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">50+</div>
                    <div className="text-gray-300 text-sm">Researches</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Biotech research centers driving innovative agriculture food systems
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="text-green-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">80%+</div>
                    <div className="text-gray-300 text-sm">Improvement</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Increase in crop yield using shambaSmart biotechnology solutions
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Leaf className="text-green-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">500K+</div>
                    <div className="text-gray-300 text-sm">Hectares</div>
                    <div className="text-gray-400 text-xs mt-1">
                      using GMO crops for higher yield and pest resistance with more efficient processes
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="text-green-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">2M+</div>
                    <div className="text-gray-300 text-sm">Farmers</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Utilizing bio-fertilizers and biopesticides for sustainable & effective farming
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About AgriGenix</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading the agricultural revolution through innovative biotechnology solutions that transform traditional farming into sustainable, high-yield ecosystems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                AgriGenix is committed to revolutionizing agriculture through cutting-edge biotechnology. We develop innovative solutions that enhance crop productivity, promote environmental sustainability, and ensure food security for future generations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800">Sustainable Innovation</h4>
                    <p className="text-gray-600">Developing eco-friendly biotechnology solutions that preserve natural resources.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800">Scientific Excellence</h4>
                    <p className="text-gray-600">Leveraging advanced research and development to create breakthrough agricultural technologies.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800">Global Impact</h4>
                    <p className="text-gray-600">Transforming agriculture worldwide to feed growing populations sustainably.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Agricultural Research" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm">Years of Innovation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Solutions Section */}
      <section id="solar" className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Solar Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of the sun with our advanced solar-powered agricultural systems designed for maximum efficiency and sustainability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Sun className="text-white" size={64} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Solar Irrigation Systems</h3>
                <p className="text-gray-600 mb-4">
                  Efficient solar-powered irrigation solutions that reduce energy costs by up to 80% while providing consistent water delivery to crops.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn More</span>
                  <ArrowRight className="ml-2" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Solar Greenhouse" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Solar Greenhouses</h3>
                <p className="text-gray-600 mb-4">
                  Climate-controlled greenhouses powered by solar energy, enabling year-round cultivation with optimal growing conditions.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn More</span>
                  <ArrowRight className="ml-2" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Solar Monitoring" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Solar Monitoring Systems</h3>
                <p className="text-gray-600 mb-4">
                  Advanced solar-powered sensors and monitoring equipment for real-time crop and environmental data collection.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn More</span>
                  <ArrowRight className="ml-2" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">90%</div>
                <div className="text-gray-600">Energy Cost Reduction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">24/7</div>
                <div className="text-gray-600">Continuous Operation</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">15 Years</div>
                <div className="text-gray-600">System Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge biotechnology and AI-powered solutions driving the future of sustainable agriculture.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Cpu className="text-blue-600 mr-3" size={32} />
                  <h3 className="text-xl font-bold text-gray-800">AI-Powered Crop Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Machine learning algorithms analyze crop health, predict yields, and optimize farming practices in real-time.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Disease Detection & Prevention</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Yield Prediction Models</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Resource Optimization</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Leaf className="text-green-600 mr-3" size={32} />
                  <h3 className="text-xl font-bold text-gray-800">Bioengineered Solutions</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Advanced genetic engineering and biotechnology for enhanced crop resilience and nutritional content.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Drought-Resistant Varieties</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Enhanced Nutrition</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Pest Resistance</li>
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Shield className="text-purple-600 mr-3" size={32} />
                  <h3 className="text-xl font-bold text-gray-800">Smart Biosecurity</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Comprehensive biosecurity systems protecting crops from diseases, pests, and environmental threats.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Early Warning Systems</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Automated Response</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Risk Assessment</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Droplets className="text-blue-400 mr-3" size={32} />
                  <h3 className="text-xl font-bold text-gray-800">Precision Agriculture</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  IoT sensors and precision technology for optimal resource management and environmental monitoring.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Soil Monitoring</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Water Management</li>
                  <li className="flex items-center"><CheckCircle className="text-green-600 mr-2" size={16} />Climate Control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Water Conservation" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Water Conservation</h3>
                <p className="text-gray-600 mb-4">
                  Smart irrigation systems help save water while maximizing crop yield.
                </p>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Droplets className="text-green-600" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Soil Health" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Soil Health</h3>
                <p className="text-gray-600 mb-4">
                  Advanced monitoring and control of soil bio markers to enhance healthy soils through mapping to improve yields.
                </p>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="text-green-600" size={16} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Waste Reduction" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Waste Reduction</h3>
                <p className="text-gray-600 mb-4">
                  Leveraging bio-based and composting technologies to reduce agricultural waste and soil to products.
                </p>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose" className="py-20 bg-gradient-to-br from-green-50 to-blue-50 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose AgriGenix</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the advantages that make AgriGenix the preferred partner for sustainable agricultural transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Proven Results</h3>
              <p className="text-gray-600 mb-4">
                Over 15 years of successful implementations with measurable improvements in crop yields and sustainability metrics.
              </p>
              <div className="flex items-center justify-center">
                <Star className="text-yellow-400 mr-1" size={16} />
                <Star className="text-yellow-400 mr-1" size={16} />
                <Star className="text-yellow-400 mr-1" size={16} />
                <Star className="text-yellow-400 mr-1" size={16} />
                <Star className="text-yellow-400" size={16} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Expert Support</h3>
              <p className="text-gray-600 mb-4">
                Dedicated team of agricultural scientists and biotechnology experts providing 24/7 support and guidance.
              </p>
              <div className="text-blue-600 font-semibold">2M+ Farmers Served</div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Sustainable Innovation</h3>
              <p className="text-gray-600 mb-4">
                Environmental responsibility at the core of every solution, ensuring a sustainable future for agriculture.
              </p>
              <div className="text-purple-600 font-semibold">Carbon Neutral by 2030</div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Advanced Security</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive biosecurity measures protecting your crops and data with cutting-edge technology.
              </p>
              <div className="text-red-600 font-semibold">99.9% Uptime Guarantee</div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Cost Effective</h3>
              <p className="text-gray-600 mb-4">
                Maximize your ROI with solutions that reduce operational costs while increasing productivity.
              </p>
              <div className="text-yellow-600 font-semibold">80% Cost Reduction</div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cpu className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Technology</h3>
              <p className="text-gray-600 mb-4">
                AI-powered systems that learn and adapt to your specific farming conditions for optimal results.
              </p>
              <div className="text-indigo-600 font-semibold">Next-Gen AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to transform your agricultural operations? Contact our experts today for a personalized consultation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  rows="4"
                  placeholder="Your Message"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Phone</h4>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                      <p className="text-gray-300">+1 (555) 987-6543</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Email</h4>
                      <p className="text-gray-300">info@agrigenix.com</p>
                      <p className="text-gray-300">support@agrigenix.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Address</h4>
                      <p className="text-gray-300">
                        123 Agriculture Innovation Drive<br />
                        Green Valley, CA 94041<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4">Business Hours</h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="text-green-600" size={32} />
                <span className="text-xl font-bold">AgriGenix</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transforming agriculture through innovative biotechnology solutions for a sustainable future.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Solar Systems</a></li>
                <li><a href="#" className="hover:text-white transition">Biotechnology</a></li>
                <li><a href="#" className="hover:text-white transition">AI Analytics</a></li>
                <li><a href="#" className="hover:text-white transition">Precision Agriculture</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition">Research Papers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">News</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 AgriGenix. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}