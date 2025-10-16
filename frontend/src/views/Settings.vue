<template>
  <div class="page settings">
    <h1 class="page-title">Settings</h1>

    <div class="settings-section">
      <h3>Account Preferences</h3>
      <form class="settings-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" type="text" placeholder="Enter username" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="Enter email" />
        </div>

        <button type="button" class="save-btn">Save Changes</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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

  .settings-section {
    background: #fff;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h3 {
      margin-bottom: 1.5rem;
      color: #333;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .form-group {
        display: flex;
        flex-direction: column;

        label {
          font-weight: 500;
          color: #555;
          margin-bottom: 0.3rem;
        }

        input {
          padding: 0.6rem 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          outline: none;

          &:focus {
            border-color: #4a6cf7;
          }
        }
      }

      .save-btn {
        align-self: flex-start;
        background-color: #4a6cf7;
        color: #fff;
        padding: 0.7rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;

        &:hover {
          background-color: #3b5be0;
        }
      }
    }
  }
}
</style>
