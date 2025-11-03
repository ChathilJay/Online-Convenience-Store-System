from database.db import db
from models.cart import Cart
from models.cart_item import CartItem


class CartRepository:
    def get_or_create_cart(self, user_id):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        return cart

    def add_item(self, cart, product, quantity):
        existing_item = next(
            (i for i in cart.items if i.product_id == product.id), None)
        if existing_item:
            existing_item.quantity += quantity
        else:
            db.session.add(
                CartItem(
                    cart=cart,
                    product=product,
                    quantity=quantity))
        db.session.commit()
        return cart

    def remove_item(self, cart, item_id):
        item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if item:
            db.session.delete(item)
            db.session.commit()

    def get_cart(self, user_id):
        return Cart.query.filter_by(user_id=user_id).first()

    def clear_cart(self, user_id):
        cart = self.get_cart(user_id)
        if cart:
            for item in cart.items:
                db.session.delete(item)
            db.session.commit()
