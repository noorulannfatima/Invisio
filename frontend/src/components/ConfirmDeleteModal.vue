<!-- ConfirmDeleteModal.vue -->
<template>
  <div class="modal-overlay" @click.self="cancelDelete">
    <div class="modal-content">
      <div class="modal-header warning">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Delete Item</h2>
        <button class="btn-close" @click="cancelDelete">×</button>
      </div>

      <div class="modal-body">
        <p class="warning-text">
          Are you sure you want to delete <strong>{{ itemName }}</strong>?
        </p>
        <p class="info-text">
          This action will permanently remove this item from your inventory. This cannot be undone.
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cancelDelete">
          Cancel
        </button>
        <button class="btn btn-danger" @click="confirmDelete">
          <i class="fas fa-trash"></i>
          Delete Item
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  itemName: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const confirmDelete = () => {
  emit('confirm');
};

const cancelDelete = () => {
  emit('cancel');
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  &.warning {
    background: #fff5f5;
    border-bottom: 2px solid #fc8181;

    i {
      font-size: 1.5rem;
      color: #f56565;
      flex-shrink: 0;
    }
  }

  h2 {
    margin: 0;
    flex: 1;
    font-size: 1.3rem;
    color: #2d3748;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #718096;
    line-height: 1;

    &:hover {
      color: #2d3748;
    }
  }
}

.modal-body {
  padding: 1.5rem;

  .warning-text {
    color: #2d3748;
    font-size: 1rem;
    margin: 0 0 1rem 0;
    line-height: 1.5;

    strong {
      color: #f56565;
      font-weight: 700;
    }
  }

  .info-text {
    color: #718096;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f7fafc;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &.btn-secondary {
    background: #edf2f7;
    color: #2d3748;

    &:hover {
      background: #e2e8f0;
    }
  }

  &.btn-danger {
    background: #f56565;
    color: white;

    &:hover {
      background: #e53e3e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 101, 101, 0.4);
    }
  }
}
</style>
