import json
import boto3
import boto3.dynamodb.conditions
import os

# Initialize DynamoDB resource with optional region/endpoint configuration
def get_dynamodb_resource():
    """Get DynamoDB resource - works both locally and in Lambda"""
    # For local testing, you can set AWS_REGION environment variable
    region = os.environ.get('AWS_REGION', 'ca-central-1')

    # For local testing with LocalStack or DynamoDB Local, uncomment this:
    # endpoint_url = os.environ.get('DYNAMODB_ENDPOINT', None)
    # if endpoint_url:
    #     return boto3.resource('dynamodb', region_name=region, endpoint_url=endpoint_url)

    return boto3.resource('dynamodb', region_name=region)
def lambda_handler(event, context):
    # Handle CORS preflight OPTIONS request for Function URLs
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400"
            },
            "body": json.dumps({"message": "CORS preflight successful"})
        }

    # Check if the request is a POST (Function URL format)
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod")
    if http_method != "POST":
        return {
            "statusCode": 405,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"error": "Method Not Allowed"})
        }

    # Parse JSON body
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"error": "Invalid JSON"})
        }
    print("Recieved request, data: " + json.dumps(body))

    # Initialize DynamoDB
    dynamo = get_dynamodb_resource()

    print("Checking authentication")
    print("Getting all valid credentials from Dynamo")
    try:
        table = dynamo.Table('benfen-tokens')

        # Get all tokens from the table
        response = table.scan()
        items = response['Items']

        if items:
            print(f"Found {len(items)} credentials in database")
            # Extract all valid tokens
            valid_tokens = [item.get('token') for item in items if item.get('token')]
            print(f"Valid tokens available: {len(valid_tokens)}")
        else:
            print("No items found in table")
            valid_tokens = []

    except Exception as e:
        print(f"Error getting credentials from DynamoDB: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"error": "Database error"})
        }
    # Check if we have any valid tokens
    if not valid_tokens:
        print("No valid credentials found")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"error": "Database error (no valid credentials)"})
        }

    # Validate the provided token against all valid tokens
    params = body["urlParameters"]
    token = params["t"]

    if token not in valid_tokens:
        print(f"Attempt to order breakfast with invalid token: {token}")
        print(f"Valid tokens: {valid_tokens}")
        return {
            "statusCode": 401,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"error": "Unauthorized. Try re-scanning the QR Code, or the QR code may have expired."})
        }

    print(f"Token validated successfully: {token}")

    data = body
    customer = data["customer"]
    roomnum = customer["roomNumber"]
    name = customer["firstName"]
    roomnum
    eggs = data["eggs"]
    eggStyle = eggs["style"]
    if eggStyle == "over":
        overStyle = eggs["overStyle"]
    else:
        overStyle = None
    pancakesmeta = data["pancakes"]
    if pancakesmeta["selected"] == True:
        pancakes = True
    else:
        pancakes = False
    if pancakes:
        pancaketoppings = pancakesmeta["toppings"]
        pancakeberries = pancaketoppings["berries"]
        pancakebacon = pancaketoppings["bacon"]
        pancakecream = pancaketoppings["whippedCream"]
    wafflesmeta = data["waffles"]
    if wafflesmeta["selected"] == True:
        waffles = True
    else:
        waffles = False
    if waffles:
        wafflestoppings = wafflesmeta["options"]
        wafflesberries = wafflestoppings["berries"]
        wafflesbacon = wafflestoppings["bacon"]
        wafflescream = wafflestoppings["whippedCream"]
    pass
    sides = data["sides"]
    bacon = sides["bacon"]
    homeFries = sides["homeFries"]
    beans = sides["beans"]
    toast = sides["toast"]
    toastselected = toast["selected"]
    if toastselected:
        breadType = toast["breadType"]
    
    # Extract drinks information
    drinks = data["drinks"]
    water = drinks["water"]
    milk = drinks["milk"]
    juice = drinks["juice"]
    juiceselected = juice["selected"]
    if juiceselected:
        juiceType = juice["juiceType"]
    coffee = drinks["coffee"]
    tea = drinks["tea"]

    # Extract scheduling information
    scheduling = data["scheduling"]
    delivery_date = scheduling["date"]
    delivery_time = scheduling["time"]

    # Extract special options
    special_options = data.get("specialOptions", "").strip()

    # Create order data object from extracted values
    order_data = {
        "customer": {
            "firstName": customer.get("firstName"),
            "roomNumber": roomnum
        },
        "eggs": {
            "style": eggStyle
        },
        "pancakes": {
            "selected": pancakes
        },
        "waffles": {
            "selected": waffles
        },
        "sides": {
            "bacon": bacon,
            "homeFries": homeFries,
            "beans": beans,
            "toast": {
                "selected": toastselected
            }
        },
        "drinks": {
            "water": water,
            "milk": milk,
            "juice": {
                "selected": juiceselected
            },
            "coffee": coffee,
            "tea": tea
        },
        "scheduling": {
            "date": delivery_date,
            "time": delivery_time
        },
        "specialOptions": special_options
    }

    # Add conditional fields
    if overStyle is not None:
        order_data["eggs"]["overStyle"] = overStyle

    if pancakes:
        order_data["pancakes"]["toppings"] = {
            "berries": pancakeberries,
            "bacon": pancakebacon,
            "whippedCream": pancakecream
        }

    if waffles:
        order_data["waffles"]["options"] = {
            "berries": wafflesberries,
            "bacon": wafflesbacon,
            "whippedCream": wafflescream
        }

    if toastselected:
        order_data["sides"]["toast"]["breadType"] = breadType
    
    if juiceselected:
        order_data["drinks"]["juice"]["juiceType"] = juiceType

    print("Processed order data:", json.dumps(order_data, indent=2))

    # Save order to DynamoDB
    orders = dynamo.Table('benfen-breakfast')

    # Create partition key from delivery date
    partition_key = f"bk_{delivery_date}"

    # Check if an order already exists for this room/name combination on this date
    room_name_key = f"{roomnum}-{name}"

    try:
        # Query for existing orders with the same partition key and room-name combination
        existing_response = orders.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('bk_yyyy-mm-dd').eq(partition_key) &
                                 boto3.dynamodb.conditions.Key('roomnumber-name').eq(room_name_key)
        )

        # If an existing order is found, delete it first
        if existing_response['Items']:
            existing_order = existing_response['Items'][0]  # Should only be one due to primary key constraint
            print(f"Found existing order for {room_name_key} on {delivery_date}, deleting it")

            orders.delete_item(
                Key={
                    'bk_yyyy-mm-dd': partition_key,
                    'roomnumber-name': room_name_key
                }
            )
            print(f"Deleted existing order for {room_name_key}")
        else:
            print(f"No existing order found for {room_name_key} on {delivery_date}")

    except Exception as e:
        print(f"Error checking for existing orders: {e}")
        # Continue with saving the new order even if check fails

    # Add metadata to order
    import time
    from decimal import Decimal

    order_item = {
        "bk_yyyy-mm-dd": partition_key,  # Partition key
        "roomnumber-name": room_name_key,  # Sort key
        "order_id": f"{int(time.time())}_{roomnum}",
        "order_data": order_data,
        "created_at": Decimal(str(time.time())),  # Convert float to Decimal
    }

    try:
        orders.put_item(Item=order_item)
        print(f"Order saved to DynamoDB with key: {partition_key}")
    except Exception as e:
        print(f"Error saving order to DynamoDB: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"error": "Failed to save order"})
        }

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        "body": json.dumps({
            "message": "Order received and saved successfully",
            "order_id": order_item["order_id"],
            "customer": customer,
            "order": order_data
        })
    }
if __name__ == "__main__":
    # Load environment variables for local testing
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("Loaded environment variables from .env file")
    except ImportError:
        print("python-dotenv not installed, using system environment variables")

    with open('testdata.json', 'r', encoding='utf-8') as f:
        testdata = json.load(f)
    test_event = {
        "httpMethod": "POST",
        "body": json.dumps(testdata)
    }
    response = lambda_handler(test_event, None)
    print(response)
