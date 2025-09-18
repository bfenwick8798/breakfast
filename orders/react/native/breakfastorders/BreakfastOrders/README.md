# 🍳 Breakfast Orders - React Native App

A mobile app for viewing breakfast orders from your DynamoDB database. Built with React Native and Expo.

## 📱 Features

- **View Orders by Date** - Browse breakfast orders for any available date
- **Real-time Data** - Connects directly to your AWS DynamoDB via Lambda API
- **Order Summary** - See item counts, timing, and statistics
- **Mobile Optimized** - Clean, responsive interface for phones
- **Pull to Refresh** - Easy data updates
- **Date Picker** - Quick navigation between dates
- **Offline Handling** - Graceful error handling for network issues

## 🚀 Quick Start

### 1. Deploy Your AWS Lambda API First
Before running the app, you need to deploy the Lambda function:

1. Follow the instructions in `AWS_SETUP.md`
2. Deploy the `benfen-breakfast-api.py` Lambda function
3. Get your Function URL (looks like: `https://abcd1234.lambda-url.ca-central-1.on.aws`)

### 2. Configure the App
1. Open `config.js`
2. Replace `YOUR_FUNCTION_URL` with your actual Lambda Function URL:
   ```javascript
   API_BASE_URL: 'https://abcd1234.lambda-url.ca-central-1.on.aws',
   ```

### 3. Run the App
```bash
cd BreakfastOrders
npx expo start
```

### 4. Test on Your Device
- **Android**: Download Expo Go from Google Play, scan QR code
- **iOS**: Use Camera app to scan QR code, opens in Expo Go
- **Web**: Press 'w' in terminal to open in browser

## 📖 How to Use

### Main Screen
- **Current Date**: Shows today's orders by default
- **Pull Down**: Refresh data from server
- **Date Button**: Tap to select different dates

### Date Picker
- **Available Dates**: Only shows dates with orders
- **Order Counts**: See how many orders each date has
- **Today Badge**: Highlights current date

### Order Cards
- **Customer Info**: Name and room number
- **Scheduled Time**: When breakfast is requested
- **Items**: Categorized with icons (🍳 mains, 🥓 sides, ☕ drinks)
- **Special Options**: Any special requests

### Summary Section
- **Total Orders**: Count for selected date
- **Time Range**: First and last breakfast times
- **Item Counts**: How many of each item ordered

## 🔧 Configuration Options

Edit `config.js` to customize:

```javascript
export const CONFIG = {
  API_BASE_URL: 'your-lambda-url-here',
  APP_NAME: 'Breakfast Orders',
  DEFAULT_REFRESH_INTERVAL: 30000, // Auto-refresh every 30 seconds
  ENABLE_DEBUG_LOGS: false, // Set to true for debugging
};
```

## 🛠️ Development

### File Structure
```
BreakfastOrders/
├── App.js              # Main app component
├── config.js           # Configuration settings
├── package.json        # Dependencies
└── assets/            # Images and icons
```

### Key Components
- **App.js**: Main application with all functionality
- **Order Cards**: Individual order display components
- **Date Picker**: Modal for selecting dates
- **Summary**: Statistics and item counts

### API Endpoints Used
- `GET /orders?date=YYYY-MM-DD` - Get orders for specific date
- `GET /orders` - Get today's orders  
- `GET /dates` - Get available dates with counts

## 🎨 UI Features

### Design System
- **Primary Color**: Blue (#2196F3, #1976D2)
- **Background**: Light gray (#f5f5f5)
- **Cards**: White with subtle shadows
- **Badges**: Colored indicators for rooms, items

### Responsive Design
- **Phone Optimized**: Designed for mobile screens
- **Touch Friendly**: Large tap targets
- **Readable Text**: Appropriate font sizes
- **Scroll Performance**: Optimized lists

### Visual Hierarchy
- **Headers**: Clear section titles
- **Cards**: Distinct order boundaries
- **Icons**: Category identification
- **Colors**: Status and importance

## 🚨 Troubleshooting

### "Unable to connect to server"
1. Check your internet connection
2. Verify Lambda Function URL in `config.js`
3. Ensure Lambda function is deployed and public
4. Check AWS Lambda logs for errors

### "No orders found"
1. Verify DynamoDB table has data
2. Check date format (YYYY-MM-DD)
3. Confirm Lambda function permissions
4. Try different dates with known orders

### App won't load
1. Ensure Expo development server is running
2. Check for JavaScript errors in terminal
3. Verify all dependencies are installed
4. Try restarting Expo with `npx expo start --clear`

### Date picker is empty
1. Lambda `/dates` endpoint may be failing
2. Check network connectivity  
3. Verify DynamoDB table structure
4. Check AWS permissions

## 📊 Data Format

The app expects this API response format:

```json
{
  "date": "2025-08-05",
  "totalOrders": 9,
  "summary": {
    "itemCounts": {"Eggs (over easy)": 3, "Coffee": 6},
    "earliestTime": "07:30",
    "latestTime": "09:00"
  },
  "orders": [
    {
      "orderId": "1754333340_9",
      "customerName": "Jacquelyn", 
      "roomNumber": "9",
      "scheduledTime": "07:30",
      "items": [
        {
          "category": "main",
          "name": "Waffles",
          "description": "Waffles with berries, whipped cream"
        }
      ]
    }
  ]
}
```

## 🔒 Security Notes

- **Read-Only**: App only reads data, cannot modify orders
- **Public API**: Lambda Function URL is public (as requested)
- **No Authentication**: Simplified for 2-user deployment
- **CORS Enabled**: Allows React Native fetch requests

## 💰 Cost Optimization

- **Efficient Queries**: Only loads needed data
- **Caching**: Avoids unnecessary API calls
- **Lazy Loading**: Loads dates on demand
- **Free Tier**: Designed to stay within AWS limits

## 🚀 Next Steps

### Potential Enhancements
1. **Push Notifications**: Alert when new orders arrive
2. **Order Status**: Mark orders as prepared/delivered
3. **Filtering**: Filter by room, time, or items
4. **Export**: Generate shopping lists or reports
5. **Offline Mode**: Cache recent data locally

### Production Deployment
1. **Build APK**: `expo build:android` 
2. **iOS Build**: `expo build:ios`
3. **Internal Distribution**: Share with kitchen staff
4. **Updates**: Use Expo OTA updates

Ready to manage breakfast orders on the go! 🎉
