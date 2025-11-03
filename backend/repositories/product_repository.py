from database.db import db
from models.product import Product


class ProductRepository:
    def get_all(self):
        return Product.query.all()

    def get_by_id(self, product_id):
        return Product.query.get(product_id)

    def create(self, product):
        db.session.add(product)
        db.session.commit()
        return product

    def update(self, product):
        db.session.commit()
        return product

    def delete(self, product_id):
        product = self.get_by_id(product_id)
        if product:
            db.session.delete(product)
            db.session.commit()
            return True
        return False
