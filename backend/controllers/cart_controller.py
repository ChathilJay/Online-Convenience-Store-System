from flask import Blueprint, jsonify, request, g

from middleware.auth_middleware import auth_middleware
from repositories.cart_repository import CartRepository
from repositories.product_repository import ProductRepository
from services.cart_service import CartService

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")

cart_service = CartService(CartRepository(), ProductRepository())


@cart_bp.route("", methods=["GET"])
@auth_middleware
def view_cart():
    try:
        cart = cart_service.view_cart(g.user.id)
        return jsonify(cart.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@cart_bp.route("/add", methods=["POST"])
@auth_middleware
def add_to_cart():
    data = request.json
    try:
        product_id = data["product_id"]
        quantity = data.get("quantity", 1)
        cart = cart_service.add_to_cart(g.user.id, product_id, quantity)
        return jsonify({"message": "Added to cart",
                       "cart": cart.to_dict()}), 200
    except (KeyError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@cart_bp.route("/remove", methods=["POST"])
@auth_middleware
def remove_from_cart():
    data = request.json
    try:
        item_id = data["item_id"]
        cart = cart_service.remove_from_cart(g.user.id, item_id)
        return jsonify({"message": "Item removed",
                       "cart": cart.to_dict()}), 200
    except (KeyError, ValueError) as e:
        return jsonify({"error": str(e)}), 400
