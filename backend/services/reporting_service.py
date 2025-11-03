from datetime import datetime, timedelta
from models.order import Order
import csv
from io import StringIO


class ReportingService:
    """Service for generating sales reports and analytics"""

    def get_sales_summary(self, start_date=None, end_date=None):
        """
        Get aggregated sales statistics for a period.
        If no dates provided, returns last 30 days.
        """
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()

        # Query orders in date range that are paid
        orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status.in_(['paid', 'dispatched', 'delivered'])
        ).all()

        if not orders:
            return {
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'total_revenue': 0.0,
                'order_count': 0,
                'items_sold': 0,
                'avg_order_value': 0.0,
                'top_products': [],
                'top_categories': []
            }

        # Calculate metrics
        total_revenue = sum(order.total_amount for order in orders)
        order_count = len(orders)
        items_sold = sum(
            sum(item.quantity for item in order.items)
            for order in orders
        )
        avg_order_value = total_revenue / order_count if order_count > 0 else 0

        # Get top products
        top_products = self._get_top_products(orders, limit=10)

        # Get top categories
        top_categories = self._get_top_categories(orders)

        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'total_revenue': round(total_revenue, 2),
            'order_count': order_count,
            'items_sold': items_sold,
            'avg_order_value': round(avg_order_value, 2),
            'top_products': top_products,
            'top_categories': top_categories
        }

    def get_sales_by_category(self, start_date=None, end_date=None):
        """Get sales breakdown by category"""
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()

        orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status.in_(['paid', 'dispatched', 'delivered'])
        ).all()

        category_stats = {}
        for order in orders:
            for item in order.items:
                product = item.product
                category = product.category if product else 'Unknown'

                if category not in category_stats:
                    category_stats[category] = {
                        'category': category,
                        'items_sold': 0,
                        'revenue': 0.0,
                        'order_count': 0
                    }

                category_stats[category]['items_sold'] += item.quantity
                category_stats[category]['revenue'] += item.line_total
                category_stats[category]['order_count'] += 1

        # Sort by revenue
        sorted_stats = sorted(
            category_stats.values(),
            key=lambda x: x['revenue'],
            reverse=True
        )

        return sorted_stats

    def get_daily_sales(self, start_date=None, end_date=None):
        """Get sales aggregated by day"""
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()

        orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status.in_(['paid', 'dispatched', 'delivered'])
        ).all()

        daily_stats = {}
        for order in orders:
            day = order.created_at.date().isoformat()

            if day not in daily_stats:
                daily_stats[day] = {
                    'date': day,
                    'revenue': 0.0,
                    'order_count': 0,
                    'items_sold': 0
                }

            daily_stats[day]['revenue'] += order.total_amount
            daily_stats[day]['order_count'] += 1
            daily_stats[day]['items_sold'] += sum(
                item.quantity for item in order.items
            )

        # Sort by date
        sorted_stats = sorted(
            daily_stats.values(),
            key=lambda x: x['date']
        )

        return sorted_stats

    def export_sales_to_csv(self, start_date=None,
                            end_date=None, report_type='summary'):
        """
        Export sales report to CSV format.
        Returns CSV string that can be downloaded.

        report_type: 'summary', 'daily', or 'category'
        """
        output = StringIO()

        if report_type == 'summary':
            data = self.get_sales_summary(start_date, end_date)
            writer = csv.DictWriter(
                output,
                fieldnames=['metric', 'value']
            )
            writer.writeheader()

            period_info = data['period']
            writer.writerow({'metric': 'Period Start',
                            'value': period_info['start_date']})
            writer.writerow(
                {'metric': 'Period End', 'value': period_info['end_date']})
            writer.writerow({'metric': 'Total Revenue',
                            'value': data['total_revenue']})
            writer.writerow(
                {'metric': 'Order Count', 'value': data['order_count']})
            writer.writerow(
                {'metric': 'Items Sold', 'value': data['items_sold']})
            writer.writerow({'metric': 'Avg Order Value',
                            'value': data['avg_order_value']})

        elif report_type == 'daily':
            data = self.get_daily_sales(start_date, end_date)
            writer = csv.DictWriter(
                output,
                fieldnames=['date', 'revenue', 'order_count', 'items_sold']
            )
            writer.writeheader()
            writer.writerows(data)

        elif report_type == 'category':
            data = self.get_sales_by_category(start_date, end_date)
            writer = csv.DictWriter(
                output,
                fieldnames=['category', 'items_sold', 'revenue', 'order_count']
            )
            writer.writeheader()
            writer.writerows(data)

        return output.getvalue()

    def _get_top_products(self, orders, limit=10):
        """Get top selling products"""
        product_stats = {}

        for order in orders:
            for item in order.items:
                product_id = item.product_id
                if product_id not in product_stats:
                    product_stats[product_id] = {
                        'product_id': product_id,
                        'product_name': item.product_name,
                        'quantity_sold': 0,
                        'revenue': 0.0
                    }

                product_stats[product_id]['quantity_sold'] += item.quantity
                product_stats[product_id]['revenue'] += item.line_total

        # Sort by revenue and limit
        sorted_products = sorted(
            product_stats.values(),
            key=lambda x: x['revenue'],
            reverse=True
        )[:limit]

        return sorted_products

    def _get_top_categories(self, orders):
        """Get top categories by revenue"""
        return self.get_sales_by_category(
            start_date=orders[0].created_at if orders else None,
            end_date=orders[-1].created_at if orders else None
        )[:5]
