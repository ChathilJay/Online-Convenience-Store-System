# Mock data for development and testing

mock_customers = {
    "cust_001": {
        "customer_id": "cust_001",
        "name": "John Doe",
        "email": "john@example.com",
        "addresses": [
            {
                "address_id": "addr_001",
                "street": "123 Main St",
                "city": "Melbourne",
                "state": "VIC",
                "postcode": "3000",
                "country": "Australia",
            }
        ],
    },
    "cust_002": {
        "customer_id": "cust_002",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "addresses": [
            {
                "address_id": "addr_002",
                "street": "456 Oak Ave",
                "city": "Sydney",
                "state": "NSW",
                "postcode": "2000",
                "country": "Australia",
            }
        ],
    },
    "cust_003": {
        "customer_id": "cust_003",
        "name": "Bob Johnson",
        "email": "bob@example.com",
        "addresses": [
            {
                "address_id": "addr_003",
                "street": "789 Pine Rd",
                "city": "Brisbane",
                "state": "QLD",
                "postcode": "4000",
                "country": "Australia",
            }
        ],
    },
}

mock_products = {
    "prod_001": {
        "product_id": "prod_001",
        "name": "Laptop",
        "price": 999.99,
        "stock_quantity": 10,
        "is_active": True,
    },
    "prod_002": {
        "product_id": "prod_002",
        "name": "Mouse",
        "price": 29.99,
        "stock_quantity": 50,
        "is_active": True,
    },
    "prod_003": {
        "product_id": "prod_003",
        "name": "Keyboard",
        "price": 79.99,
        "stock_quantity": 30,
        "is_active": True,
    },
    "prod_004": {
        "product_id": "prod_004",
        "name": "Monitor",
        "price": 299.99,
        "stock_quantity": 15,
        "is_active": True,
    },
    "prod_005": {
        "product_id": "prod_005",
        "name": "Headphones",
        "price": 149.99,
        "stock_quantity": 25,
        "is_active": True,
    },
}

mock_carts = {
    "cart_001": {
        "cart_id": "cart_001",
        "customer_id": "cust_001",
        "created_at": "2024-01-15T10:00:00Z",
    },
    "cart_002": {
        "cart_id": "cart_002",
        "customer_id": "cust_002",
        "created_at": "2024-01-16T14:30:00Z",
    },
    "cart_003": {
        "cart_id": "cart_003",
        "customer_id": "cust_003",
        "created_at": "2024-01-17T09:15:00Z",
    },
}

mock_cart_items = {
    "cart_item_001": {
        "cart_item_id": "cart_item_001",
        "cart_id": "cart_001",
        "product_id": "prod_001",
        "quantity": 1,
        "unit_price": 999.99,
    },
    "cart_item_002": {
        "cart_item_id": "cart_item_002",
        "cart_id": "cart_001",
        "product_id": "prod_002",
        "quantity": 2,
        "unit_price": 29.99,
    },
    "cart_item_003": {
        "cart_item_id": "cart_item_003",
        "cart_id": "cart_002",
        "product_id": "prod_003",
        "quantity": 1,
        "unit_price": 79.99,
    },
    "cart_item_004": {
        "cart_item_id": "cart_item_004",
        "cart_id": "cart_002",
        "product_id": "prod_005",
        "quantity": 1,
        "unit_price": 149.99,
    },
    "cart_item_005": {
        "cart_item_id": "cart_item_005",
        "cart_id": "cart_003",
        "product_id": "prod_004",
        "quantity": 1,
        "unit_price": 299.99,
    },
    "cart_item_006": {
        "cart_item_id": "cart_item_006",
        "cart_id": "cart_003",
        "product_id": "prod_001",
        "quantity": 1,
        "unit_price": 999.99,
    },
}
