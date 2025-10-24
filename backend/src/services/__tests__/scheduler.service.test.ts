import { Pool } from 'pg';
import { SchedulerService } from '../scheduler.service';

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    stop: jest.fn()
  })
}));

// Mock dependencies
jest.mock('../notification.service');
jest.mock('../../repositories/student-repository');
jest.mock('../../repositories/student-document-repository');
jest.mock('../../repositories/document-type-repository');
jest.mock('../../repositories/user-repository');

describe('SchedulerService', () => {
  let pool: Pool;
  let schedulerService: SchedulerService;

  beforeEach(() => {
    pool = {} as Pool;
    schedulerService = new SchedulerService(pool);
  });

  describe('initialize', () => {
    it('should initialize scheduler tasks', () => {
      schedulerService.initialize();

      const tasks = schedulerService.getTasksStatus();
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('getSettings', () => {
    it('should return current settings', () => {
      const settings = schedulerService.getSettings();

      expect(settings).toHaveProperty('enabled');
      expect(settings).toHaveProperty('schedule');
      expect(settings).toHaveProperty('reminderDays');
      expect(settings).toHaveProperty('targetRoles');
    });
  });

  describe('updateSettings', () => {
    it('should update scheduler settings', () => {
      const newSettings = {
        enabled: false,
        reminderDays: 14
      };

      schedulerService.updateSettings(newSettings);
      const settings = schedulerService.getSettings();

      expect(settings.enabled).toBe(false);
      expect(settings.reminderDays).toBe(14);
    });
  });

  describe('stopAll', () => {
    it('should stop all scheduled tasks', () => {
      schedulerService.initialize();
      schedulerService.stopAll();

      const tasks = schedulerService.getTasksStatus();
      expect(tasks.length).toBe(0);
    });
  });

  describe('triggerTask', () => {
    it('should manually trigger a task', async () => {
      const mockProcessPending = jest.fn().mockResolvedValue(0);
      (schedulerService as any).processPendingNotifications = mockProcessPending;

      await schedulerService.triggerTask('process-pending-notifications');

      expect(mockProcessPending).toHaveBeenCalled();
    });

    it('should throw error for unknown task', async () => {
      await expect(
        schedulerService.triggerTask('unknown-task')
      ).rejects.toThrow('未知的任務');
    });
  });
});
