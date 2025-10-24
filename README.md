
```
Invisio
├─ .DS_Store
├─ README.md
├─ backend
│  ├─ .env
│  ├─ app.js
│  ├─ config
│  │  ├─ config.js
│  │  └─ config.json
│  ├─ controllers
│  │  ├─ authController.js
│  │  ├─ companyController.js
│  │  ├─ expenseController.js
│  │  ├─ itemController.js
│  │  ├─ partyController.js
│  │  ├─ reportController.js
│  │  ├─ settingsController.js
│  │  └─ transactionController.js
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
│  │  ├─ ai.js
│  │  ├─ authRoutes.js
│  │  ├─ companyRoutes.js
│  │  ├─ expenseRoutes.js
│  │  ├─ itemRoutes.js
│  │  ├─ partyRoutes.js
│  │  ├─ reportRoutes.js
│  │  ├─ settingsRoutes.js
│  │  └─ transactionRoutes.js
│  └─ seeders
│     ├─ 20251009165709-demo-users.js
│     ├─ 20251010162203-demo-companies.js
│     ├─ 20251010164928-demo-parties.js
│     ├─ 20251010172345-demo-items.js
│     ├─ 20251010180430-demo-transactions.js
│     ├─ 20251010181637-demo-transaction-line-items.js
│     └─ 20251010182807-demo-expenses.js
└─ frontend
   ├─ .DS_Store
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  └─ vite.svg
   ├─ src
   │  ├─ .DS_Store
   │  ├─ App.vue
   │  ├─ assets
   │  │  ├─ .DS_Store
   │  │  ├─ images
   │  │  │  ├─ .DS_Store
   │  │  │  └─ home.png
   │  │  ├─ styles
   │  │  │  ├─ base.css
   │  │  │  ├─ base.css.map
   │  │  │  ├─ base.scss
   │  │  │  ├─ variables.css
   │  │  │  ├─ variables.css.map
   │  │  │  └─ variables.scss
   │  │  └─ vue.svg
   │  ├─ components
   │  │  ├─ Common
   │  │  │  ├─ ConfirmDeleteModal.vue
   │  │  │  ├─ Leftsidebar.vue
   │  │  │  └─ Navbar.vue
   │  │  ├─ Company
   │  │  │  ├─ CreateCompanyModal.vue
   │  │  │  └─ EditCompanyModal.vue
   │  │  ├─ Dashboard
   │  │  │  ├─ DashboardActionBar.vue
   │  │  │  ├─ DashboardCompanyCard.vue
   │  │  │  ├─ DashboardExpenseChart.vue
   │  │  │  ├─ DashboardFinanceCard.vue
   │  │  │  ├─ DashboardHeader.vue
   │  │  │  ├─ DashboardQuickStats.vue
   │  │  │  ├─ DashboardRevenueChart.vue
   │  │  │  ├─ DashboardStatCard.vue
   │  │  │  ├─ DashboardWelcome.vue
   │  │  │  └─ EditProfileModal.vue
   │  │  ├─ Expense
   │  │  │  ├─ ExpenseDetailsModal.vue
   │  │  │  ├─ ExpenseFilters.vue
   │  │  │  ├─ ExpenseForm.vue
   │  │  │  ├─ ExpenseHeader.vue
   │  │  │  ├─ ExpenseReport.vue
   │  │  │  ├─ ExpenseSummaryCards.vue
   │  │  │  └─ ExpenseTable.vue
   │  │  ├─ Home
   │  │  │  ├─ Contact.vue
   │  │  │  ├─ FAQ.vue
   │  │  │  ├─ Features.vue
   │  │  │  └─ Footer.vue
   │  │  ├─ Inventory
   │  │  │  ├─ AdjustStockModal.vue
   │  │  │  ├─ CreateItemModal.vue
   │  │  │  ├─ EditItemModal.vue
   │  │  │  └─ ItemDetailsModal.vue
   │  │  ├─ Party
   │  │  │  ├─ CreatePartyModal.vue
   │  │  │  ├─ EditPartyModal.vue
   │  │  │  └─ PartyDetailsModal.vue
   │  │  ├─ Settings
   │  │  │  ├─ SettingsCompany.vue
   │  │  │  ├─ SettingsDangerZone.vue
   │  │  │  └─ SettingsProfile.vue
   │  │  └─ Transaction
   │  │     ├─ FinanceDateFilter.vue
   │  │     ├─ FinanceExpenseChart.vue
   │  │     ├─ FinanceGSTSummary.vue
   │  │     ├─ FinanceRevenueChart.vue
   │  │     ├─ FinanceSummaryCards.vue
   │  │     └─ FinanceTransactionTable.vue
   │  ├─ layouts
   │  │  └─ DashboardLayout.vue
   │  ├─ main.ts
   │  ├─ router
   │  │  └─ index.ts
   │  ├─ store
   │  │  ├─ authStore.ts
   │  │  ├─ companyStore.ts
   │  │  ├─ expenseStore.ts
   │  │  ├─ itemStore.ts
   │  │  ├─ partyStore.ts
   │  │  ├─ reportStore.ts
   │  │  ├─ settingStore.ts
   │  │  └─ transactionStore.ts
   │  ├─ style.css
   │  ├─ views
   │  │  ├─ Brain.vue
   │  │  ├─ Dashboard.vue
   │  │  ├─ Expense.vue
   │  │  ├─ Finance.vue
   │  │  ├─ Home.vue
   │  │  ├─ Inventory.vue
   │  │  ├─ Login.vue
   │  │  ├─ Parties.vue
   │  │  ├─ PartyLedger.vue
   │  │  ├─ ProfitLoss.vue
   │  │  ├─ Register.vue
   │  │  ├─ Settings.vue
   │  │  └─ StockSummary.vue
   │  └─ vite-env.d.ts
   ├─ tsconfig.app.json
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   └─ vite.config.ts

```