import boto3
import json
import logging
from datetime import datetime, timedelta
from boto3.dynamodb.types import TypeDeserializer
from decimal import Decimal
import os

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
TABLE_NAME = os.environ.get('TABLE_NAME', 'benfen-breakfast')
AWS_REGION = os.environ.get('AWS_REGION', 'ca-central-1')

# Initialize AWS clients
dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)

# TypeDeserializer to convert DynamoDB format to Python types
deserializer = TypeDeserializer()

class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle DynamoDB Decimal objects"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert Decimal to int if it has no decimal places, otherwise to float
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    AWS Lambda handler for Breakfast Orders REST API
    
    Endpoints:
    - GET /orders?date=YYYY-MM-DD - Get orders for specific date
    - GET /orders - Get today's orders
    - GET /dates - Get list of available dates with order counts
    """
    
    try:
        # Parse the request
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/orders')
        query_params = event.get('queryStringParameters') or {}
        
        # Set CORS headers
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        }
        
        # Handle OPTIONS request for CORS
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight'}, cls=DecimalEncoder)
            }
        
        # Route requests
        if path == '/orders' and http_method == 'GET':
            return handle_get_orders(query_params, headers)
        elif path == '/dates' and http_method == 'GET':
            return handle_get_dates(headers)
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Not Found',
                    'message': f'Path {path} not found'
                }, cls=DecimalEncoder)
            }
            
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Internal Server Error',
                'message': str(e)
            }, cls=DecimalEncoder)
        }

def handle_get_orders(query_params, headers):
    """Handle GET /orders requests"""
    try:
        # Get date parameter or use today
        date = query_params.get('date')
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        # Validate date format
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Invalid date format',
                    'message': 'Date must be in YYYY-MM-DD format'
                }, cls=DecimalEncoder)
            }
        
        # Query orders
        orders = query_breakfast_orders(TABLE_NAME, date)
        
        # Process and format orders for mobile app
        formatted_orders = []
        for order in orders:
            formatted_order = format_order_for_mobile(order)
            formatted_orders.append(formatted_order)
        
        # Sort orders by time
        formatted_orders.sort(key=lambda x: x.get('scheduledTime', '23:59'))
        
        # Calculate summary statistics
        summary = calculate_order_summary(orders)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'date': date,
                'orders': formatted_orders,
                'summary': summary,
                'totalOrders': len(formatted_orders)
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        logger.error(f"Error getting orders: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Failed to get orders',
                'message': str(e)
            }, cls=DecimalEncoder)
        }

def handle_get_dates(headers):
    """Handle GET /dates requests - returns available dates with order counts"""
    try:
        # Scan table to get all available dates
        # Note: This is a simplified approach. For large datasets, you'd want pagination
        response = dynamodb.scan(
            TableName=TABLE_NAME,
            ProjectionExpression='#pk',
            ExpressionAttributeNames={'#pk': 'bk_yyyy-mm-dd'}
        )
        
        # Extract unique dates and count orders
        date_counts = {}
        for item in response.get('Items', []):
            partition_key = item['bk_yyyy-mm-dd']['S']
            date = partition_key.replace('bk_', '')
            date_counts[date] = date_counts.get(date, 0) + 1
        
        # Format for response
        dates = []
        for date, count in sorted(date_counts.items(), reverse=True):
            try:
                # Parse and format date for display
                date_obj = datetime.strptime(date, '%Y-%m-%d')
                dates.append({
                    'date': date,
                    'displayName': date_obj.strftime('%A, %B %d, %Y'),
                    'orderCount': count,
                    'dayOfWeek': date_obj.strftime('%A'),
                    'isToday': date == datetime.now().strftime('%Y-%m-%d')
                })
            except ValueError:
                # Skip invalid dates
                continue
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'dates': dates,
                'totalDates': len(dates)
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        logger.error(f"Error getting dates: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Failed to get dates',
                'message': str(e)
            }, cls=DecimalEncoder)
        }

def query_breakfast_orders(table_name, date):
    """Query DynamoDB for breakfast orders for a specific date"""
    partition_key = f"bk_{date}"
    
    try:
        response = dynamodb.query(
            TableName=table_name,
            KeyConditionExpression='#pk = :pk',
            ExpressionAttributeNames={'#pk': "bk_yyyy-mm-dd"},
            ExpressionAttributeValues={':pk': {'S': partition_key}}
        )
        
        # Convert DynamoDB format to Python objects
        orders = []
        for item in response.get('Items', []):
            # Deserialize the item
            deserialized_item = {k: deserializer.deserialize(v) for k, v in item.items()}
            
            # Parse the order_data JSON string
            if 'order_data' in deserialized_item:
                try:
                    order_data_str = deserialized_item['order_data']
                    
                    if isinstance(order_data_str, dict):
                        deserialized_item['order_data'] = order_data_str
                    else:
                        # Parse JSON string with DynamoDB format
                        order_data_dynamo = json.loads(order_data_str)
                        order_data = {k: deserializer.deserialize(v) for k, v in order_data_dynamo.items()}
                        deserialized_item['order_data'] = order_data
                except (json.JSONDecodeError, KeyError, TypeError) as e:
                    logger.error(f"Error parsing order_data: {e}")
                    continue
            
            orders.append(deserialized_item)
        
        return orders
        
    except Exception as e:
        logger.error(f"Error querying DynamoDB: {e}")
        raise e

def format_order_for_mobile(order):
    """Format a single order for mobile app consumption"""
    order_data = order.get('order_data', {})
    customer = order_data.get('customer', {})
    scheduling = order_data.get('scheduling', {})
    
    # Basic info
    formatted = {
        'orderId': order.get('order_id', ''),
        'customerName': customer.get('firstName', 'Unknown'),
        'roomNumber': customer.get('roomNumber', 'N/A'),
        'scheduledDate': scheduling.get('date', ''),
        'scheduledTime': scheduling.get('time', 'N/A'),
        'createdAt': order.get('created_at', ''),
        'specialOptions': order_data.get('specialOptions', ''),
        'items': []
    }
    
    # Process menu items
    items = []
    
    # Eggs
    eggs = order_data.get('eggs', {})
    if eggs.get('style'):
        egg_text = f"Eggs ({eggs['style']}"
        if eggs.get('overStyle'):
            egg_text += f" {eggs['overStyle']}"
        egg_text += ")"
        items.append({
            'category': 'main',
            'name': 'Eggs',
            'description': egg_text,
            'details': {
                'style': eggs.get('style', ''),
                'overStyle': eggs.get('overStyle', '')
            }
        })
    
    # Pancakes
    pancakes = order_data.get('pancakes', {})
    if pancakes.get('selected'):
        toppings = []
        toppings_data = pancakes.get('toppings', {})
        if toppings_data.get('berries'): toppings.append('berries')
        if toppings_data.get('bacon'): toppings.append('bacon')
        if toppings_data.get('whippedCream'): toppings.append('whipped cream')
        
        description = "Pancakes"
        if toppings:
            description += f" with {', '.join(toppings)}"
            
        items.append({
            'category': 'main',
            'name': 'Pancakes',
            'description': description,
            'details': toppings_data
        })
    
    # Waffles
    waffles = order_data.get('waffles', {})
    if waffles.get('selected'):
        options = []
        options_data = waffles.get('options', {})
        if options_data.get('berries'): options.append('berries')
        if options_data.get('bacon'): options.append('bacon')
        if options_data.get('whippedCream'): options.append('whipped cream')
        
        description = "Waffles"
        if options:
            description += f" with {', '.join(options)}"
            
        items.append({
            'category': 'main',
            'name': 'Waffles',
            'description': description,
            'details': options_data
        })
    
    # Sides
    sides = order_data.get('sides', {})
    if sides.get('bacon'):
        items.append({
            'category': 'side',
            'name': 'Bacon',
            'description': 'Bacon'
        })
    
    if sides.get('homeFries'):
        items.append({
            'category': 'side',
            'name': 'Home Fries',
            'description': 'Home Fries'
        })
    
    if sides.get('beans'):
        items.append({
            'category': 'side',
            'name': 'Beans',
            'description': 'Beans'
        })
    
    toast = sides.get('toast', {})
    if toast.get('selected'):
        bread_type = toast.get('breadType', 'regular')
        items.append({
            'category': 'side',
            'name': 'Toast',
            'description': f'Toast ({bread_type})',
            'details': {'breadType': bread_type}
        })
    
    # Drinks
    drinks = order_data.get('drinks', {})
    
    if drinks.get('coffee'):
        items.append({
            'category': 'drink',
            'name': 'Coffee',
            'description': 'Coffee'
        })
    
    if drinks.get('tea'):
        items.append({
            'category': 'drink',
            'name': 'Tea',
            'description': 'Tea'
        })
    
    if drinks.get('water'):
        items.append({
            'category': 'drink',
            'name': 'Water',
            'description': 'Water'
        })
    
    if drinks.get('milk'):
        items.append({
            'category': 'drink',
            'name': 'Milk',
            'description': 'Milk'
        })
    
    juice = drinks.get('juice', {})
    if juice.get('selected'):
        juice_type = juice.get('juiceType', 'regular')
        items.append({
            'category': 'drink',
            'name': 'Juice',
            'description': f'Juice ({juice_type})',
            'details': {'juiceType': juice_type}
        })
    
    formatted['items'] = items
    return formatted

def calculate_order_summary(orders):
    """Calculate summary statistics for orders"""
    from collections import defaultdict
    
    item_counts = defaultdict(int)
    times = []
    
    for order in orders:
        order_data = order.get('order_data', {})
        
        # Count items (similar to existing analysis function)
        eggs = order_data.get('eggs', {})
        if eggs.get('style'):
            if eggs.get('overStyle'):
                item_counts[f"Eggs ({eggs['style']} {eggs['overStyle']})"] += 1
            else:
                item_counts[f"Eggs ({eggs['style']})"] += 1
        
        pancakes = order_data.get('pancakes', {})
        if pancakes.get('selected'):
            item_counts['Pancakes'] += 1
        
        waffles = order_data.get('waffles', {})
        if waffles.get('selected'):
            item_counts['Waffles'] += 1
        
        sides = order_data.get('sides', {})
        if sides.get('bacon'): item_counts['Bacon'] += 1
        if sides.get('homeFries'): item_counts['Home Fries'] += 1
        if sides.get('beans'): item_counts['Beans'] += 1
        
        toast = sides.get('toast', {})
        if toast.get('selected'):
            bread_type = toast.get('breadType', 'regular')
            item_counts[f'Toast ({bread_type})'] += 1
        
        drinks = order_data.get('drinks', {})
        if drinks.get('coffee'): item_counts['Coffee'] += 1
        if drinks.get('tea'): item_counts['Tea'] += 1
        if drinks.get('water'): item_counts['Water'] += 1
        if drinks.get('milk'): item_counts['Milk'] += 1
        
        juice = drinks.get('juice', {})
        if juice.get('selected'):
            juice_type = juice.get('juiceType', 'regular')
            item_counts[f'Juice ({juice_type})'] += 1
        
        # Collect times
        scheduling = order_data.get('scheduling', {})
        if scheduling.get('time'):
            times.append(scheduling['time'])
    
    # Find earliest and latest times
    earliest_time = min(times) if times else None
    latest_time = max(times) if times else None
    
    return {
        'itemCounts': dict(item_counts),
        'earliestTime': earliest_time,
        'latestTime': latest_time,
        'totalOrders': len(orders),
        'timeRange': f"{earliest_time} - {latest_time}" if earliest_time and latest_time else None
    }

# For local testing
if __name__ == "__main__":
    # Test the API locally
    test_event = {
        'httpMethod': 'GET',
        'path': '/orders',
        'queryStringParameters': {'date': '2025-08-05'}
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
