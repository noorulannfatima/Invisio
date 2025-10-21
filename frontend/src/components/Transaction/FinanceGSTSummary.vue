<template>
  <div class="gst-summary-section">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fas fa-receipt"></i>
        GST Summary
      </h2>
      <span class="period-badge">
        {{ gstData.Period.Start_Date }} to {{ gstData.Period.End_Date }}
      </span>
    </div>

    <div class="gst-grid">
      <div class="gst-card">
        <div class="card-label">
          <i class="fas fa-arrow-up"></i>
          Outward Supplies
        </div>
        <div class="card-value">{{ formatCurrency(gstData.Outward_Supplies) }}</div>
        <div class="card-meta">Total sales</div>
      </div>

      <div class="gst-card">
        <div class="card-label">
          <i class="fas fa-arrow-down"></i>
          Inward Supplies
        </div>
        <div class="card-value">{{ formatCurrency(gstData.Inward_Supplies) }}</div>
        <div class="card-meta">Total purchases</div>
      </div>

      <div class="gst-card">
        <div class="card-label">
          <i class="fas fa-money-bill"></i>
          Output GST
        </div>
        <div class="card-value">{{ formatCurrency(gstData.Output_GST) }}</div>
        <div class="card-meta">GST on sales</div>
      </div>

      <div class="gst-card">
        <div class="card-label">
          <i class="fas fa-undo"></i>
          Input GST
        </div>
        <div class="card-value">{{ formatCurrency(gstData.Input_GST) }}</div>
        <div class="card-meta">GST on purchases</div>
      </div>
    </div>

    <div class="gst-summary-box">
      <div class="summary-item liability" v-if="gstData.Net_GST_Liability > 0">
        <div class="summary-content">
          <span class="summary-label">
            <i class="fas fa-exclamation-circle"></i>
            Net GST Liability
          </span>
          <span class="summary-description">Amount you owe to the government</span>
        </div>
        <div class="summary-value payable">{{ formatCurrency(gstData.Net_GST_Liability) }}</div>
      </div>

      <div class="summary-item credit" v-else-if="gstData.Net_GST_Credit > 0">
        <div class="summary-content">
          <span class="summary-label">
            <i class="fas fa-check-circle"></i>
            Net GST Credit
          </span>
          <span class="summary-description">Amount government owes you</span>
        </div>
        <div class="summary-value refund">{{ formatCurrency(gstData.Net_GST_Credit) }}</div>
      </div>

      <div class="summary-item neutral" v-else>
        <div class="summary-content">
          <span class="summary-label">
            <i class="fas fa-balance-scale"></i>
            GST Balanced
          </span>
          <span class="summary-description">No GST liability or credit</span>
        </div>
        <div class="summary-value">$0.00</div>
      </div>
    </div>

    <div class="gst-info">
      <p>
        <i class="fas fa-info-circle"></i>
        <strong>Total Transactions:</strong> {{ gstData.Total_Transactions }} transactions processed
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GSTSummary } from '@/store/transactionStore';

defineProps<{
  gstData: GSTSummary;
}>();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>

<style lang="scss" scoped>
.gst-summary-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 2rem 0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #6c757d;
      }
    }

    .period-badge {
      background: rgba(108, 117, 125, 0.15);
      color: #6c757d;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
  }

  .gst-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .gst-card {
      background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
      border-radius: 10px;
      padding: 1.5rem;
      border-left: 4px solid #6c757d;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .card-label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        i {
          color: #007bff;
        }
      }

      .card-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      .card-meta {
        font-size: 0.8rem;
        color: #999;
      }
    }
  }

  .gst-summary-box {
    background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
    border-radius: 10px;
    padding: 2rem;
    margin-bottom: 1.5rem;

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.liability {
        border-left: 5px solid #dc3545;
      }

      &.credit {
        border-left: 5px solid #28a745;
      }

      &.neutral {
        border-left: 5px solid #6c757d;
      }

      .summary-content {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        .summary-label {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i {
            font-size: 1.2rem;
          }
        }

        .summary-description {
          font-size: 0.85rem;
          color: #666;
        }
      }

      .summary-value {
        font-size: 1.8rem;
        font-weight: 700;

        &.payable {
          color: #dc3545;
        }

        &.refund {
          color: #28a745;
        }
      }
    }
  }

  .gst-info {
    background: rgba(0, 123, 255, 0.05);
    border-left: 4px solid #007bff;
    padding: 1rem;
    border-radius: 6px;

    p {
      margin: 0;
      font-size: 0.95rem;
      color: #555;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #007bff;
        font-size: 1.1rem;
      }

      strong {
        color: #333;
      }
    }
  }
}

@media (max-width: 768px) {
  .gst-summary-section {
    padding: 1rem;

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .gst-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;

      .gst-card {
        padding: 1rem;
      }
    }

    .gst-summary-box {
      padding: 1rem;

      .summary-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;

        .summary-value {
          font-size: 1.5rem;
        }
      }
    }
  }
}
</style>