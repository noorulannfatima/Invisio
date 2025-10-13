
```
Invisio
├─ README.md
├─ backend
│  ├─ .env
│  ├─ app.js
│  ├─ config
│  │  ├─ config.js
│  │  └─ config.json
│  ├─ controllers
│  │  └─ authController.js
│  ├─ middleware
│  │  └─ authMiddleware.js
│  ├─ migrations
│  │  ├─ 20251009165614-create-users-table.js
│  │  ├─ 20251010160240-add-is-deleted-to-user.js
│  │  ├─ 20251010161640-create-company-table.js
│  │  ├─ 20251010164833-create-party-table.js
│  │  ├─ 20251010172332-create-item-table.js
│  │  ├─ 20251010174040-rename-item-replaced-code-to-description.js
│  │  ├─ 20251010180417-create-transaction-table.js
│  │  ├─ 20251010181626-create-transaction-line-item-table.js
│  │  └─ 20251010182713-create-expense-table.js
│  ├─ models
│  │  ├─ Company.js
│  │  ├─ Expense.js
│  │  ├─ Item.js
│  │  ├─ Party.js
│  │  ├─ Transaction.js
│  │  ├─ TransactionLineItem.js
│  │  ├─ User.js
│  │  └─ index.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  └─ authRoutes.js
│  └─ seeders
│     ├─ 20251009165709-demo-users.js
│     ├─ 20251010162203-demo-companies.js
│     ├─ 20251010164928-demo-parties.js
│     ├─ 20251010172345-demo-items.js
│     ├─ 20251010180430-demo-transactions.js
│     ├─ 20251010181637-demo-transaction-line-items.js
│     └─ 20251010182807-demo-expenses.js
└─ frontend
   ├─ README.md
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  └─ vite.svg
   ├─ src
   │  ├─ App.vue
   │  ├─ assets
   │  │  ├─ styles
   │  │  │  ├─ base.scss
   │  │  │  └─ variables.scss
   │  │  └─ vue.svg
   │  ├─ components
   │  │  ├─ auth
   │  │  │  ├─ LoginForm.vue
   │  │  │  └─ RegisterForm.vue
   │  │  ├─ charts
   │  │  ├─ common
   │  │  ├─ forms
   │  │  ├─ invoice
   │  │  │  ├─ InvoicePreview.vue
   │  │  │  ├─ InvoicePrint.vue
   │  │  │  └─ InvoiceTemplate.vue
   │  │  ├─ layout
   │  │  │  ├─ Contact.vue
   │  │  │  ├─ FAQ.vue
   │  │  │  ├─ Features.vue
   │  │  │  ├─ Footer.vue
   │  │  │  └─ Navbar.vue
   │  │  └─ tabels
   │  ├─ composables
   │  │  └─ useDashboard.ts
   │  ├─ main.ts
   │  ├─ router
   │  │  └─ index.ts
   │  ├─ style.css
   │  ├─ types
   │  │  └─ dashboard.ts
   │  ├─ views
   │  │  ├─ Dashboard.vue
   │  │  ├─ Home.vue
   │  │  ├─ Login.vue
   │  │  ├─ Profile.vue
   │  │  ├─ Register.vue
   │  │  ├─ customers
   │  │  ├─ expenses
   │  │  ├─ inventory
   │  │  │  ├─ InventoryDashboard.vue
   │  │  │  └─ InventoryList.vue
   │  │  ├─ invoices
   │  │  │  ├─ InvoiceCreate.vue
   │  │  │  ├─ InvoiceDetail.vue
   │  │  │  ├─ InvoiceEdit.vue
   │  │  │  ├─ InvoiceList.vue
   │  │  │  └─ InvoicePreview.vue
   │  │  ├─ items
   │  │  │  ├─ ItemCategory.vue
   │  │  │  ├─ ItemCreate.vue
   │  │  │  ├─ ItemDetail.vue
   │  │  │  ├─ ItemEdit.vue
   │  │  │  └─ ItemList.vue
   │  │  ├─ payments
   │  │  └─ purchases
   │  └─ vite-env.d.ts
   ├─ tsconfig.app.json
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   └─ vite.config.ts

```