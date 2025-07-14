import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  BarChart3, 
  LogOut, 
  Brain, 
  Activity,
  TrendingUp,
  Search,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    user_stats: {
      total_trades: 0,
      total_strategies: 0,
      recent_activity: [],
      account_status: 'active'
    },
    ai_status: {},
    market_overview: {},
    recent_analyses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/data');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getAIStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-black">SynapseTrade AI™</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-black font-medium border-b-2 border-black pb-1"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/market-analysis')}
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  Analysis
                </button>
                <button className="text-gray-500 hover:text-black transition-colors">
                  Strategies
                </button>
                <button className="text-gray-500 hover:text-black transition-colors">
                  Portfolio
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Welcome back,</div>
                <div className="font-medium text-black">{user?.full_name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Trading Dashboard</h1>
          <p className="text-gray-600">Monitor your autonomous trading performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Trades</p>
                <p className="text-3xl font-bold text-black">{dashboardData.user_stats.total_trades}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Active Strategies</p>
                <p className="text-3xl font-bold text-black">{dashboardData.user_stats.total_strategies}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Account Status</p>
                <p className="text-3xl font-bold text-black capitalize">{dashboardData.user_stats.account_status}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Market Score</p>
                <p className="text-3xl font-bold text-black">
                  {dashboardData.market_overview.fear_greed_index?.toFixed(0) || 'N/A'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Systems Status */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-black mb-6">AI Systems Status</h2>
              <div className="space-y-4">
                {dashboardData.ai_status && Object.entries(dashboardData.ai_status).map(([provider, status]) => (
                  <div key={provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getAIStatusIcon(status.status)}
                      <div>
                        <div className="font-medium text-black capitalize">{provider}</div>
                        <div className="text-gray-500 text-sm">
                          {status.model} • {status.capabilities?.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      status.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {status.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Overview */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-6">Market Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black mb-1">
                    {dashboardData.market_overview.market_sentiment === 'bullish' ? '↗' :
                     dashboardData.market_overview.market_sentiment === 'bearish' ? '↘' : '→'}
                  </div>
                  <div className="text-sm text-gray-600">Market Sentiment</div>
                  <div className="text-sm font-medium text-black capitalize mt-1">
                    {dashboardData.market_overview.market_sentiment || 'Neutral'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black mb-1">
                    {dashboardData.market_overview.positive_symbols || 0}
                  </div>
                  <div className="text-sm text-gray-600">Positive Symbols</div>
                  <div className="text-sm font-medium text-black mt-1">
                    of {((dashboardData.market_overview.positive_symbols || 0) + 
                         (dashboardData.market_overview.negative_symbols || 0)) || 0}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-black mb-1">
                    {dashboardData.market_overview.volatility_index?.toFixed(0) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Volatility Index</div>
                  <div className="text-sm font-medium text-black mt-1">Current</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/market-analysis')}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Market Analysis</span>
                </button>
                <button className="w-full border border-gray-300 text-black py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Strategy</span>
                </button>
                <button className="w-full border border-gray-300 text-black py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>View Portfolio</span>
                </button>
                <button className="w-full border border-gray-300 text-black py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Risk Assessment</span>
                </button>
              </div>
            </div>

            {/* Recent Analyses */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-6">Recent Analyses</h2>
              <div className="space-y-4">
                {dashboardData.recent_analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent analyses</p>
                    <p className="text-gray-400 text-xs mt-1">Your AI analyses will appear here</p>
                  </div>
                ) : (
                  dashboardData.recent_analyses.map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{analysis.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium text-black">{analysis.symbol}</div>
                          <div className="text-gray-500 text-sm">{analysis.analysis_type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-xs">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-6">Account Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Email</span>
                  <span className="text-black font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Provider</span>
                  <span className="text-black font-medium capitalize">{user?.provider || 'Email'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Member Since</span>
                  <span className="text-black font-medium">
                    {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-medium flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;