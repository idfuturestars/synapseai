import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  TrendingUp, 
  Brain, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Activity,
  Shield
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MarketAnalysis = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [marketData, setMarketData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [trendingSymbols, setTrendingSymbols] = useState([]);

  const symbols = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { symbol: 'AAPL', name: 'Apple', type: 'stock' },
    { symbol: 'GOOGL', name: 'Google', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
    { symbol: 'EUR/USD', name: 'Euro/Dollar', type: 'forex' }
  ];

  useEffect(() => {
    fetchAIStatus();
    fetchMarketData();
    fetchTrendingSymbols();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchMarketData();
    }
  }, [selectedSymbol]);

  const fetchAIStatus = async () => {
    try {
      const response = await axios.get('/api/ai/status');
      setAiStatus(response.data.ai_systems);
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    }
  };

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/market/data', {
        symbol: selectedSymbol,
        timeframe: '1h'
      });
      setMarketData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingSymbols = async () => {
    try {
      const response = await axios.get('/api/market/trending/crypto');
      setTrendingSymbols(response.data.trending_symbols);
    } catch (error) {
      console.error('Failed to fetch trending symbols:', error);
    }
  };

  const runAIAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const response = await axios.post('/api/ai/analyze', {
        symbol: selectedSymbol,
        analysis_type: 'comprehensive',
        include_risk_assessment: true,
        include_strategy: true
      });
      setAiAnalysis(response.data.analysis);
      toast.success('AI analysis completed successfully!');
    } catch (error) {
      console.error('Failed to run AI analysis:', error);
      toast.error('Failed to run AI analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getAIStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600';
      case 'bearish':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

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
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/market-analysis')}
                  className="text-black font-medium border-b-2 border-black pb-1"
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
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Market Analysis</h1>
          <p className="text-gray-600">Advanced AI-powered market intelligence</p>
        </div>

        {/* AI Status Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-black mb-4">AI Systems Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiStatus && Object.entries(aiStatus).map(([provider, status]) => (
              <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getAIStatusIcon(status.status)}
                  <div>
                    <div className="font-medium text-black capitalize">{provider}</div>
                    <div className="text-gray-500 text-sm">{status.model}</div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  status.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {status.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Symbol Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-black mb-4">Select Symbol</h2>
              <div className="space-y-2">
                {symbols.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedSymbol === item.symbol
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-black hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-sm opacity-75">{item.name}</div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-white/20 rounded uppercase">
                        {item.type}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Symbols */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-black mb-4">Trending Crypto</h2>
              <div className="space-y-2">
                {trendingSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className="w-full p-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Market Data */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-black">Market Data • {selectedSymbol}</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchMarketData}
                    disabled={loading}
                    className="flex items-center space-x-2 border border-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={runAIAnalysis}
                    disabled={analysisLoading || !marketData}
                    className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Brain className={`w-4 h-4 ${analysisLoading ? 'animate-spin' : ''}`} />
                    <span>AI Analysis</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : marketData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Current Price</span>
                      <span className="text-black font-bold text-lg">
                        ${marketData.data.current_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">24h Change</span>
                      <span className={`font-bold ${
                        marketData.data.price_change_percent_24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {marketData.data.price_change_percent_24h >= 0 ? '+' : ''}
                        {marketData.data.price_change_percent_24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">24h Volume</span>
                      <span className="text-black font-bold">
                        ${marketData.data.volume_24h.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-black font-bold mb-3">Technical Indicators</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">RSI</span>
                          <span className="text-black font-medium">{marketData.data.technical_indicators?.rsi || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SMA 20</span>
                          <span className="text-black font-medium">{marketData.data.technical_indicators?.sma_20 || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Volatility</span>
                          <span className="text-black font-medium">{marketData.data.technical_indicators?.volatility || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-black font-bold mb-3">Market Sentiment</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall</span>
                          <span className={`font-bold capitalize ${getSentimentColor(marketData.data.market_sentiment?.overall_sentiment)}`}>
                            {marketData.data.market_sentiment?.overall_sentiment || 'Neutral'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fear & Greed</span>
                          <span className="text-black font-medium">{marketData.data.market_sentiment?.fear_greed_index || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No market data available</p>
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-black mb-6">AI Analysis Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Market Analysis */}
                  {aiAnalysis.market_analysis && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-black flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Market Analysis</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Sentiment</div>
                          <div className={`font-bold capitalize ${getSentimentColor(aiAnalysis.market_analysis.sentiment)}`}>
                            {aiAnalysis.market_analysis.sentiment}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Confidence</div>
                          <div className="text-black font-bold">
                            {(aiAnalysis.market_analysis.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-2">Key Insights</div>
                          <ul className="text-black text-sm space-y-1">
                            {aiAnalysis.market_analysis.key_insights.map((insight, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {aiAnalysis.risk_assessment && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-black flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Risk Assessment</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Risk Level</div>
                          <div className={`font-bold capitalize ${
                            aiAnalysis.risk_assessment.risk_level === 'high' ? 'text-red-600' :
                            aiAnalysis.risk_assessment.risk_level === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {aiAnalysis.risk_assessment.risk_level}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Risk Score</div>
                          <div className="text-black font-bold">
                            {aiAnalysis.risk_assessment.risk_score.toFixed(1)}/100
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-2">Risk Factors</div>
                          <ul className="text-black text-sm space-y-1">
                            {aiAnalysis.risk_assessment.risk_factors.map((factor, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trading Strategy */}
                  {aiAnalysis.trading_strategy && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-black flex items-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>Trading Strategy</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Strategy</div>
                          <div className="text-black font-bold">
                            {aiAnalysis.trading_strategy.strategy_name}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Type</div>
                          <div className="text-black font-bold capitalize">
                            {aiAnalysis.trading_strategy.strategy_type}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">Expected Return</div>
                          <div className="text-green-600 font-bold">
                            {(aiAnalysis.trading_strategy.expected_return * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-600 text-sm mb-2">Entry Signals</div>
                          <ul className="text-black text-sm space-y-1">
                            {aiAnalysis.trading_strategy.entry_signals.map((signal, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{signal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketAnalysis;