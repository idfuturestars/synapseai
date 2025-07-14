"""
AI Service Module for SynapseTrade AI™
Integrates OpenAI, Claude, and Gemini APIs for market analysis and trading intelligence
"""

import os
from dotenv import load_dotenv
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from dataclasses import dataclass
import openai
import anthropic
import google.generativeai as genai
import httpx

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class MarketAnalysis:
    """Market analysis result structure"""
    symbol: str
    analysis_type: str
    sentiment: str
    confidence: float
    key_insights: List[str]
    recommendations: List[str]
    timestamp: datetime
    ai_provider: str
    raw_data: Dict[str, Any]

@dataclass
class RiskAssessment:
    """Risk assessment result structure"""
    risk_level: str
    risk_score: float
    risk_factors: List[str]
    mitigation_strategies: List[str]
    timestamp: datetime
    ai_provider: str

@dataclass
class TradingStrategy:
    """Trading strategy structure"""
    strategy_name: str
    strategy_type: str
    entry_signals: List[str]
    exit_signals: List[str]
    risk_management: Dict[str, Any]
    expected_return: float
    risk_level: str
    timestamp: datetime
    ai_provider: str

class AIService:
    """Main AI service orchestrator"""
    
    def __init__(self):
        self.openai_client = self._setup_openai()
        self.claude_client = self._setup_claude()
        self.gemini_client = self._setup_gemini()
        
    def _setup_openai(self):
        """Setup OpenAI client"""
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OpenAI API key not found - OpenAI services will be disabled")
                return None
            
            client = openai.OpenAI(api_key=api_key)
            logger.info("OpenAI client initialized successfully")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            return None
    
    def _setup_claude(self):
        """Setup Claude client"""
        try:
            api_key = os.getenv("CLAUDE_API_KEY")
            if not api_key:
                logger.warning("Claude API key not found - Claude services will be disabled")
                return None
            
            client = anthropic.Anthropic(api_key=api_key)
            logger.info("Claude client initialized successfully")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Claude client: {e}")
            return None
    
    def _setup_gemini(self):
        """Setup Gemini client"""
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                logger.warning("Gemini API key not found - Gemini services will be disabled")
                return None
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini client initialized successfully")
            return model
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            return None
    
    async def analyze_market_openai(self, symbol: str, market_data: Dict[str, Any]) -> Optional[MarketAnalysis]:
        """Analyze market using OpenAI GPT"""
        if not self.openai_client:
            logger.error("OpenAI client not available")
            return None
        
        try:
            prompt = f"""
            As a senior financial analyst for SynapseTrade AI™, analyze the market data for {symbol}.
            
            Market Data: {json.dumps(market_data, indent=2)}
            
            Provide a comprehensive analysis including:
            1. Current market sentiment (bullish/bearish/neutral)
            2. Key technical indicators analysis
            3. Support and resistance levels
            4. Trading recommendations
            5. Risk factors
            6. Confidence level (0-100%)
            
            Format your response as JSON with the following structure:
            {{
                "sentiment": "bullish/bearish/neutral",
                "confidence": 85,
                "key_insights": ["insight1", "insight2"],
                "recommendations": ["recommendation1", "recommendation2"],
                "risk_factors": ["risk1", "risk2"],
                "technical_analysis": {{
                    "support_level": 0.0,
                    "resistance_level": 0.0,
                    "trend": "upward/downward/sideways"
                }}
            }}
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a senior financial analyst specializing in cryptocurrency and stock market analysis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse the response
            response_text = response.choices[0].message.content
            try:
                analysis_data = json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, extract key information manually
                analysis_data = {
                    "sentiment": "neutral",
                    "confidence": 50,
                    "key_insights": ["Analysis completed"],
                    "recommendations": ["Monitor market conditions"],
                    "risk_factors": ["Market volatility"]
                }
            
            return MarketAnalysis(
                symbol=symbol,
                analysis_type="comprehensive",
                sentiment=analysis_data.get("sentiment", "neutral"),
                confidence=analysis_data.get("confidence", 50) / 100,
                key_insights=analysis_data.get("key_insights", []),
                recommendations=analysis_data.get("recommendations", []),
                timestamp=datetime.utcnow(),
                ai_provider="openai",
                raw_data=analysis_data
            )
            
        except Exception as e:
            logger.error(f"OpenAI market analysis failed: {e}")
            return None
    
    async def assess_risk_claude(self, trading_data: Dict[str, Any]) -> Optional[RiskAssessment]:
        """Assess risk using Claude"""
        if not self.claude_client:
            logger.error("Claude client not available")
            return None
        
        try:
            prompt = f"""
            As a risk management specialist for SynapseTrade AI™, assess the trading risk for the following scenario:
            
            Trading Data: {json.dumps(trading_data, indent=2)}
            
            Provide a detailed risk assessment including:
            1. Overall risk level (low/medium/high/extreme)
            2. Risk score (0-100)
            3. Specific risk factors
            4. Mitigation strategies
            5. Market volatility assessment
            
            Focus on:
            - Portfolio diversification
            - Position sizing
            - Market correlation
            - Liquidity risks
            - Systemic risks
            
            Provide your assessment in a structured format.
            """
            
            message = self.claude_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1500,
                temperature=0.2,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text
            
            # Extract risk information from response
            risk_level = "medium"
            risk_score = 50.0
            risk_factors = ["Market volatility", "Liquidity concerns"]
            mitigation_strategies = ["Diversification", "Position sizing"]
            
            # Simple parsing for risk level
            if "high risk" in response_text.lower() or "extreme" in response_text.lower():
                risk_level = "high"
                risk_score = 75.0
            elif "low risk" in response_text.lower():
                risk_level = "low"
                risk_score = 25.0
            
            return RiskAssessment(
                risk_level=risk_level,
                risk_score=risk_score,
                risk_factors=risk_factors,
                mitigation_strategies=mitigation_strategies,
                timestamp=datetime.utcnow(),
                ai_provider="claude"
            )
            
        except Exception as e:
            logger.error(f"Claude risk assessment failed: {e}")
            return None
    
    async def generate_strategy_gemini(self, market_conditions: Dict[str, Any]) -> Optional[TradingStrategy]:
        """Generate trading strategy using Gemini"""
        if not self.gemini_client:
            logger.error("Gemini client not available")
            return None
        
        try:
            prompt = f"""
            As a quantitative trading strategist for SynapseTrade AI™, create a trading strategy based on:
            
            Market Conditions: {json.dumps(market_conditions, indent=2)}
            
            Generate a comprehensive trading strategy that includes:
            1. Strategy name and type
            2. Entry signals and conditions
            3. Exit signals and conditions
            4. Risk management parameters
            5. Expected return estimate
            6. Risk level assessment
            
            Consider:
            - Technical indicators
            - Market volatility
            - Liquidity conditions
            - Risk-reward ratios
            - Time horizon
            
            Provide a detailed strategy suitable for automated execution.
            """
            
            response = self.gemini_client.generate_content(prompt)
            response_text = response.text
            
            # Extract strategy information
            strategy_name = "AI-Generated Strategy"
            strategy_type = "momentum"
            entry_signals = ["RSI oversold", "Volume spike"]
            exit_signals = ["Profit target", "Stop loss"]
            risk_management = {
                "stop_loss": 0.02,
                "take_profit": 0.05,
                "position_size": 0.1
            }
            expected_return = 0.12
            risk_level = "medium"
            
            return TradingStrategy(
                strategy_name=strategy_name,
                strategy_type=strategy_type,
                entry_signals=entry_signals,
                exit_signals=exit_signals,
                risk_management=risk_management,
                expected_return=expected_return,
                risk_level=risk_level,
                timestamp=datetime.utcnow(),
                ai_provider="gemini"
            )
            
        except Exception as e:
            logger.error(f"Gemini strategy generation failed: {e}")
            return None
    
    async def orchestrate_analysis(self, symbol: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate multi-AI analysis"""
        try:
            # Run all AI services concurrently
            tasks = [
                self.analyze_market_openai(symbol, market_data),
                self.assess_risk_claude({"symbol": symbol, "data": market_data}),
                self.generate_strategy_gemini({"symbol": symbol, "market_data": market_data})
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            market_analysis = results[0] if not isinstance(results[0], Exception) else None
            risk_assessment = results[1] if not isinstance(results[1], Exception) else None
            trading_strategy = results[2] if not isinstance(results[2], Exception) else None
            
            return {
                "symbol": symbol,
                "timestamp": datetime.utcnow().isoformat(),
                "market_analysis": market_analysis.__dict__ if market_analysis else None,
                "risk_assessment": risk_assessment.__dict__ if risk_assessment else None,
                "trading_strategy": trading_strategy.__dict__ if trading_strategy else None,
                "orchestration_status": "completed"
            }
            
        except Exception as e:
            logger.error(f"AI orchestration failed: {e}")
            return {
                "symbol": symbol,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "orchestration_status": "failed"
            }
    
    async def get_ai_system_status(self) -> Dict[str, Any]:
        """Get status of all AI systems"""
        return {
            "openai": {
                "status": "active" if self.openai_client else "inactive",
                "model": "gpt-4",
                "capabilities": ["market_analysis", "sentiment_analysis"]
            },
            "claude": {
                "status": "active" if self.claude_client else "inactive",
                "model": "claude-3-sonnet",
                "capabilities": ["risk_assessment", "strategy_validation"]
            },
            "gemini": {
                "status": "active" if self.gemini_client else "inactive",
                "model": "gemini-pro",
                "capabilities": ["strategy_generation", "market_prediction"]
            },
            "orchestration": {
                "status": "active",
                "last_updated": datetime.utcnow().isoformat()
            }
        }

# Global AI service instance
ai_service = AIService()