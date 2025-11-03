class CartService:
    def __init__(self, cart_repo, product_repo):
        self.cart_repo = cart_repo
        self.product_repo = product_repo

    def add_to_cart(self, user_id, product_id, quantity):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        if product.stock < quantity:
            raise ValueError("Not enough stock available")

        cart = self.cart_repo.get_or_create_cart(user_id)
        self.cart_repo.add_item(cart, product, quantity)
        return cart

    def view_cart(self, user_id):
        cart = self.cart_repo.get_cart(user_id)
        if not cart:
            raise ValueError("Cart is empty")
        return cart

    def remove_from_cart(self, user_id, item_id):
        cart = self.cart_repo.get_cart(user_id)
        if not cart:
            raise ValueError("Cart not found")
        self.cart_repo.remove_item(cart, item_id)
        return cart
