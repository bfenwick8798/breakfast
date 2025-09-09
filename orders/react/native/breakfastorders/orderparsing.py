import boto3
import os
import json
import logging
from datetime import datetime, timedelta
from collections import defaultdict
from boto3.dynamodb.types import TypeDeserializer
from zoneinfo import ZoneInfo

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
TO_EMAIL = os.environ.get('TO_EMAIL', 'innatthecape@hotmail.com')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'orders@breakfast.innatthecape.com')
TABLE_NAME = os.environ.get('TABLE_NAME', 'benfen-breakfast')
AWS_REGION = os.environ.get('AWS_REGION', 'ca-central-1')

# Initialize AWS clients
emailclient = boto3.client('ses', region_name=AWS_REGION)
dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)

# TypeDeserializer to convert DynamoDB format to Python types
deserializer = TypeDeserializer()


def lambda_handler(event, context):
    """
    AWS Lambda handler function for sending breakfast order reports

    Args:
        event (dict): Lambda event data (can contain 'date' parameter)
        context: Lambda context object

    Returns:
        dict: Response with statusCode and body
    """
    try:
        # Get date from event or use today's date
        date = event.get('date') if event and 'date' in event else None
        if date == 'Tomorrow':
            tomorrow = datetime.now(ZoneInfo("Canada/Newfoundland")) + timedelta(days=1)
            print(f"Tomorrow is {str(tomorrow)}")
            date = tomorrow.strftime('%Y-%m-%d')
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        logger.info(f"Processing breakfast orders report for date: {date}")

        # Query breakfast orders
        orders = query_breakfast_orders(TABLE_NAME, date)

        if not orders:
            logger.info(f"No breakfast orders found for {date}")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'No breakfast orders found for {date}',
                    'date': date,
                    'orders_processed': 0
                })
            }

        # Analyze the orders
        analysis = analyze_orders(orders)

        # Send email report
        response = send_breakfast_report_email(TO_EMAIL, FROM_EMAIL, TABLE_NAME, date, orders, analysis)

        logger.info(f"Successfully sent breakfast report for {date} with {len(orders)} orders")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Breakfast report sent successfully',
                'date': date,
                'orders_processed': len(orders),
                'message_id': response['MessageId'] if response else None
            })
        }

    except Exception as e:
        logger.error(f"Error processing breakfast report: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Failed to process breakfast report',
                'message': str(e)
            })
        }



def query_breakfast_orders(table_name="breakfast_orders", date=None):
    """
    Query DynamoDB for breakfast orders for a specific date

    Args:
        table_name (str): Name of the DynamoDB table
        date (str): Date in YYYY-MM-DD format, defaults to today

    Returns:
        list: List of breakfast orders
    """
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    partition_key = f"bk_{date}"

    try:
        response = dynamodb.query(
            TableName=table_name,
            KeyConditionExpression='#pk = :pk',
            ExpressionAttributeNames={
                '#pk': 'bk_yyyy-mm-dd'  # Partition key name
            },
            ExpressionAttributeValues={
                ':pk': {'S': partition_key}
            }
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

                    # Check if it's already a dict (already deserialized) or a string (needs parsing)
                    if isinstance(order_data_str, dict):
                        # It's already deserialized, use as-is
                        deserialized_item['order_data'] = order_data_str
                    else:
                        # It's a JSON string with DynamoDB format, parse it
                        order_data_dynamo = json.loads(order_data_str)

                        # Deserialize the nested DynamoDB format
                        order_data = {k: deserializer.deserialize(v) for k, v in order_data_dynamo.items()}
                        deserialized_item['order_data'] = order_data
                except (json.JSONDecodeError, KeyError, TypeError) as e:
                    logger.error(f"Error parsing order_data: {e}")
                    logger.debug(f"order_data type: {type(deserialized_item.get('order_data'))}")
                    logger.debug(f"order_data content: {deserialized_item.get('order_data')}")
                    continue

            orders.append(deserialized_item)

        return orders

    except Exception as e:
        logger.error(f"Error querying DynamoDB: {e}")
        raise e


def analyze_orders(orders):
    """
    Analyze breakfast orders to get counts and timing information

    Args:
        orders (list): List of breakfast orders

    Returns:
        dict: Analysis results including item counts and timing
    """
    item_counts = defaultdict(int)
    times = []

    for order in orders:
        order_data = order.get('order_data', {})

        # Count eggs
        eggs = order_data.get('eggs', {})
        if eggs.get('style'):
            if eggs.get('overStyle'):
                # If there's an overStyle, use the full combined name
                item_counts[f"Eggs ({eggs['style']} {eggs['overStyle']})"] += 1
            else:
                # If no overStyle, just use the style
                item_counts[f"Eggs ({eggs['style']})"] += 1

        # Count pancakes
        pancakes = order_data.get('pancakes', {})
        if pancakes.get('selected'):
            item_counts['Pancakes'] += 1
            toppings = pancakes.get('toppings', {})
            if toppings.get('berries'):
                item_counts['Berries'] += 1
            if toppings.get('bacon'):
                item_counts['Bacon'] += 1
            if toppings.get('whippedCream'):
                item_counts['Whipped Cream'] += 1

        # Count waffles
        waffles = order_data.get('waffles', {})
        if waffles.get('selected'):
            item_counts['Waffles'] += 1
            options = waffles.get('options', {})
            if options.get('berries'):
                item_counts['Berries'] += 1
            if options.get('bacon'):
                item_counts['Bacon'] += 1
            if options.get('whippedCream'):
                item_counts['Whipped Cream'] += 1

        # Count sides
        sides = order_data.get('sides', {})
        if sides.get('bacon'):
            item_counts['Bacon'] += 1
        if sides.get('homeFries'):
            item_counts['Home Fries'] += 1
        if sides.get('beans'):
            item_counts['Beans'] += 1

        toast = sides.get('toast', {})
        if toast.get('selected'):
            bread_type = toast.get('breadType', 'regular')
            item_counts[f'Toast ({bread_type})'] += 1
        
        # Count drinks
        drinks = order_data.get('drinks', {})
        if drinks.get('water'):
            item_counts['Water'] += 1
        if drinks.get('milk'):
            item_counts['Milk'] += 1
        if drinks.get('coffee'):
            item_counts['Coffee'] += 1
        if drinks.get('tea'):
            item_counts['Tea'] += 1
        
        juice = drinks.get('juice', {})
        if juice.get('selected'):
            juice_type = juice.get('juiceType', 'regular')
            item_counts[f'Juice ({juice_type})'] += 1

        # Collect scheduling times
        scheduling = order_data.get('scheduling', {})
        if scheduling.get('time'):
            times.append(scheduling['time'])

    # Find earliest and latest times
    earliest_time = min(times) if times else None
    latest_time = max(times) if times else None

    return {
        'item_counts': dict(item_counts),
        'earliest_time': earliest_time,
        'latest_time': latest_time,
        'total_orders': len(orders)
    }


def sort_orders_by_time(orders):
    """
    Sort orders chronologically by their scheduled time
    
    Args:
        orders (list): List of breakfast orders
        
    Returns:
        list: Orders sorted by time (earliest to latest)
    """
    def get_order_time_for_sorting(order):
        """Get time from order for sorting, handling various time formats"""
        order_data = order.get('order_data', {})
        scheduling = order_data.get('scheduling', {})
        time_str = scheduling.get('time', '')
        
        if not time_str or time_str == 'N/A':
            # Put orders without time at the end
            return '23:59'
        
        # Handle different time formats
        time_str = time_str.strip().upper()
        
        # Convert 12-hour format to 24-hour for sorting
        if 'AM' in time_str or 'PM' in time_str:
            try:
                # Remove AM/PM and any extra spaces
                time_clean = time_str.replace('AM', '').replace('PM', '').strip()
                
                # Parse time parts
                if ':' in time_clean:
                    hour, minute = time_clean.split(':')
                    hour = int(hour)
                    minute = int(minute)
                else:
                    hour = int(time_clean)
                    minute = 0
                
                # Convert to 24-hour format
                if 'PM' in time_str and hour != 12:
                    hour += 12
                elif 'AM' in time_str and hour == 12:
                    hour = 0
                
                return f"{hour:02d}:{minute:02d}"
            except (ValueError, IndexError):
                # If parsing fails, return original time for basic string sorting
                return time_str
        else:
            # Assume it's already in 24-hour format or handle basic string sorting
            return time_str
    
    try:
        return sorted(orders, key=get_order_time_for_sorting)
    except Exception as e:
        logger.warning(f"Error sorting orders by time: {e}. Returning original order.")
        return orders


def generate_breakfast_email_html(orders, analysis, date):
    """
    Generate rich HTML email content for breakfast orders

    Args:
        orders (list): List of breakfast orders
        analysis (dict): Analysis results
        date (str): Date for the report

    Returns:
        str: HTML email content
    """
    # Sort orders chronologically by time
    sorted_orders = sort_orders_by_time(orders)
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 10px;
                background-color: #f5f5f5;
                font-size: 12px;
            }}
            .container {{
                max-width: 1000px;
                margin: 0 auto;
                background-color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                text-align: center;
                border-bottom: 2px solid #2196F3;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }}
            .header h1 {{
                color: #1976D2;
                margin: 0 0 8px 0;
                font-size: 20px;
            }}
            .date {{
                color: #666;
                font-size: 14px;
                margin: 0;
            }}
            .summary {{
                background-color: #E3F2FD;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                border-left: 3px solid #2196F3;
            }}
            .summary h2 {{
                color: #1976D2;
                margin: 0 0 12px 0;
                font-size: 16px;
            }}
            .summary h3 {{
                color: #1976D2;
                margin: 15px 0 8px 0;
                font-size: 14px;
            }}
            .stats {{
                display: flex;
                justify-content: space-around;
                margin: 12px 0;
                padding: 0 10px;
            }}
            .stat {{
                text-align: center;
                flex: 1;
            }}
            .stat-number {{
                font-size: 18px;
                font-weight: bold;
                color: #2196F3;
                line-height: 1.2;
                margin-bottom: 2px;
            }}
            .stat-label {{
                color: #666;
                font-size: 11px;
                line-height: 1.2;
                padding-right: 8px
            }}
            .items-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 6px;
                margin: 10px 0 0 0;
                padding: 0;
            }}
            .item-count {{
                background-color: #F5F5F5;
                padding: 6px;
                border-radius: 3px;
                text-align: center;
                border: 1px solid #DDD;
            }}
            .item-name {{
                font-weight: bold;
                color: #1976D2;
                font-size: 10px;
                line-height: 1.2;
                margin-bottom: 2px;
            }}
            .item-number {{
                font-size: 14px;
                color: #2196F3;
                line-height: 1;
                margin: 0;
            }}
            .orders-section {{
                margin-top: 20px;
            }}
            .orders-section h2 {{
                color: #1976D2;
                margin: 0 0 12px 0;
                font-size: 16px;
            }}
            .order-card {{
                background-color: #FAFAFA;
                border: 1px solid #E0E0E0;
                border-radius: 5px;
                padding: 12px;
                margin-bottom: 10px;
                page-break-inside: avoid;
                box-sizing: border-box;
            }}
            .order-header {{
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: flex-start;
                margin-bottom: 10px;
                border-bottom: 1px solid #E0E0E0;
                padding-bottom: 8px;
            }}
            .customer-info {{
                font-weight: bold;
                color: #1976D2;
                font-size: 13px;
                line-height: 1.3;
                flex: 1 1 auto;
                min-width: 120px;
                word-wrap: break-word;
            }}
            .room-number {{
                background-color: #2196F3;
                color: white;
                padding: 3px 7px;
                border-radius: 10px;
                font-size: 10px;
                white-space: nowrap;
                flex-shrink: 0;
            }}
            .order-time {{
                color: #666;
                font-size: 11px;
                line-height: 1.3;
                flex-shrink: 0;
                margin-top: 2px;
            }}
            .order-items {{
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 2px;
            }}
            .order-item {{
                background-color: white;
                padding: 5px 8px;
                border-radius: 3px;
                border: 1px solid #E0E0E0;
                font-size: 11px;
                line-height: 1.2;
                box-sizing: border-box;
                word-wrap: break-word;
                max-width: 100%;
            }}
            .order-item.selected {{
                background-color: #E3F2FD;
                border-color: #2196F3;
            }}
            /* Mobile-only layout - completely different structure */
            .mobile-layout {{
                display: none;
            }}
            
            .desktop-layout {{
                display: block;
            }}
            
            @media screen and (max-width: 600px) {{
                /* Hide desktop layout on mobile */
                .desktop-layout {{
                    display: none;
                }}
                
                /* Show mobile-only layout */
                .mobile-layout {{
                    display: block;
                }}
                
                body {{
                    padding: 8px;
                    font-size: 14px;
                    background-color: #f8f9fa;
                }}
                
                .mobile-container {{
                    background-color: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }}
                
                .mobile-header {{
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                    color: white;
                    padding: 16px;
                    text-align: center;
                }}
                
                .mobile-header h1 {{
                    margin: 0 0 4px 0;
                    font-size: 22px;
                    font-weight: 600;
                }}
                
                .mobile-date {{
                    font-size: 14px;
                    opacity: 0.9;
                    margin: 0;
                }}
                
                .mobile-summary {{
                    padding: 16px;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                }}
                
                .mobile-stats {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 16px;
                }}
                
                .mobile-stat {{
                    background: white;
                    padding: 12px;
                    border-radius: 6px;
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }}
                
                .mobile-stat-number {{
                    font-size: 20px;
                    font-weight: bold;
                    color: #2196F3;
                    display: block;
                }}
                
                .mobile-stat-label {{
                    font-size: 12px;
                    color: #666;
                    margin-top: 4px;
                }}
                
                .mobile-items-summary {{
                    background: white;
                    padding: 12px;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }}
                
                .mobile-items-title {{
                    font-size: 16px;
                    font-weight: 600;
                    color: #1976D2;
                    margin: 0 0 8px 0;
                }}
                
                .mobile-items-list {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
                    gap: 6px;
                }}
                
                .mobile-item {{
                    background: #f8f9fa;
                    padding: 8px 4px;
                    border-radius: 4px;
                    text-align: center;
                    border: 1px solid #e9ecef;
                }}
                
                .mobile-item-name {{
                    font-size: 10px;
                    color: #1976D2;
                    font-weight: 500;
                    line-height: 1.2;
                    margin-bottom: 2px;
                }}
                
                .mobile-item-count {{
                    font-size: 16px;
                    font-weight: bold;
                    color: #2196F3;
                }}
                
                .mobile-orders {{
                    padding: 16px;
                }}
                
                .mobile-orders-title {{
                    font-size: 18px;
                    font-weight: 600;
                    color: #1976D2;
                    margin: 0 0 16px 0;
                    text-align: center;
                }}
                
                .mobile-order {{
                    background: white;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                
                .mobile-order-header {{
                    background: #2196F3;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }}
                
                .mobile-customer {{
                    font-weight: 600;
                    font-size: 16px;
                }}
                
                .mobile-room {{
                    background: rgba(255, 255, 255, 0.2);
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    margin-left: 8px;
                }}
                
                .mobile-time {{
                    font-size: 14px;
                    opacity: 0.9;
                }}
                
                .mobile-order-items {{
                    padding: 16px;
                }}
                
                .mobile-order-item {{
                    background: #f8f9fa;
                    padding: 8px 12px;
                    margin: 4px 0;
                    border-radius: 20px;
                    border-left: 3px solid #2196F3;
                    font-size: 14px;
                    color: #333;
                }}
                
                /* Special styling for important items */
                .mobile-order-item.main-dish {{
                    background: #e3f2fd;
                    border-left-color: #1976D2;
                    font-weight: 500;
                }}
            }}
            @media print {{
                body {{
                    background-color: white;
                    font-size: 11px;
                }}
                .container {{
                    box-shadow: none;
                    padding: 5px;
                }}
                .order-card {{
                    page-break-inside: avoid;
                    margin-bottom: 5px;
                }}
            }}
        </style>
    </head>
    <body>
        <!-- Desktop Layout -->
        <div class="desktop-layout">
            <div class="container">
                <div class="header">
                    <h1>Breakfast</h1>
                    <div class="date">{datetime.strptime(date, '%Y-%m-%d').strftime('%A, %B %d, %Y')}</div>
                </div>

                <div class="summary">
                    <h2>Summary</h2>
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">{analysis['total_orders']}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">{analysis['earliest_time'] or 'N/A'}</div>
                            <div class="stat-label">First Breakfast</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">{analysis['latest_time'] or 'N/A'}</div>
                            <div class="stat-label">Last Breakfast</div>
                        </div>
                    </div>

                    <h3>Item Counts</h3>
                    <div class="items-grid">
    """

    # Add item counts for desktop
    for item, count in sorted(analysis['item_counts'].items()):
        html += f"""
                        <div class="item-count">
                            <div class="item-name">{item}</div>
                            <div class="item-number">{count}</div>
                        </div>
        """

    html += """
                    </div>
                </div>

                <div class="orders-section">
                    <h2>Individual Orders</h2>
    """

    # Add desktop individual order cards
    for order in sorted_orders:
        order_data = order.get('order_data', {})
        customer = order_data.get('customer', {})
        scheduling = order_data.get('scheduling', {})

        customer_name = customer.get('firstName', 'Unknown')
        room_number = customer.get('roomNumber', 'N/A')
        order_time = scheduling.get('time', 'N/A')

        html += f"""
                    <div class="order-card">
                        <div class="order-header">
                            <div class="customer-info">
                                {customer_name}
                                <span class="room-number">Room {room_number}</span>
                            </div>
                            <div class="order-time">{order_time}</div>
                        </div>
                        <div class="order-items">
        """

        # Add order items for desktop
        html += generate_order_items_html(order_data, "desktop")

        html += """
                        </div>
                    </div>
        """

    html += f"""
                </div>
            </div>
        </div>
        
        <!-- Mobile Layout -->
        <div class="mobile-layout">
            <div class="mobile-container">
                <div class="mobile-header">
                    <h1>Breakfast Orders</h1>
                    <div class="mobile-date">{datetime.strptime(date, '%Y-%m-%d').strftime('%A, %B %d, %Y')}</div>
                </div>
                
                <div class="mobile-summary">
                    <div class="mobile-stats">
                        <div class="mobile-stat">
                            <span class="mobile-stat-number">{analysis['total_orders']}</span>
                            <div class="mobile-stat-label">Total Orders</div>
                        </div>
                        <div class="mobile-stat">
                            <span class="mobile-stat-number">{analysis['earliest_time'] or 'N/A'}</span>
                            <div class="mobile-stat-label">First Time</div>
                        </div>
                    </div>
                    
                    <div class="mobile-items-summary">
                        <div class="mobile-items-title">Items Ordered</div>
                        <div class="mobile-items-list">
    """

    # Add mobile item counts
    for item, count in sorted(analysis['item_counts'].items()):
        # Shorten item names for mobile
        mobile_item_name = item.replace('Eggs (', '').replace(')', '').replace('Toast (', '').replace('Juice (', '')
        if len(mobile_item_name) > 12:
            mobile_item_name = mobile_item_name[:10] + '..'
        
        html += f"""
                            <div class="mobile-item">
                                <div class="mobile-item-name">{mobile_item_name}</div>
                                <div class="mobile-item-count">{count}</div>
                            </div>
        """

    html += f"""
                        </div>
                    </div>
                </div>
                
                <div class="mobile-orders">
                    <div class="mobile-orders-title">Orders ({len(sorted_orders)})</div>
    """

    # Add mobile individual orders
    for order in sorted_orders:
        order_data = order.get('order_data', {})
        customer = order_data.get('customer', {})
        scheduling = order_data.get('scheduling', {})

        customer_name = customer.get('firstName', 'Unknown')
        room_number = customer.get('roomNumber', 'N/A')
        order_time = scheduling.get('time', 'N/A')

        html += f"""
                    <div class="mobile-order">
                        <div class="mobile-order-header">
                            <div>
                                <span class="mobile-customer">{customer_name}</span>
                                <span class="mobile-room">Room {room_number}</span>
                            </div>
                            <div class="mobile-time">{order_time}</div>
                        </div>
                        <div class="mobile-order-items">
        """

        # Add order items for mobile
        html += generate_order_items_html(order_data, "mobile")

        html += """
                        </div>
                    </div>
        """

    html += """
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    return html


def generate_order_items_html(order_data, layout_type="desktop"):
    """
    Generate HTML for order items based on layout type
    
    Args:
        order_data (dict): Order data
        layout_type (str): "desktop" or "mobile"
        
    Returns:
        str: HTML for order items
    """
    items_html = ""
    
    # CSS classes based on layout
    if layout_type == "mobile":
        item_class = "mobile-order-item"
        main_dish_class = "mobile-order-item main-dish"
    else:
        item_class = "order-item selected"
        main_dish_class = "order-item selected"
    
    # Main dishes (eggs, pancakes, waffles) - highlighted differently on mobile
    eggs = order_data.get('eggs', {})
    if eggs.get('style'):
        style_text = eggs['style']
        if eggs.get('overStyle'):
            style_text += f" {eggs['overStyle']}"
        items_html += f'<div class="{main_dish_class}">Eggs ({style_text})</div>'

    pancakes = order_data.get('pancakes', {})
    if pancakes.get('selected'):
        toppings = []
        toppings_data = pancakes.get('toppings', {})
        if toppings_data.get('berries'):
            toppings.append('berries')
        if toppings_data.get('bacon'):
            toppings.append('bacon')
        if toppings_data.get('whippedCream'):
            toppings.append('whipped cream')

        topping_text = f" with {', '.join(toppings)}" if toppings else ""
        items_html += f'<div class="{main_dish_class}">Pancakes{topping_text}</div>'

    waffles = order_data.get('waffles', {})
    if waffles.get('selected'):
        options = []
        options_data = waffles.get('options', {})
        if options_data.get('berries'):
            options.append('berries')
        if options_data.get('bacon'):
            options.append('bacon')
        if options_data.get('whippedCream'):
            options.append('whipped cream')

        option_text = f" with {', '.join(options)}" if options else ""
        items_html += f'<div class="{main_dish_class}">Waffles{option_text}</div>'

    # Sides
    sides = order_data.get('sides', {})
    if sides.get('bacon'):
        items_html += f'<div class="{item_class}">Bacon</div>'
    if sides.get('homeFries'):
        items_html += f'<div class="{item_class}">Home Fries</div>'
    if sides.get('beans'):
        items_html += f'<div class="{item_class}">Beans</div>'

    toast = sides.get('toast', {})
    if toast.get('selected'):
        bread_type = toast.get('breadType', 'regular')
        items_html += f'<div class="{item_class}">Toast ({bread_type})</div>'
    
    # Drinks
    drinks = order_data.get('drinks', {})
    if drinks.get('water'):
        items_html += f'<div class="{item_class}">Water</div>'
    if drinks.get('milk'):
        items_html += f'<div class="{item_class}">Milk</div>'
    if drinks.get('coffee'):
        items_html += f'<div class="{item_class}">Coffee</div>'
    if drinks.get('tea'):
        items_html += f'<div class="{item_class}">Tea</div>'
    
    juice = drinks.get('juice', {})
    if juice.get('selected'):
        juice_type = juice.get('juiceType', 'regular')
        items_html += f'<div class="{item_class}">Juice ({juice_type})</div>'
    
    # Special Options
    special_options = order_data.get('specialOptions', '').strip()
    if special_options:
        if layout_type == "mobile":
            items_html += f'<div class="{item_class}" style="color: #e67e22; font-style: italic;">Special: {special_options}</div>'
        else:
            items_html += f'<div class="{item_class}" style="color: #e67e22; font-style: italic; margin-top: 8px;">Special Options: {special_options}</div>'
    
    return items_html


def send_breakfast_report_email(to_email, from_email, table_name, date, orders, analysis):
    """
    Send a formatted email report for breakfast orders

    Args:
        to_email (str): Recipient email address
        from_email (str): Sender email address (must be verified in SES)
        table_name (str): Name of the DynamoDB table
        date (str): Date for the report
        orders (list): List of breakfast orders
        analysis (dict): Analysis results

    Returns:
        dict: Response from SES
    """
    try:
        # Sort orders chronologically by time
        sorted_orders = sort_orders_by_time(orders)
        
        # Generate HTML email
        html_content = generate_breakfast_email_html(sorted_orders, analysis, date)

        # Create text version
        text_content = f"""
Breakfast Orders - {datetime.strptime(date, '%Y-%m-%d').strftime('%A, %B %d, %Y')}

Summary:
- Total Orders: {analysis['total_orders']}
- First Breakfast: {analysis['earliest_time'] or 'N/A'}
- Last Breakfast: {analysis['latest_time'] or 'N/A'}

Item Counts:
{chr(10).join([f"- {item}: {count}" for item, count in sorted(analysis['item_counts'].items())])}

Individual Orders:
{chr(10).join([f"- {order.get('order_data', {}).get('customer', {}).get('firstName', 'Unknown')} (Room {order.get('order_data', {}).get('customer', {}).get('roomNumber', 'N/A')}) at {order.get('order_data', {}).get('scheduling', {}).get('time', 'N/A')}" for order in sorted_orders])}
        """

        # Send email
        subject = f"Breakfast - {datetime.strptime(date, '%Y-%m-%d').strftime('%B %d, %Y')}"

        response = emailclient.send_email(
            Source=from_email,
            Destination={
                'ToAddresses': [to_email],
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': text_content,
                        'Charset': 'UTF-8'
                    },
                    'Html': {
                        'Data': html_content,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )

        logger.info(f"Breakfast report email sent successfully to {to_email}")
        logger.info(f"Message ID: {response['MessageId']}")
        logger.info(f"Orders processed: {len(orders)}")

        return response

    except Exception as e:
        logger.error(f"Error sending breakfast report email: {e}")
        raise e


# For local testing only
if __name__ == "__main__":
    # Test the lambda function locally
    test_event = {
        'date': None  # Use today's date
    }

    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
