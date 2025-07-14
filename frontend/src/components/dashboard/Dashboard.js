import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Settings, 
  LogOut, 
  Brain, 
  Activity,
  DollarSign,
  Users,
  Clock,
  Search,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SynapseTrade AI™</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-300 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/market-analysis')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Market Analysis
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                Strategies
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                Portfolio
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trading Dashboard</h1>
          <p className="text-gray-300">Monitor your autonomous trading performance and AI insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Trades</p>
                <p className="text-2xl font-bold text-white">{dashboardData.user_stats.total_trades}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Strategies</p>
                <p className="text-2xl font-bold text-white">{dashboardData.user_stats.total_strategies}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Account Status</p>
                <p className="text-2xl font-bold text-white capitalize">{dashboardData.user_stats.account_status}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Market Score</p>
                <p className="text-2xl font-bold text-green-400">
                  {dashboardData.market_overview.fear_greed_index?.toFixed(0) || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Trading Status */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">AI Systems Status</h2>
              <div className="space-y-4">
                {dashboardData.ai_status && Object.entries(dashboardData.ai_status).map(([provider, status]) => (
                  <div key={provider} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getAIStatusIcon(status.status)}
                      <div>
                        <span className="text-white font-medium capitalize">{provider}</span>
                        <div className="text-gray-300 text-sm">
                          {status.model} - {status.capabilities?.join(', ')}
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      status.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {status.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Overview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Market Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Market Sentiment</h3>
                  <p className={`text-lg font-bold capitalize ${
                    dashboardData.market_overview.market_sentiment === 'bullish' ? 'text-green-400' :
                    dashboardData.market_overview.market_sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {dashboardData.market_overview.market_sentiment || 'Neutral'}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Active Symbols</h3>
                  <p className="text-lg font-bold text-white">
                    {dashboardData.market_overview.positive_symbols || 0} / {
                      (dashboardData.market_overview.positive_symbols || 0) + 
                      (dashboardData.market_overview.negative_symbols || 0)
                    }
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Volatility Index</h3>
                  <p className="text-lg font-bold text-white">
                    {dashboardData.market_overview.volatility_index?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/market-analysis')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Market Analysis</span>
                </button>
                <button className="w-full bg-white/20 border border-white/30 text-white py-3 px-4 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Create Strategy</span>
                </button>
                <button className="w-full bg-white/20 border border-white/30 text-white py-3 px-4 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>View Portfolio</span>
                </button>
                <button className="w-full bg-white/20 border border-white/30 text-white py-3 px-4 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Risk Assessment</span>
                </button>
              </div>
            </div>

            {/* Recent Analyses */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Analyses</h2>
              <div className="space-y-3">
                {dashboardData.recent_analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No recent analyses</p>
                    <p className="text-gray-500 text-sm">Your AI analyses will appear here</p>
                  </div>
                ) : (
                  dashboardData.recent_analyses.map((analysis, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{analysis.symbol}</p>
                          <p className="text-gray-300 text-sm">{analysis.analysis_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">
                            {new Date(analysis.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Account Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Email:</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Provider:</span>
                  <span className="text-white capitalize">{user?.provider || 'Email'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Member Since:</span>
                  <span className="text-white">
                    {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-green-400">Active</span>
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