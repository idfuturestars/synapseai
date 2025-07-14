import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Brain, CheckCircle, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">SynapseTrade AI™</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="text-gray-600 hover:text-black transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-black mb-6 leading-tight">
            Autonomous
            <br />
            Trading
            <br />
            <span className="text-gray-400">Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            SynapseTrade AI™ fuses deep-learning with institutional-grade controls, 
            delivering next-generation alpha through autonomous trading intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Trading</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="border border-gray-300 text-black px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Built for Modern Trading
            </h2>
            <p className="text-xl text-gray-600">
              Advanced AI technology meets institutional-grade infrastructure
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced neural networks analyze market patterns with unprecedented accuracy, 
                identifying opportunities in real-time.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Institutional Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-grade security with blockchain transparency, ensuring complete 
                protection and audit trails for every transaction.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Synapse-level processing speed ensures you never miss profitable 
                opportunities in volatile markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-2">$2.4B+</div>
              <div className="text-gray-600">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-2">50K+</div>
              <div className="text-gray-600">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-12">
            Trusted by Leading Traders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-black">Sarah Chen</div>
                  <div className="text-gray-600">Quantitative Analyst</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "The AI analysis is incredibly accurate. I've seen a 340% improvement 
                in my trading performance since switching to SynapseTrade AI™."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-black">Michael Rodriguez</div>
                  <div className="text-gray-600">Portfolio Manager</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "The risk management features are institutional-grade. Perfect for 
                managing large portfolios with confidence."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-black">Emma Thompson</div>
                  <div className="text-gray-600">Hedge Fund Analyst</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "The blockchain transparency gives our clients complete confidence. 
                It's the future of trading platforms."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-12 text-center">
            Everything you need to trade smarter
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-2">Real-time Analysis</h3>
                  <p className="text-gray-600">Advanced AI analyzes market conditions in real-time</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-2">Risk Management</h3>
                  <p className="text-gray-600">Institutional-grade risk controls and monitoring</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-2">Automated Strategies</h3>
                  <p className="text-gray-600">AI-generated trading strategies optimized for your goals</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-2">Blockchain Security</h3>
                  <p className="text-gray-600">Complete transparency with immutable transaction records</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-2">Multi-Asset Support</h3>
                  <p className="text-gray-600">Trade across crypto, stocks, forex, and commodities</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-2">24/7 Monitoring</h3>
                  <p className="text-gray-600">Continuous market monitoring and opportunity detection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of traders using SynapseTrade AI™ to maximize profits with minimal risk.
          </p>
          <Link 
            to="/register" 
            className="bg-white text-black px-12 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">SynapseTrade AI™</span>
            </div>
            <p className="text-gray-500">
              © 2025 SynapseTrade AI™. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;