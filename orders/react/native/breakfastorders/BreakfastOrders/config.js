// Configuration for your Breakfast Orders App
// Update the API_BASE_URL after deploying your Lambda function

export const CONFIG = {
  // TODO: Replace this with your actual Lambda Function URL after deployment
  // It will look something like: https://abcd1234.lambda-url.ca-central-1.on.aws
  API_BASE_URL: 'https://an7p3skwvbwj2zb26ts77gw4ie0ebioj.lambda-url.ca-central-1.on.aws/',
  
  // App settings
  APP_NAME: 'Breakfast Orders',
  DEFAULT_REFRESH_INTERVAL: 300000, // 300 seconds
  
  // Development settings
  ENABLE_DEBUG_LOGS: __DEV__, // Only enable in development
};
