import os
from werkzeug.utils import secure_filename
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = os.path.join(
    os.path.dirname(
        os.path.dirname(__file__)),
    'static',
    'product_images')


def allowed_file(filename):
    return '.' in filename and filename.rsplit(
        '.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image(file):
    if not file or not allowed_file(file.filename):
        return None

    # Generate unique filename
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"

    # Save file
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(file_path)

    # Return relative path for storage in database
    return os.path.join('static', 'product_images', unique_filename)


def delete_image(image_path):
    if not image_path:
        return

    try:
        full_path = os.path.join(
            os.path.dirname(
                os.path.dirname(__file__)),
            image_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception as e:
        print(f"Error deleting image: {e}")
