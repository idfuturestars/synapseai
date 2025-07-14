# SynapseTrade AI™ - Vercel + Railway Deployment

## DEPLOYMENT STEPS

### 1. Railway Backend Deployment
1. Go to https://railway.app/
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Select backend folder
5. Set environment variables:
   - MONGO_URL: mongodb+srv://synapsetrade:PASSWORD@cluster0.mongodb.net/synapsetrade
   - OPENAI_API_KEY: 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
   - CLAUDE_API_KEY: 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
   - GEMINI_API_KEY: AIzaSyDnz6Z8p5sM-u37qhot44XtlpU4mJydnzw
   - GOOGLE_CLIENT_ID: 826981107429-bfninoa6irpb4ptomn0m637hphoh2t83.apps.googleusercontent.com
   - GOOGLE_CLIENT_SECRET: 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
   - GITHUB_CLIENT_ID: Ov23lisfYEmX0dRrr8wN
   - GITHUB_CLIENT_SECRET: 51e923120bc2be0258a5b4c10afe550b822beac7
   - JWT_SECRET_KEY: synapse-trade-ai-jwt-secret-key-2025
   - JWT_ALGORITHM: HS256
   - JWT_EXPIRATION_TIME: 1440
6. Deploy backend
7. Note the deployment URL (e.g., https://synapsetrade-ai-backend.railway.app)

### 2. Vercel Frontend Deployment
1. Go to https://vercel.com/
2. Connect your GitHub account
3. Import project
4. Select frontend folder
5. Set environment variables:
   - REACT_APP_BACKEND_URL: https://synapsetrade-ai-backend.railway.app
   - REACT_APP_GOOGLE_CLIENT_ID: 826981107429-bfninoa6irpb4ptomn0m637hphoh2t83.apps.googleusercontent.com
   - REACT_APP_GITHUB_CLIENT_ID: Ov23lisfYEmX0dRrr8wN
6. Deploy frontend

### 3. MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com/
2. Create new cluster
3. Create database user
4. Add connection string to Railway environment variables

### 4. Domain Configuration
1. Configure custom domain in Vercel
2. Update OAuth redirect URLs
3. Update CORS settings in backend

## TROUBLESHOOTING

### Common Issues:
1. **CORS Errors**: Check backend CORS configuration
2. **API Connection**: Verify backend URL in frontend environment
3. **MongoDB Connection**: Check connection string format
4. **OAuth Issues**: Verify client IDs and redirect URLs

### Diagnostic Commands:
```bash
# Test backend health
curl https://your-backend-url.railway.app/api/health

# Check frontend build
npm run build

# Test local connection
curl -X POST https://your-backend-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## POST-DEPLOYMENT CHECKLIST
- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] OAuth login works
- [ ] AI analysis functions
- [ ] Market data loads
- [ ] All API endpoints respond
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Domain configured

## MONITORING
- Railway: Built-in monitoring and logs
- Vercel: Analytics and performance metrics
- MongoDB Atlas: Database monitoring
- Consider adding: Sentry for error tracking

