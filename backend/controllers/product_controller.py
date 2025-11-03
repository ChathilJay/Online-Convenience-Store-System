from flask import Blueprint, jsonify, request
from repositories.product_repository import ProductRepository
from services.product_service import ProductService
from services.notification_service import NotificationService
from middleware.admin_middleware import admin_required
from utils.image_handler import allowed_file

product_bp = Blueprint("product", __name__, url_prefix="/api/products")

# Initialize services
product_service = ProductService(ProductRepository())
notification_service = NotificationService()

# Attach notification service as observer
product_service.attach(notification_service)


@product_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = product_service.get_all_categories()
    return jsonify(categories), 200


@product_bp.route("/", methods=["GET"])
def get_all_products():
    category = request.args.get('category')
    include_inactive = request.args.get(
        'include_inactive', 'false').lower() == 'true'
    products = product_service.get_all_products(
        category=category, include_inactive=include_inactive)
    return jsonify([p.to_dict() for p in products]), 200


@product_bp.route("/", methods=["POST"])
@admin_required
def create_product():
    if 'image' not in request.files:
        return jsonify({'message': 'No image file provided'}), 400

    image = request.files['image']
    if image.filename == '' or not allowed_file(image.filename):
        return jsonify({'message': 'Invalid image file'}), 400

    data = request.form
    required_fields = ['name', 'price', 'stock']

    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        product = product_service.create_product(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            stock=int(data['stock']),
            category=data.get('category', 'general'),
            image=image
        )
        return jsonify(product.to_dict()), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400


@product_bp.route("/<int:product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    data = {}
    if request.form:
        data = request.form.to_dict()
        if 'price' in data:
            data['price'] = float(data['price'])
        if 'stock' in data:
            data['stock'] = int(data['stock'])

    image = request.files.get('image')
    if image and image.filename != '' and not allowed_file(image.filename):
        return jsonify({'message': 'Invalid image file'}), 400

    product = product_service.update_product(
        product_id, data, image=image if image else None)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(product.to_dict()), 200


@product_bp.route("/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):
    if product_service.delete_product(product_id):
        return jsonify({'message': 'Product deactivated'}), 200
    return jsonify({'message': 'Product not found'}), 404


@product_bp.route("/<int:product_id>/activate", methods=["POST"])
@admin_required
def activate_product(product_id):
    """Activate a deactivated product"""
    try:
        product = product_service.activate_product(product_id)
        return jsonify({
            'message': 'Product activated successfully',
            'product': product.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404


@product_bp.route("/<int:product_id>/deactivate", methods=["POST"])
@admin_required
def deactivate_product(product_id):
    """Deactivate a product (soft delete)"""
    try:
        product = product_service.deactivate_product(product_id)
        return jsonify({
            'message': 'Product deactivated successfully',
            'product': product.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404


@product_bp.route("/<int:product_id>/permanent", methods=["DELETE"])
@admin_required
def permanently_delete_product(product_id):
    """Permanently delete a product from the database"""
    try:
        product_service.permanently_delete_product(product_id)
        return jsonify({
            'message': 'Product permanently deleted successfully'
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
