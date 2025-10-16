<template>
  <div class="page inventory">
    <h1 class="page-title">Inventory Management</h1>

    <div class="content">
      <p>Manage your stock levels, categories, and products.</p>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in inventory" :key="i">
              <td>{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.stock }}</td>
              <td :class="item.stock < 10 ? 'low' : 'ok'">
                {{ item.stock < 10 ? 'Low' : 'Available' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface InventoryItem {
  name: string
  category: string
  stock: number
}

const inventory: InventoryItem[] = [
  { name: 'Laptop', category: 'Electronics', stock: 25 },
  { name: 'Headphones', category: 'Accessories', stock: 8 },
  { name: 'Office Chair', category: 'Furniture', stock: 3 },
  { name: 'Mouse', category: 'Accessories', stock: 15 },
]
</script>

<style lang="scss" scoped>
.page {
  margin-left: 260px;
  margin-top: 70px;
  padding: 2rem;
  background-color: #f8f9fb;
  min-height: calc(100vh - 70px);

  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .table-container {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        text-align: left;
      }

      th {
        background-color: #f0f2f5;
        color: #555;
        font-weight: 600;
      }

      .low {
        color: #e74c3c;
        font-weight: 600;
      }

      .ok {
        color: #27ae60;
        font-weight: 600;
      }
    }
  }
}
</style>
