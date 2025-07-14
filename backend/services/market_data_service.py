"""
Market Data Service for SynapseTrade AI™
Handles market data collection and processing
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import random
import httpx

logger = logging.getLogger(__name__)

class MarketDataService:
    """Service for fetching and processing market data"""
    
    def __init__(self):
        self.data_sources = {
            "crypto": ["binance", "coinbase", "kraken"],
            "stocks": ["yahoo", "alpha_vantage", "polygon"],
            "forex": ["fxcm", "oanda", "mt5"]
        }
    
    async def get_market_data(self, symbol: str, timeframe: str = "1h") -> Dict[str, Any]:
        """Get market data for a symbol"""
        try:
            # For demo purposes, we'll generate realistic market data
            # In production, this would fetch from real APIs
            market_data = await self._generate_demo_market_data(symbol, timeframe)
            
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "timestamp": datetime.utcnow().isoformat(),
                "data": market_data,
                "source": "demo_api",
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Failed to fetch market data for {symbol}: {e}")
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "status": "error"
            }
    
    async def _generate_demo_market_data(self, symbol: str, timeframe: str) -> Dict[str, Any]:
        """Generate demo market data for testing"""
        base_price = self._get_base_price(symbol)
        
        # Generate OHLCV data
        ohlcv_data = []
        current_price = base_price
        
        for i in range(24):  # Last 24 periods
            open_price = current_price
            high_price = open_price * (1 + random.uniform(0, 0.03))
            low_price = open_price * (1 - random.uniform(0, 0.03))
            close_price = open_price * (1 + random.uniform(-0.02, 0.02))
            volume = random.uniform(1000000, 5000000)
            
            ohlcv_data.append({
                "timestamp": (datetime.utcnow() - timedelta(hours=24-i)).isoformat(),
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": round(volume, 2)
            })
            
            current_price = close_price
        
        # Calculate technical indicators
        prices = [candle["close"] for candle in ohlcv_data]
        technical_indicators = self._calculate_technical_indicators(prices)
        
        return {
            "current_price": round(current_price, 2),
            "price_change_24h": round(current_price - base_price, 2),
            "price_change_percent_24h": round(((current_price - base_price) / base_price) * 100, 2),
            "volume_24h": sum(candle["volume"] for candle in ohlcv_data),
            "market_cap": round(current_price * 1000000000, 2),  # Mock market cap
            "ohlcv": ohlcv_data,
            "technical_indicators": technical_indicators,
            "market_sentiment": self._get_market_sentiment(symbol)
        }
    
    def _get_base_price(self, symbol: str) -> float:
        """Get base price for different symbols"""
        base_prices = {
            "BTC": 45000,
            "ETH": 2800,
            "AAPL": 180,
            "GOOGL": 140,
            "TSLA": 250,
            "MSFT": 400,
            "EUR/USD": 1.08,
            "GBP/USD": 1.25,
            "USD/JPY": 145
        }
        return base_prices.get(symbol, 100)
    
    def _calculate_technical_indicators(self, prices: List[float]) -> Dict[str, Any]:
        """Calculate basic technical indicators"""
        if len(prices) < 14:
            return {}
        
        # Simple Moving Average (SMA)
        sma_10 = sum(prices[-10:]) / 10
        sma_20 = sum(prices[-20:]) / 20 if len(prices) >= 20 else sma_10
        
        # Relative Strength Index (RSI) - simplified calculation
        price_changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        gains = [change if change > 0 else 0 for change in price_changes]
        losses = [-change if change < 0 else 0 for change in price_changes]
        
        avg_gain = sum(gains[-14:]) / 14
        avg_loss = sum(losses[-14:]) / 14
        
        rs = avg_gain / avg_loss if avg_loss != 0 else 0
        rsi = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        sma_20_full = sum(prices[-20:]) / 20 if len(prices) >= 20 else sma_10
        variance = sum((price - sma_20_full) ** 2 for price in prices[-20:]) / 20
        std_dev = variance ** 0.5
        
        return {
            "sma_10": round(sma_10, 2),
            "sma_20": round(sma_20, 2),
            "rsi": round(rsi, 2),
            "bollinger_upper": round(sma_20_full + (2 * std_dev), 2),
            "bollinger_lower": round(sma_20_full - (2 * std_dev), 2),
            "bollinger_middle": round(sma_20_full, 2),
            "macd": round(random.uniform(-5, 5), 2),  # Mock MACD
            "signal_line": round(random.uniform(-3, 3), 2),
            "volatility": round(std_dev, 2)
        }
    
    def _get_market_sentiment(self, symbol: str) -> Dict[str, Any]:
        """Get market sentiment data"""
        sentiments = ["bullish", "bearish", "neutral"]
        sentiment = random.choice(sentiments)
        
        return {
            "overall_sentiment": sentiment,
            "sentiment_score": round(random.uniform(0, 100), 1),
            "bullish_percentage": round(random.uniform(30, 70), 1),
            "bearish_percentage": round(random.uniform(20, 50), 1),
            "neutral_percentage": round(random.uniform(10, 30), 1),
            "fear_greed_index": round(random.uniform(0, 100), 1),
            "social_volume": round(random.uniform(1000, 10000), 0)
        }
    
    async def get_multiple_symbols(self, symbols: List[str]) -> Dict[str, Any]:
        """Get market data for multiple symbols"""
        try:
            tasks = [self.get_market_data(symbol) for symbol in symbols]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            successful_results = {}
            failed_results = {}
            
            for symbol, result in zip(symbols, results):
                if isinstance(result, Exception):
                    failed_results[symbol] = str(result)
                else:
                    successful_results[symbol] = result
            
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "successful_symbols": len(successful_results),
                "failed_symbols": len(failed_results),
                "data": successful_results,
                "errors": failed_results
            }
            
        except Exception as e:
            logger.error(f"Failed to fetch multiple symbols: {e}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "status": "error"
            }
    
    async def get_trending_symbols(self, market_type: str = "crypto") -> List[str]:
        """Get trending symbols for a market type"""
        trending_symbols = {
            "crypto": ["BTC", "ETH", "BNB", "ADA", "SOL", "DOT", "AVAX", "MATIC"],
            "stocks": ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NFLX", "NVDA"],
            "forex": ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CAD", "AUD/USD", "USD/CHF"]
        }
        
        return trending_symbols.get(market_type, ["BTC", "ETH", "AAPL"])
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """Get overall market overview"""
        try:
            # Get data for major symbols
            major_symbols = ["BTC", "ETH", "AAPL", "GOOGL", "EUR/USD"]
            market_data = await self.get_multiple_symbols(major_symbols)
            
            # Calculate market statistics
            total_volume = 0
            positive_changes = 0
            negative_changes = 0
            
            for symbol, data in market_data["data"].items():
                if data["status"] == "success":
                    volume = data["data"]["volume_24h"]
                    price_change = data["data"]["price_change_percent_24h"]
                    
                    total_volume += volume
                    if price_change > 0:
                        positive_changes += 1
                    elif price_change < 0:
                        negative_changes += 1
            
            market_sentiment = "bullish" if positive_changes > negative_changes else "bearish"
            if positive_changes == negative_changes:
                market_sentiment = "neutral"
            
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "market_sentiment": market_sentiment,
                "total_volume": round(total_volume, 2),
                "positive_symbols": positive_changes,
                "negative_symbols": negative_changes,
                "neutral_symbols": len(major_symbols) - positive_changes - negative_changes,
                "market_cap_total": round(random.uniform(2000000000000, 3000000000000), 2),
                "fear_greed_index": round(random.uniform(0, 100), 1),
                "volatility_index": round(random.uniform(10, 40), 1),
                "major_symbols": market_data["data"]
            }
            
        except Exception as e:
            logger.error(f"Failed to get market overview: {e}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "status": "error"
            }

# Global market data service instance
market_data_service = MarketDataService()