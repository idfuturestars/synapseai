from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import uvicorn
import logging
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import uuid
import requests
import httpx
from services.ai_service import ai_service
from services.market_data_service import market_data_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SynapseTrade AI™",
    description="Autonomous trading platform with deep-learning and blockchain transparency",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment variables
MONGO_URL = os.getenv("MONGO_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRATION_TIME = int(os.getenv("JWT_EXPIRATION_TIME", 1440))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

# Database connection
try:
    client = MongoClient(MONGO_URL)
    db = client.synapsetrade
    users_collection = db.users
    trades_collection = db.trades
    strategies_collection = db.strategies
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class OAuthLoginRequest(BaseModel):
    access_token: str
    provider: str  # "google" or "github"

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: str
    provider: Optional[str] = None
    created_at: datetime
    last_login: datetime

class MarketDataRequest(BaseModel):
    symbol: str
    timeframe: Optional[str] = "1h"

class AIAnalysisRequest(BaseModel):
    symbol: str
    analysis_type: Optional[str] = "comprehensive"
    include_risk_assessment: Optional[bool] = True
    include_strategy: Optional[bool] = True

class TradingStrategyRequest(BaseModel):
    user_id: str
    strategy_name: str
    strategy_type: str
    parameters: Dict[str, Any]
    risk_level: str

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_TIME)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"user_id": user_id})
    if user is None:
        raise credentials_exception
    return user

async def verify_google_token(access_token: str) -> dict:
    """Verify Google OAuth token and return user info"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}"
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=400, detail="Google token verification failed")

async def verify_github_token(access_token: str) -> dict:
    """Verify GitHub OAuth token and return user info"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {access_token}"}
            response = await client.get("https://api.github.com/user", headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                # Get user email if not public
                if not user_data.get("email"):
                    email_response = await client.get("https://api.github.com/user/emails", headers=headers)
                    if email_response.status_code == 200:
                        emails = email_response.json()
                        primary_email = next((email["email"] for email in emails if email["primary"]), None)
                        user_data["email"] = primary_email
                return user_data
            else:
                raise HTTPException(status_code=400, detail="Invalid GitHub token")
    except Exception as e:
        logger.error(f"GitHub token verification failed: {e}")
        raise HTTPException(status_code=400, detail="GitHub token verification failed")

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow(), "service": "SynapseTrade AI™"}

@app.post("/api/auth/register", response_model=Token)
async def register_user(user: UserCreate):
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user.password)
        
        user_doc = {
            "user_id": user_id,
            "email": user.email,
            "full_name": user.full_name,
            "password": hashed_password,
            "provider": "email",
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "is_active": True
        }
        
        users_collection.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            email=user.email
        )
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as-is
        raise he
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        logger.error(f"Registration error type: {type(e)}")
        import traceback
        logger.error(f"Registration traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login", response_model=Token)
async def login_user(user_login: UserLogin):
    try:
        # Find user by email
        user = users_collection.find_one({"email": user_login.email})
        if not user or not verify_password(user_login.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Update last login
        users_collection.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": user["user_id"]})
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user["user_id"],
            email=user["email"]
        )
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as-is
        raise he
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        logger.error(f"Login error type: {type(e)}")
        import traceback
        logger.error(f"Login traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/auth/oauth", response_model=Token)
async def oauth_login(oauth_request: OAuthLoginRequest):
    try:
        if oauth_request.provider == "google":
            user_info = await verify_google_token(oauth_request.access_token)
            email = user_info.get("email")
            full_name = user_info.get("name", "")
            
        elif oauth_request.provider == "github":
            user_info = await verify_github_token(oauth_request.access_token)
            email = user_info.get("email")
            full_name = user_info.get("name", "") or user_info.get("login", "")
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not available from OAuth provider")
        
        # Check if user exists
        existing_user = users_collection.find_one({"email": email})
        
        if existing_user:
            # Update last login
            users_collection.update_one(
                {"user_id": existing_user["user_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            user_id = existing_user["user_id"]
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            user_doc = {
                "user_id": user_id,
                "email": email,
                "full_name": full_name,
                "provider": oauth_request.provider,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "is_active": True
            }
            users_collection.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            email=email
        )
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as-is
        raise he
    except Exception as e:
        logger.error(f"OAuth login failed: {str(e)}")
        logger.error(f"OAuth error type: {type(e)}")
        import traceback
        logger.error(f"OAuth traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="OAuth login failed")

@app.get("/api/user/profile", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return UserProfile(
        user_id=current_user["user_id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        provider=current_user.get("provider"),
        created_at=current_user["created_at"],
        last_login=current_user["last_login"]
    )

@app.get("/api/user/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Get user statistics and activity"""
    user_id = current_user["user_id"]
    
    # Get user's trading statistics
    total_trades = trades_collection.count_documents({"user_id": user_id})
    total_strategies = strategies_collection.count_documents({"user_id": user_id})
    
    # Get recent activity (placeholder for now)
    recent_activity = []
    
    return {
        "user_id": user_id,
        "total_trades": total_trades,
        "total_strategies": total_strategies,
        "recent_activity": recent_activity,
        "account_status": "active"
    }

# AI and Market Data Endpoints
@app.get("/api/ai/status")
async def get_ai_status():
    """Get AI system status"""
    try:
        status = await ai_service.get_ai_system_status()
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "ai_systems": status
        }
    except Exception as e:
        logger.error(f"Failed to get AI status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI status")

@app.post("/api/market/data")
async def get_market_data(request: MarketDataRequest):
    """Get market data for a symbol"""
    try:
        market_data = await market_data_service.get_market_data(request.symbol, request.timeframe)
        return {
            "status": "success",
            "data": market_data
        }
    except Exception as e:
        logger.error(f"Failed to get market data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get market data")

@app.get("/api/market/overview")
async def get_market_overview():
    """Get market overview"""
    try:
        overview = await market_data_service.get_market_overview()
        return {
            "status": "success",
            "data": overview
        }
    except Exception as e:
        logger.error(f"Failed to get market overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to get market overview")

@app.get("/api/market/trending/{market_type}")
async def get_trending_symbols(market_type: str):
    """Get trending symbols for a market type"""
    try:
        symbols = await market_data_service.get_trending_symbols(market_type)
        return {
            "status": "success",
            "market_type": market_type,
            "trending_symbols": symbols
        }
    except Exception as e:
        logger.error(f"Failed to get trending symbols: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trending symbols")

@app.post("/api/ai/analyze")
async def analyze_symbol(request: AIAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Analyze a symbol using AI"""
    try:
        # Get market data first
        market_data = await market_data_service.get_market_data(request.symbol)
        
        if market_data["status"] != "success":
            raise HTTPException(status_code=400, detail="Failed to fetch market data")
        
        # Perform AI analysis
        analysis = await ai_service.orchestrate_analysis(request.symbol, market_data["data"])
        
        # Store analysis in database
        analysis_doc = {
            "user_id": current_user["user_id"],
            "symbol": request.symbol,
            "analysis_type": request.analysis_type,
            "analysis_data": analysis,
            "timestamp": datetime.utcnow(),
            "status": "completed"
        }
        
        db.analyses.insert_one(analysis_doc)
        
        return {
            "status": "success",
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze symbol: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze symbol")

@app.post("/api/trading/strategy")
async def create_trading_strategy(request: TradingStrategyRequest, current_user: dict = Depends(get_current_user)):
    """Create a new trading strategy"""
    try:
        # Generate strategy using AI
        market_conditions = {
            "risk_level": request.risk_level,
            "strategy_type": request.strategy_type,
            "parameters": request.parameters
        }
        
        strategy = await ai_service.generate_strategy_gemini(market_conditions)
        
        if not strategy:
            raise HTTPException(status_code=500, detail="Failed to generate strategy")
        
        # Save strategy to database
        strategy_doc = {
            "user_id": current_user["user_id"],
            "strategy_name": request.strategy_name,
            "strategy_type": request.strategy_type,
            "parameters": request.parameters,
            "ai_generated_strategy": strategy.__dict__,
            "status": "active",
            "created_at": datetime.utcnow(),
            "last_updated": datetime.utcnow()
        }
        
        strategies_collection.insert_one(strategy_doc)
        
        return {
            "status": "success",
            "strategy": strategy.__dict__,
            "message": "Trading strategy created successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to create trading strategy: {e}")
        raise HTTPException(status_code=500, detail="Failed to create trading strategy")

@app.get("/api/trading/strategies")
async def get_user_strategies(current_user: dict = Depends(get_current_user)):
    """Get user's trading strategies"""
    try:
        strategies = list(strategies_collection.find(
            {"user_id": current_user["user_id"]},
            {"_id": 0}
        ))
        
        return {
            "status": "success",
            "strategies": strategies,
            "total_strategies": len(strategies)
        }
        
    except Exception as e:
        logger.error(f"Failed to get user strategies: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user strategies")

@app.post("/api/ai/risk-assessment")
async def assess_trading_risk(trading_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Assess trading risk using AI"""
    try:
        risk_assessment = await ai_service.assess_risk_claude(trading_data)
        
        if not risk_assessment:
            raise HTTPException(status_code=500, detail="Failed to assess risk")
        
        # Store risk assessment
        risk_doc = {
            "user_id": current_user["user_id"],
            "trading_data": trading_data,
            "risk_assessment": risk_assessment.__dict__,
            "timestamp": datetime.utcnow()
        }
        
        db.risk_assessments.insert_one(risk_doc)
        
        return {
            "status": "success",
            "risk_assessment": risk_assessment.__dict__
        }
        
    except Exception as e:
        logger.error(f"Failed to assess trading risk: {e}")
        raise HTTPException(status_code=500, detail="Failed to assess trading risk")

@app.get("/api/dashboard/data")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    """Get comprehensive dashboard data"""
    try:
        # Get user stats
        user_stats = await get_user_stats(current_user)
        
        # Get AI system status
        ai_status = await ai_service.get_ai_system_status()
        
        # Get market overview
        market_overview = await market_data_service.get_market_overview()
        
        # Get user's recent analyses
        recent_analyses = list(db.analyses.find(
            {"user_id": current_user["user_id"]},
            {"_id": 0}
        ).sort("timestamp", -1).limit(5))
        
        return {
            "status": "success",
            "user_stats": user_stats,
            "ai_status": ai_status,
            "market_overview": market_overview,
            "recent_analyses": recent_analyses,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard data")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)