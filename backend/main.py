from flask import Flask, send_from_directory
from config import Config
from flask_cors import CORS
from controllers.auth_controller import auth_bp
from controllers.cart_controller import cart_bp
from controllers.product_controller import product_bp
from controllers.order_controller import order_bp
from controllers.payment_controller import payment_bp
from controllers.invoice_controller import invoice_bp
from controllers.sse_controller import sse_bp
from controllers.receipt_controller import receipt_bp
from controllers.report_controller import report_bp
from database.db import init_db

# Import models to register with SQLAlchemy
from models import user, product, cart, cart_item, order, order_item, payment, IdempotencyKey, invoice, receipt

# --- Initialize Flask App ---
app = Flask(__name__)
app.config.from_object(Config)

# Disable trailing slash redirects to prevent CORS preflight issues
app.url_map.strict_slashes = False

# Configure CORS to allow all origins and the Authorization header
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "idempotency-key"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})

# --- Initialize Database ---
db = init_db(app)

# --- Register Blueprints ---
app.register_blueprint(auth_bp)
app.register_blueprint(product_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(order_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(invoice_bp)
app.register_blueprint(sse_bp)
app.register_blueprint(receipt_bp)
app.register_blueprint(report_bp)


# --- Serve Static Files ---
@app.route('/static/product_images/<path:filename>')
def serve_product_image(filename):
    return send_from_directory('static/product_images', filename)

# --- Basic Test Route ---
@app.route('/')
def home():
    return {"message": "Online Convenience Store API running"}


if __name__ == "__main__":
    app.run(debug=True)
