import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import boom from '@hapi/boom';
import { asyncHandler, withTimeout, withRetry } from '../middlewares/async.handler.js';

describe('Async Handler Middleware', () => {
  describe('asyncHandler', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should handle successful async operations', async () => {
      const handler = asyncHandler(async (req, res) => {
        res.status(200).json({ success: true });
      });

      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch and forward boom errors', async () => {
      const boomError = boom.badRequest('Invalid input');
      const handler = asyncHandler(async () => {
        throw boomError;
      });

      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(boomError);
    });

    it('should wrap non-boom errors in boom.internal', async () => {
      const regularError = new Error('Database connection failed');
      const handler = asyncHandler(async () => {
        throw regularError;
      });

      await handler(req, res, next);

      expect(next).toHaveBeenCalled();
      const calledError = next.mock.calls[0][0];
      expect(calledError.isBoom).toBe(true);
      expect(calledError.output.statusCode).toBe(500);
    });

    it('should preserve boom error properties', async () => {
      const boomError = boom.notFound('Resource not found', { resource: 'user' });
      const handler = asyncHandler(async () => {
        throw boomError;
      });

      await handler(req, res, next);

      const calledError = next.mock.calls[0][0];
      expect(calledError.output.statusCode).toBe(404);
      expect(calledError.data.resource).toBe('user');
    });
  });

  describe('withTimeout', () => {
    it('should resolve if operation completes before timeout', async () => {
      const operation = async () => {
        return new Promise(resolve => setTimeout(() => resolve('success'), 100));
      };

      const result = await withTimeout(operation(), 500);
      expect(result).toBe('success');
    });

    it('should reject if operation exceeds timeout', async () => {
      const operation = async () => {
        return new Promise(resolve => setTimeout(() => resolve('success'), 1000));
      };

      await expect(withTimeout(operation(), 200)).rejects.toThrow('Operation timed out after 200ms');
    });

    it('should use default timeout of 30s if not specified', async () => {
      const operation = async () => Promise.resolve('fast');
      const result = await withTimeout(operation());
      expect(result).toBe('fast');
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const operation = jest.fn(async () => 'success');
      const result = await withRetry(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await withRetry(operation, 5, 50);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const operation = jest.fn(async () => {
        throw new Error('Permanent failure');
      });

      await expect(withRetry(operation, 3, 50)).rejects.toThrow('Permanent failure');
      expect(operation).toHaveBeenCalledTimes(3); // 3 total attempts
    });

    it('should not retry boom client errors (4xx)', async () => {
      const operation = jest.fn(async () => {
        throw boom.badRequest('Invalid input');
      });

      await expect(withRetry(operation, 3, 50)).rejects.toThrow('Invalid input');
      expect(operation).toHaveBeenCalledTimes(1); // No retries for 4xx
    });

    it('should retry boom server errors (5xx)', async () => {
      let attempts = 0;
      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw boom.internal('Server error');
        }
        return 'recovered';
      });

      const result = await withRetry(operation, 3, 50);
      expect(result).toBe('recovered');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});
