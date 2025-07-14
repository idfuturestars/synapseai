import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Activity,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MarketAnalysis = () => {
  const { user } = useAuth();
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Market Analysis</h1>
          <p className="text-gray-300">Advanced market intelligence powered by multi-AI systems</p>
        </div>

        {/* AI Status Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">AI Systems Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiStatus && Object.entries(aiStatus).map(([provider, status]) => (
              <div key={provider} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getAIStatusIcon(status.status)}
                  <div>
                    <p className="text-white font-medium capitalize">{provider}</p>
                    <p className="text-gray-300 text-sm">{status.model}</p>
                  </div>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  status.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {status.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Symbol Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Select Symbol</h2>
              <div className="space-y-3">
                {symbols.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedSymbol === item.symbol
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.symbol}</p>
                        <p className="text-sm opacity-75">{item.name}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded">
                        {item.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Symbols */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Trending Crypto</h2>
              <div className="space-y-2">
                {trendingSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className="w-full p-2 text-left text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Market Data */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Market Data - {selectedSymbol}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchMarketData}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={runAIAnalysis}
                    disabled={analysisLoading || !marketData}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
                  >
                    <Brain className={`w-4 h-4 ${analysisLoading ? 'animate-spin' : ''}`} />
                    <span>AI Analysis</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : marketData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Current Price</span>
                      <span className="text-white font-bold text-lg">
                        ${marketData.data.current_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <span className="text-gray-300">24h Change</span>
                      <span className={`font-bold ${
                        marketData.data.price_change_percent_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {marketData.data.price_change_percent_24h >= 0 ? '+' : ''}
                        {marketData.data.price_change_percent_24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <span className="text-gray-300">24h Volume</span>
                      <span className="text-white font-bold">
                        ${marketData.data.volume_24h.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h3 className="text-white font-bold mb-2">Technical Indicators</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">RSI</span>
                          <span className="text-white">{marketData.data.technical_indicators?.rsi || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">SMA 20</span>
                          <span className="text-white">{marketData.data.technical_indicators?.sma_20 || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Volatility</span>
                          <span className="text-white">{marketData.data.technical_indicators?.volatility || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg">
                      <h3 className="text-white font-bold mb-2">Market Sentiment</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Overall</span>
                          <span className={`font-bold capitalize ${getSentimentColor(marketData.data.market_sentiment?.overall_sentiment)}`}>
                            {marketData.data.market_sentiment?.overall_sentiment || 'Neutral'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Fear & Greed</span>
                          <span className="text-white">{marketData.data.market_sentiment?.fear_greed_index || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No market data available</p>
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">AI Analysis Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Market Analysis */}
                  {aiAnalysis.market_analysis && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Market Analysis</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Sentiment</p>
                          <p className={`font-bold capitalize ${getSentimentColor(aiAnalysis.market_analysis.sentiment)}`}>
                            {aiAnalysis.market_analysis.sentiment}
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Confidence</p>
                          <p className="text-white font-bold">
                            {(aiAnalysis.market_analysis.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Key Insights</p>
                          <ul className="text-white text-sm space-y-1">
                            {aiAnalysis.market_analysis.key_insights.map((insight, index) => (
                              <li key={index}>• {insight}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {aiAnalysis.risk_assessment && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Risk Assessment</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Risk Level</p>
                          <p className={`font-bold capitalize ${
                            aiAnalysis.risk_assessment.risk_level === 'high' ? 'text-red-400' :
                            aiAnalysis.risk_assessment.risk_level === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {aiAnalysis.risk_assessment.risk_level}
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Risk Score</p>
                          <p className="text-white font-bold">
                            {aiAnalysis.risk_assessment.risk_score.toFixed(1)}/100
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Risk Factors</p>
                          <ul className="text-white text-sm space-y-1">
                            {aiAnalysis.risk_assessment.risk_factors.map((factor, index) => (
                              <li key={index}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trading Strategy */}
                  {aiAnalysis.trading_strategy && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>Trading Strategy</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Strategy</p>
                          <p className="text-white font-bold">
                            {aiAnalysis.trading_strategy.strategy_name}
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Type</p>
                          <p className="text-white font-bold capitalize">
                            {aiAnalysis.trading_strategy.strategy_type}
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Expected Return</p>
                          <p className="text-green-400 font-bold">
                            {(aiAnalysis.trading_strategy.expected_return * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">Entry Signals</p>
                          <ul className="text-white text-sm space-y-1">
                            {aiAnalysis.trading_strategy.entry_signals.map((signal, index) => (
                              <li key={index}>• {signal}</li>
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
      </div>
    </div>
  );
};

export default MarketAnalysis;