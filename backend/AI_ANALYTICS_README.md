# AI Analytics Module - Currently Disabled

## Status
The AI Analytics module has been temporarily disabled during the Vercel to Replit migration due to missing machine learning dependencies.

## Required Dependencies
To enable the AI Analytics module, you need to install the following Python packages:

```bash
pip install sentence-transformers torch transformers
```

## Re-enabling the Module
Once the dependencies are installed:

1. Open `backend/app/api/v1/api.py`
2. Add the import:
   ```python
   from app.api.v1 import auth, dev, ai_analytics
   ```
3. Add the router:
   ```python
   api_router.include_router(ai_analytics.router, prefix="/v1/ai", tags=["ai", "analytics"])
   ```

## Features
When enabled, the AI Analytics module provides:
- AI-powered insights and predictions
- Semantic search capabilities
- Customer behavior analysis
- Sales forecasting

## Notes
- These ML dependencies are large (~2-3GB) and may take time to install
- Consider the storage and compute requirements before enabling
- The core CRM functionality works without this module
