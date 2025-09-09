import json
import boto3
import uuid
import time
from datetime import datetime
import qrcode
from PIL import Image, ImageDraw
import io
import base64
import os
import tempfile


# Try to import PyMuPDF, fallback gracefully if not available
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
    print(f"✅ PyMuPDF loaded successfully - Version: {fitz.version}")
except ImportError as e:
    print(f"❌ PyMuPDF import failed: {str(e)}")
    print("   Will use fallback PDF generation")
    PYMUPDF_AVAILABLE = False
except Exception as e:
    print(f"❌ PyMuPDF error: {str(e)}")
    print("   Will use fallback PDF generation")
    PYMUPDF_AVAILABLE = False

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')

# Configuration
TABLE_NAME = os.environ.get('DYNAMODB_TABLE', 'qr-tokens')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')
BASE_URL = os.environ.get('BASE_URL', 'https://breakfast.innatthecape.com')

def lambda_handler(event, context):
    """
    Main Lambda handler for QR code PDF generation
    """
    try:
        # Extract recipient email from event
        recipient_email = event.get('recipient_email')
        if not recipient_email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'recipient_email is required'})
            }
        
        # Step 1: Generate a random string
        token = generate_random_token()
        
        # Step 2: Save to DynamoDB
        save_to_dynamodb(token)
        
        # Step 3: Create URL with token
        qr_url = f"{BASE_URL}?t={token}"
        
        # Step 4: Generate QR Code
        qr_image = generate_qr_code(qr_url)
        
        # Step 5: Add logo to QR Code
        qr_with_logo = add_logo_to_qr(qr_image)
        
        # Step 6: Replace image in template PDF
        pdf_content = create_pdf_with_qr(qr_with_logo)
        
        # Step 7: Email the PDF
        send_email_with_pdf(recipient_email, pdf_content, token)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'QR code PDF generated and sent successfully',
                'token': token,
                'url': qr_url,
                'recipient': recipient_email
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def generate_random_token():
    """Generate a random token string"""
    return str(uuid.uuid4()).replace('-', '')[:25]

def save_to_dynamodb(token):
    """Save token to DynamoDB with timestamp"""
    table = dynamodb.Table(TABLE_NAME)
    
    item = {
        'type': 'token',
        'created_at': str(int(time.time())),
        'token': token
    }
    
    table.put_item(Item=item)
    print(f"Saved token to DynamoDB: {token}")

def generate_qr_code(url):
    """Generate QR code for the given URL"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction for logo overlay
        box_size=10,
        border=4,
    )
    
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR code image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    return qr_image

def add_logo_to_qr(qr_image):
    """Add logo to the center of QR code"""
    try:
        # Load logo from local file
        logo_path = os.path.join(os.path.dirname(__file__), 'logo.png')
        if not os.path.exists(logo_path):
            print("Logo file not found, skipping logo overlay")
            return qr_image
            
        logo = Image.open(logo_path)
        
        # Convert QR image to RGBA if needed
        if qr_image.mode != 'RGBA':
            qr_image = qr_image.convert('RGBA')
        
        # Calculate logo size (about 1/5 of QR code size)
        qr_width, qr_height = qr_image.size
        logo_size = min(qr_width, qr_height) // 5
        
        # Resize logo
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Create a white background for the logo area
        logo_bg = Image.new('RGBA', (logo_size + 20, logo_size + 20), 'white')
        logo_bg.paste(logo, (10, 10), logo)
        
        # Calculate position to center the logo
        logo_pos = ((qr_width - logo_size - 20) // 2, (qr_height - logo_size - 20) // 2)
        
        # Paste logo onto QR code
        qr_image.paste(logo_bg, logo_pos, logo_bg)
        
        return qr_image
        
    except Exception as e:
        print(f"Error adding logo: {str(e)}")
        return qr_image  # Return QR without logo if error

def create_pdf_with_qr(qr_image):
    """Create PDF by replacing existing QR code image in template using PyMuPDF"""
    if not PYMUPDF_AVAILABLE:
        print("PyMuPDF not available, using simple PDF fallback")
        return create_simple_pdf_with_qr(qr_image)
    
    try:
        # Load template PDF from local file
        template_path = os.path.join(os.path.dirname(__file__), 'template.pdf')
        
        if not os.path.exists(template_path):
            print("Template PDF not found, creating simple PDF")
            return create_simple_pdf_with_qr(qr_image)
        
        # Create temporary file for the new QR image
        temp_qr_path = tempfile.mktemp(suffix='.png')
        qr_image.save(temp_qr_path, format='PNG')
        
        # Create temporary output file
        output_path = tempfile.mktemp(suffix='.pdf')
        
        # Use PyMuPDF to replace the image
        success = replace_image_in_pdf(template_path, temp_qr_path, output_path)
        
        if success:
            # Read the final PDF
            with open(output_path, 'rb') as final_pdf:
                pdf_content = final_pdf.read()
            
            # Clean up temporary files
            if os.path.exists(temp_qr_path):
                os.unlink(temp_qr_path)
            if os.path.exists(output_path):
                os.unlink(output_path)
            
            return pdf_content
        else:
            print("Image replacement failed, falling back to simple PDF")
            # Clean up temporary files
            if os.path.exists(temp_qr_path):
                os.unlink(temp_qr_path)
            if os.path.exists(output_path):
                os.unlink(output_path)
            
            return create_simple_pdf_with_qr(qr_image)
        
    except Exception as e:
        print(f"Error creating PDF with QR: {str(e)}")
        return create_simple_pdf_with_qr(qr_image)

def replace_image_in_pdf(template_path, new_image_path, output_path):
    """
    Replace the first image found in a PDF template with a new image using PyMuPDF.
    
    Args:
        template_path: Path to the template PDF
        new_image_path: Path to the new image to insert
        output_path: Path for the output PDF
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not PYMUPDF_AVAILABLE:
        return False
    
    try:
        # Open the template PDF
        pdf_document = fitz.open(template_path)
        
        # Process each page
        images_replaced = 0
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            
            # Get list of images on the page with full details
            image_list = page.get_images(full=True)
            
            if image_list:
                # Replace the first image found
                for img_index, img in enumerate(image_list):
                    # Get image rectangle (position and size)
                    image_bbox = page.get_image_bbox(img)
                    xref = img[0]
                    
                    # Remove the existing image
                    page.delete_image(xref)
                    
                    # Insert the new image at the same position
                    page.insert_image(image_bbox, filename=new_image_path)
                    
                    print(f"Replaced image on page {page_num + 1} at position {image_bbox}")
                    images_replaced += 1
                    break  # Only replace the first image found per page
        
        # Save the modified PDF
        pdf_document.save(output_path)
        pdf_document.close()
        
        print(f"PDF saved with {images_replaced} images replaced")
        return images_replaced > 0
        
    except Exception as e:
        print(f"Error in replace_image_in_pdf: {str(e)}")
        try:
            pdf_document.close()
        except:
            pass
        return False

def create_simple_pdf_with_qr(qr_image):
    """Create a simple PDF with just the QR code as fallback"""
    if PYMUPDF_AVAILABLE:
        try:
            # Create a new PDF document using PyMuPDF
            pdf_document = fitz.open()
            
            # Create a new page (A4 size: 595 x 842 points)
            page = pdf_document.new_page(width=595, height=842)
            
            # Save QR image to temporary file
            temp_qr_path = tempfile.mktemp(suffix='.png')
            qr_image.save(temp_qr_path, format='PNG')
            
            # Calculate position to center the QR code
            qr_size = 200
            x = (595 - qr_size) / 2
            y = (842 - qr_size) / 2
            
            # Insert QR code image
            rect = fitz.Rect(x, y, x + qr_size, y + qr_size)
            page.insert_image(rect, filename=temp_qr_path)
            
            # Add some text
            text_point = fitz.Point(x, y - 30)
            page.insert_text(text_point, "Scan this QR code", fontsize=12)
            
            # Save to bytes
            pdf_bytes = pdf_document.write()
            
            # Clean up
            pdf_document.close()
            if os.path.exists(temp_qr_path):
                os.unlink(temp_qr_path)
            
            return pdf_bytes
            
        except Exception as e:
            print(f"Error creating simple PDF with PyMuPDF: {str(e)}")
    
    # Fallback: Create a minimal PDF without PyMuPDF
    print("Creating minimal PDF fallback")
    
    # Create a very basic PDF structure manually
    # This is a minimal PDF that contains just basic structure
    qr_bytes = io.BytesIO()
    qr_image.save(qr_bytes, format='PNG')
    qr_data = qr_bytes.getvalue()
    
    # For now, return the QR image as PNG data with a note
    # In a real implementation, you might want to use reportlab or another library
    # but for Lambda deployment, this provides a working fallback
    return qr_data  # This will be treated as binary data by the email attachment

def send_email_with_pdf(recipient_email, pdf_content, token):
    """Send email with PDF attachment using AWS SES"""
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.application import MIMEApplication
    
    # Create email
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = recipient_email
    msg['Subject'] = f'New QR Code generated.'
    
    # Email body
    body = f"""
    Hello,
    
    A new QR Code has been generated.
    The current QR Code will expire on the 7th.
    Please replace the current QR Code with the new one attached to this E-mail
    Token: {token}
    Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """
    
    msg.attach(MIMEText(body, 'plain'))
    
    # Attach PDF
    pdf_attachment = MIMEApplication(pdf_content)
    pdf_attachment.add_header('Content-Disposition', 'attachment', filename=f'qr_code_{token}.pdf')
    msg.attach(pdf_attachment)
    
    # Send email
    ses.send_raw_email(
        Source=SENDER_EMAIL,
        Destinations=[recipient_email],
        RawMessage={'Data': msg.as_string()}
    )
    
    print(f"Email sent to {recipient_email}")
