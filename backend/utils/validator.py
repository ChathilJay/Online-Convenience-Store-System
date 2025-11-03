import re


def validate_phone_number(phone_number):
    if not phone_number:
        return True  # Phone number is optional
    # Basic phone number validation (allows various formats)
    pattern = r'^\+?1?\d{9,15}$'
    return bool(re.match(pattern, phone_number))


def validate_postal_code(postal_code):
    if not postal_code:
        return True  # Postal code is optional
    # Basic postal code validation (allows various formats)
    pattern = r'^[A-Za-z0-9\s-]{3,10}$'
    return bool(re.match(pattern, postal_code))


def validate_profile_update(data):
    errors = []

    # Validate name if provided
    if 'name' in data:
        if not data['name'] or len(data['name'].strip()) < 2:
            errors.append("Name must be at least 2 characters long")

    # Validate phone number if provided
    if 'phone_number' in data and data['phone_number']:
        if not validate_phone_number(data['phone_number']):
            errors.append("Invalid phone number format")

    # Validate postal code if provided
    if 'postal_code' in data and data['postal_code']:
        if not validate_postal_code(data['postal_code']):
            errors.append("Invalid postal code format")

    # Validate city if provided
    if 'city' in data and data['city']:
        if len(data['city'].strip()) < 2:
            errors.append("City name must be at least 2 characters long")

    # Validate state if provided
    if 'state' in data and data['state']:
        if len(data['state'].strip()) < 2:
            errors.append("State name must be at least 2 characters long")

    # Validate country if provided
    if 'country' in data and data['country']:
        if len(data['country'].strip()) < 2:
            errors.append("Country name must be at least 2 characters long")

    return errors


def validate_password_change(data):
    errors = []

    if not data.get('current_password'):
        errors.append("Current password is required")

    if not data.get('new_password'):
        errors.append("New password is required")
    elif len(data['new_password']) < 8:
        errors.append("New password must be at least 8 characters long")

    return errors
