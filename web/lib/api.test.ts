import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryApi, transactionApi } from './api';
import Cookies from 'js-cookie';

// Mock js-cookie
vi.mock('js-cookie', () => {
  return {
    default: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  };
});

// Mock fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Cookies.get as any).mockReturnValue('mock-token');
  });

  describe('inventoryApi', () => {
    it('getById should fetch a single inventory item', async () => {
      const mockInventory = { id: 1, product_id: 1, warehouse_id: 1, quantity: 100 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockInventory,
      });

      const result = await inventoryApi.getById(1);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inventory/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      expect(result).toEqual(mockInventory);
    });
  });

  describe('transactionApi', () => {
    it('getById should fetch a single transaction', async () => {
      const mockTx = { id: 'tx-123', product_id: 1, quantity: 50 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTx,
      });

      const result = await transactionApi.getById('tx-123');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions/tx-123'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      expect(result).toEqual(mockTx);
    });
  });
});
