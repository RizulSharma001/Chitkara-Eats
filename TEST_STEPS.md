# Testing Authentication Flow

## ✅ What Changed:
1. **Orders require authentication** - Users must sign in before placing orders
2. **Orders linked to users** - Each order is saved with userId and userName
3. **Personal orders** - Users only see their own orders on /orders page
4. **Account page** - Shows logged-in user's profile (name, email, phone)
5. **Old orders cleared** - Database was reset to start fresh

## 🧪 Test Steps:

### 1. Start the servers
```bash
npm run dev
```

### 2. Test Flow:
1. **Go to home page** → Browse outlets
2. **Add items to cart** → Click cart icon
3. **Try to checkout** → System will ask you to sign in
4. **Sign up** → Create a new account (name, email, password, phone optional)
5. **Place order** → Now you can proceed with payment
6. **Check Orders page** → You'll see ONLY your orders
7. **Logout** → Click logout button in navbar
8. **Sign in with different account** → Create another user
9. **Place another order** → This user's order is separate
10. **Check Orders page** → Only shows the current user's orders
11. **Go to Account page** → Shows your profile info

### 3. Vendor Testing:
- Go to `/vendor` page
- Vendor can see **ALL orders** from all users (no auth needed)

## 🎯 Expected Results:
- ✅ Cannot place order without signing in
- ✅ Each user sees only their own orders
- ✅ User info shows on Account page
- ✅ Offers popup appears after 8 seconds (if not logged in)
- ✅ Vendor sees all orders
