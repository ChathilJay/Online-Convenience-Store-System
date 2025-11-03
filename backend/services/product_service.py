from typing import List
from models.product import Product
from utils.image_handler import save_image, delete_image
from services.notification_service import Observer


class ProductService:
    def __init__(self, product_repo):
        self.product_repo = product_repo
        self._observers: List[Observer] = []

    def attach(self, observer: Observer) -> None:
        """
        Attach an observer to the product service
        """
        self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        """
        Detach an observer from the product service
        """
        self._observers.remove(observer)

    def notify(self, message: str) -> None:
        """
        Notify all observers
        """
        for observer in self._observers:
            observer.update(message)

    def check_low_stock(self, product: Product) -> None:
        """
        Check if product stock is below threshold and notify if necessary
        """
        if product.stock <= product.low_stock_threshold:
            self.notify(
                f"Low stock alert: {product.name} has only {product.stock} units remaining!")

    def get_all_categories(self):
        """
        Get all unique categories from active products
        """
        products = self.product_repo.get_all()
        categories = list(set(p.category for p in products if p.is_active))
        return categories

    def get_all_products(self, category=None, include_inactive=False):
        products = self.product_repo.get_all()
        # Filter active products (unless include_inactive is True)
        if not include_inactive:
            products = [p for p in products if p.is_active]
        if category:
            products = [p for p in products if p.category == category]
        return products

    def get_product(self, product_id):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        return product

    def create_product(self, name, description, price,
                       stock, category='general', image=None):
        image_path = save_image(image) if image else None

        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            image_path=image_path
        )
        product.category = category
        return self.product_repo.create(product)

    def update_product(self, product_id, data, image=None):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            return None

        if image:
            # Delete old image if it exists
            delete_image(product.image_path)
            # Save new image
            product.image_path = save_image(image)

        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'stock' in data:
            product.stock = data['stock']
            self.check_low_stock(product)
        if 'category' in data:
            product.category = data['category']

        return self.product_repo.update(product)

    def delete_product(self, product_id):
        product = self.product_repo.get_by_id(product_id)
        if product:
            # Instead of deleting, mark as inactive
            product.is_active = False
            return self.product_repo.update(product)
        return None

    def activate_product(self, product_id):
        """Activate a deactivated product"""
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        product.is_active = True
        return self.product_repo.update(product)

    def deactivate_product(self, product_id):
        """Deactivate a product (soft delete)"""
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        product.is_active = False
        return self.product_repo.update(product)

    def permanently_delete_product(self, product_id):
        """Permanently delete a product from the database"""
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        # Delete the image file if it exists
        if product.image_path:
            delete_image(product.image_path)

        # Permanently delete from database
        return self.product_repo.delete(product_id)
