# Quick Test Guide - Order & Payment System

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate
python main.py
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:5000

## 🧪 Testing Workflow

### Test 1: Complete Checkout Flow
1. **Login** to the application
   - Navigate to http://localhost:5173/login
   - Use existing credentials or register

2. **Add Items to Cart**
   - Go to Products page
   - Add 2-3 items to cart

3. **View Cart**
   - Click cart icon in header
   - Verify items are displayed
   - Check total calculation

4. **Proceed to Checkout**
   - Click "Proceed to Checkout" button
   - Should navigate to `/checkout`

5. **Fill Checkout Form**
   - **Shipping Address:**
     ```
     Street: 123 Main St
     City: San Francisco
     State: CA
     Postal Code: 94105
     Country: USA
     ```
   
   - **Billing Address:**
     - Check "Same as shipping address" OR
     - Fill separate billing address
   
   - **Payment Details:**
     ```
     Card Holder: John Doe
     Card Number: 4111111111111111
     Expiry Date: 12/25
     CVV: 123
     ```

6. **Complete Order**
   - Click "Complete Order"
   - Wait for processing
   - Should redirect to confirmation page

7. **Order Confirmation**
   - Verify order ID is displayed
   - Check order details
   - Verify payment status is "paid"

### Test 2: View Orders List
1. Click **Package icon** in header
2. Should see newly created order
3. Verify:
   - Order ID
   - Date
   - Status badge (green "paid")
   - Total amount
   - Number of items

### Test 3: View Order Details
1. From Orders List, click "View Details"
2. Verify:
   - All order items with images
   - Shipping address
   - Billing address
   - Payment information
   - Order summary

### Test 4: Cancel Order
1. From Order Details page
2. Click "Cancel Order" button
3. Confirm in modal
4. Verify:
   - Order status changes to "cancelled"
   - Status badge turns red
   - Cancel button disappears

### Test 5: Cart Cleared After Checkout
1. Complete a checkout
2. Navigate to cart
3. Verify cart is empty

## 🧪 Test Cases

### ✅ Happy Path Tests

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Checkout with valid data | Order created successfully | ⬜ |
| View order confirmation | Details displayed correctly | ⬜ |
| View orders list | All orders shown | ⬜ |
| View order details | Full information displayed | ⬜ |
| Cancel paid order | Order cancelled successfully | ⬜ |
| Cart cleared after checkout | Cart is empty | ⬜ |

### ⚠️ Error Handling Tests

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Checkout with empty cart | Redirect to cart | ⬜ |
| Invalid card number | Error message shown | ⬜ |
| Missing required fields | Validation errors | ⬜ |
| Cancel dispatched order | Error: cannot cancel | ⬜ |
| Access order of another user | 403 Forbidden | ⬜ |
| Invalid order ID | 404 Not Found | ⬜ |

### 🔄 Edge Cases

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Retry checkout (idempotency) | Same order returned | ⬜ |
| Network error during checkout | Error message shown | ⬜ |
| Expired JWT token | Redirect to login | ⬜ |
| Same billing as shipping | Correct address used | ⬜ |

## 📋 Validation Checklist

### Checkout Page
- [ ] All form fields are required
- [ ] Shipping address validation
- [ ] Billing address validation
- [ ] Payment details validation
- [ ] Card number max length (16)
- [ ] CVV max length (4)
- [ ] Expiry date format (MM/YY)
- [ ] Order summary displays correctly
- [ ] Loading state during submission
- [ ] Error messages display properly

### Order Confirmation
- [ ] Order ID displayed
- [ ] Success message shown
- [ ] Order items with images
- [ ] Shipping address correct
- [ ] Payment status correct
- [ ] Total amount correct
- [ ] Navigation buttons work

### Orders List
- [ ] All orders displayed
- [ ] Status badges color-coded
- [ ] Dates formatted correctly
- [ ] Total amounts correct
- [ ] Empty state when no orders
- [ ] View Details button works
- [ ] Cancel button (conditional)

### Order Details
- [ ] Full order information
- [ ] Items with images
- [ ] Both addresses shown
- [ ] Payment details complete
- [ ] Cancel button (only if paid)
- [ ] Cancel modal works
- [ ] Back button works

## 🐛 Common Issues & Solutions

### Issue: Cart is empty after adding items
**Solution:** Ensure backend is running and JWT token is valid

### Issue: Checkout button does nothing
**Solution:** Check browser console for errors, verify route is configured

### Issue: 401 Unauthorized error
**Solution:** Login again, JWT token may have expired

### Issue: Order not found (404)
**Solution:** Verify order ID in URL, ensure order belongs to logged-in user

### Issue: Cannot cancel order
**Solution:** Check order status, only "paid" orders can be cancelled

### Issue: Image not displaying
**Solution:** Verify image path in backend, check CORS settings

## 🔍 Debug Tips

### Browser Console
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check current user
console.log('Auth:', localStorage.getItem('user'));

// Test API endpoint
fetch('http://127.0.0.1:5000/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(r => r.json())
  .then(console.log);
```

### Network Tab
- Check request payload
- Verify response status
- Check headers (Authorization, Idempotency-Key)
- Review error messages

### Backend Logs
- Watch terminal for API calls
- Check for validation errors
- Verify database operations
- Monitor order status changes

## 📊 Test Data

### Test Cards (Mock Payment)
```
Valid Cards:
- 4111111111111111 (Visa)
- 5500000000000004 (Mastercard)
- 340000000000009 (Amex)

Any future expiry date works (e.g., 12/25)
Any 3-4 digit CVV works
```

### Test Addresses
```
Shipping Address 1:
123 Main St, San Francisco, CA 94105, USA

Shipping Address 2:
456 Oak Ave, New York, NY 10001, USA

Billing Address:
789 Pine Rd, Los Angeles, CA 90001, USA
```

## 📈 Success Criteria

All features working:
- ✅ Checkout flow complete
- ✅ Order creation successful
- ✅ Cart cleared after checkout
- ✅ Orders list displays
- ✅ Order details accurate
- ✅ Order cancellation works
- ✅ Error handling functional
- ✅ Loading states working
- ✅ Styling consistent
- ✅ Navigation smooth

## 🎯 Performance Checks

- [ ] Page load time < 2 seconds
- [ ] API response time < 1 second
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth transitions
- [ ] Images load quickly

## 📝 Test Report Template

```markdown
## Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Duration:** [Time]

### Tests Passed: X/Y

### Issues Found:
1. [Issue description]
   - Severity: [Low/Medium/High]
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]

### Notes:
- [Any additional observations]
```

## 🚀 Ready to Test!

Follow the tests in order, check off items as you go, and report any issues you find. Good luck! 🎉
