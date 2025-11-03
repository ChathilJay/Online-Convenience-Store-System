from flask import Blueprint, jsonify, request, send_file
from middleware.admin_middleware import admin_required
from services.reporting_service import ReportingService
from datetime import datetime
from io import BytesIO

report_bp = Blueprint("report", __name__, url_prefix="/api/reports")

# Initialize service
reporting_service = ReportingService()


@report_bp.route("/sales/summary", methods=["GET"])
@admin_required
def get_sales_summary():
    """
    Get sales summary for a period.
    Query params:
    - start_date: ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
    - end_date: ISO format
    If not provided, defaults to last 30 days.
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        start_dt = None
        end_dt = None

        if start_date:
            start_dt = datetime.fromisoformat(
                start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        summary = reporting_service.get_sales_summary(start_dt, end_dt)
        return jsonify(summary), 200

    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route("/sales/daily", methods=["GET"])
@admin_required
def get_daily_sales():
    """
    Get daily sales breakdown.
    Query params:
    - start_date: ISO format
    - end_date: ISO format
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        start_dt = None
        end_dt = None

        if start_date:
            start_dt = datetime.fromisoformat(
                start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        daily = reporting_service.get_daily_sales(start_dt, end_dt)
        return jsonify(daily), 200

    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route("/sales/by-category", methods=["GET"])
@admin_required
def get_sales_by_category():
    """
    Get sales breakdown by category.
    Query params:
    - start_date: ISO format
    - end_date: ISO format
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        start_dt = None
        end_dt = None

        if start_date:
            start_dt = datetime.fromisoformat(
                start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        category_sales = reporting_service.get_sales_by_category(
            start_dt, end_dt)
        return jsonify(category_sales), 200

    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route("/sales/export", methods=["GET"])
@admin_required
def export_sales_report():
    """
    Export sales report to CSV.
    Query params:
    - start_date: ISO format
    - end_date: ISO format
    - type: 'summary', 'daily', or 'category' (default: summary)
    """
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        report_type = request.args.get('type', 'summary')

        # Validate report type
        if report_type not in ['summary', 'daily', 'category']:
            return jsonify(
                {'error': 'Invalid report type. Must be summary, daily, or category'}), 400

        start_dt = None
        end_dt = None

        if start_date:
            start_dt = datetime.fromisoformat(
                start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        # Generate CSV
        csv_content = reporting_service.export_sales_to_csv(
            start_dt, end_dt, report_type)

        # Create file-like object
        output = BytesIO()
        output.write(csv_content.encode('utf-8'))
        output.seek(0)

        # Generate filename with date
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f'sales_report_{report_type}_{timestamp}.csv'

        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )

    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
