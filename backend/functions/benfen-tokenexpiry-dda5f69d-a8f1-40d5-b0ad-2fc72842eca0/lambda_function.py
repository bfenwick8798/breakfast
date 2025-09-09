import json
import boto3
from datetime import datetime
from decimal import Decimal
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    """
    AWS Lambda function to delete the oldest item in a DynamoDB table.
    
    Expected event structure:
    {
        "table_name": "your-dynamodb-table-name",
        "timestamp_attribute": "created_at",  # The attribute containing timestamp
        "delete_count": 1  # Optional: number of oldest items to delete (default: 1)
    }
    """
    try:
        # Extract parameters from event
        table_name = event.get('table_name')
        timestamp_attribute = event.get('timestamp_attribute', 'created_at')
        delete_count = event.get('delete_count', 1)
        
        if not table_name:
            raise ValueError("table_name is required in the event")
        
        # Get reference to the DynamoDB table
        table = dynamodb.Table(table_name)
        
        # Scan the table and find the oldest items
        logger.info(f"Scanning table {table_name} to find oldest items")
        
        response = table.scan(
            ProjectionExpression='#ts, #pk, #token',
            ExpressionAttributeNames={
                '#ts': timestamp_attribute,
                '#pk': 'type',
                '#token': 'token'  # Include token field which might be part of the key
            }
        )
        
        items = response['Items']
        
        # Handle pagination if there are more items
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ProjectionExpression='#ts, #pk, #token',
                ExpressionAttributeNames={
                    '#ts': timestamp_attribute,
                    '#pk': 'type',
                    '#token': 'token'
                },
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response['Items'])
        
        if not items:
            logger.info("No items found in the table")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'No items found in the table',
                    'deleted_count': 0
                })
            }
        
        # Sort items by timestamp (oldest first)
        # Handle both string and numeric timestamps
        def get_timestamp_value(item):
            ts_value = item[timestamp_attribute]
            if isinstance(ts_value, (int, float, Decimal)):
                return float(ts_value)
            elif isinstance(ts_value, str):
                try:
                    # Try parsing as ISO format first
                    return datetime.fromisoformat(ts_value.replace('Z', '+00:00')).timestamp()
                except ValueError:
                    try:
                        # Try parsing as timestamp
                        return float(ts_value)
                    except ValueError:
                        logger.warning(f"Could not parse timestamp: {ts_value}")
                        return 0
            return 0
        
        sorted_items = sorted(items, key=get_timestamp_value)
        
        # Get the oldest items to delete
        items_to_delete = sorted_items[:delete_count]
        
        deleted_items = []
        
        # Delete the oldest items
        for item in items_to_delete:
            try:
                # Build the key for deletion - include both partition key (type) and sort key (created_at)
                delete_key = {
                    'type': item['type'],
                    'created_at': item['created_at']
                }
                
                table.delete_item(Key=delete_key)
                
                deleted_items.append({
                    'type': item['type'],
                    'created_at': item['created_at'],
                    'token': item.get('token', '')
                })
                logger.info(f"Deleted item with type: {item['type']}, created_at: {item['created_at']}")
                
            except Exception as delete_error:
                logger.error(f"Failed to delete item {item['type']}/{item['created_at']}: {str(delete_error)}")
                raise delete_error
        
        logger.info(f"Successfully deleted {len(deleted_items)} items")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Successfully deleted {len(deleted_items)} oldest items',
                'deleted_count': len(deleted_items),
                'deleted_items': deleted_items
            }, default=str)
        }
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to delete oldest items'
            })
        }

def delete_oldest_items_by_key(table_name, primary_key_name, sort_key_name=None, 
                              timestamp_attribute='created_at', delete_count=1):
    """
    Alternative function for tables with composite keys.
    
    Args:
        table_name: Name of the DynamoDB table
        primary_key_name: Name of the partition key
        sort_key_name: Name of the sort key (optional)
        timestamp_attribute: Attribute containing the timestamp
        delete_count: Number of oldest items to delete
    """
    table = dynamodb.Table(table_name)
    
    # Build projection expression
    projection_attrs = [timestamp_attribute, primary_key_name]
    attr_names = {
        '#ts': timestamp_attribute,
        '#pk': primary_key_name
    }
    
    if sort_key_name:
        projection_attrs.append(sort_key_name)
        attr_names['#sk'] = sort_key_name
    
    projection_expression = ', '.join([f'#{attr.replace("-", "_")}' if "-" in attr else f'#{attr[:2]}' 
                                     for attr in projection_attrs])
    
    # Scan table
    response = table.scan(
        ProjectionExpression=projection_expression,
        ExpressionAttributeNames=attr_names
    )
    
    items = response['Items']
    
    # Handle pagination
    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ProjectionExpression=projection_expression,
            ExpressionAttributeNames=attr_names,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])
    
    if not items:
        return []
    
    # Sort by timestamp
    def get_timestamp_value(item):
        ts_value = item[timestamp_attribute]
        if isinstance(ts_value, (int, float, Decimal)):
            return float(ts_value)
        elif isinstance(ts_value, str):
            try:
                return datetime.fromisoformat(ts_value.replace('Z', '+00:00')).timestamp()
            except ValueError:
                try:
                    return float(ts_value)
                except ValueError:
                    return 0
        return 0
    
    sorted_items = sorted(items, key=get_timestamp_value)
    items_to_delete = sorted_items[:delete_count]
    
    deleted_items = []
    
    for item in items_to_delete:
        # Build key for deletion
        key = {primary_key_name: item[primary_key_name]}
        if sort_key_name and sort_key_name in item:
            key[sort_key_name] = item[sort_key_name]
        
        try:
            table.delete_item(Key=key)
            deleted_items.append(item)
        except Exception as e:
            logger.error(f"Failed to delete item: {e}")
            raise e
    
    return deleted_items
