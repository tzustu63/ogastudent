import cron from 'node-cron';
import { Pool } from 'pg';
import { NotificationService } from './notification.service';
import { StudentRepository } from '../repositories/student-repository';
import { StudentDocumentRepository } from '../repositories/student-document-repository';
import { DocumentTypeRepository } from '../repositories/document-type-repository';
import { UserRepository } from '../repositories/user-repository';
import { NotificationType } from '../models/notification';

export interface ReminderSettings {
  enabled: boolean;
  schedule: string; // cron expression
  reminderDays: number; // 提醒逾期天數
  targetRoles: string[]; // 要通知的角色
}

export class SchedulerService {
  private notificationService: NotificationService;
  private studentRepo: StudentRepository;
  private documentRepo: StudentDocumentRepository;
  private documentTypeRepo: DocumentTypeRepository;
  private userRepo: UserRepository;
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private settings: ReminderSettings;

  constructor(pool: Pool) {
    this.notificationService = new NotificationService(pool);
    this.studentRepo = new StudentRepository(pool);
    this.documentRepo = new StudentDocumentRepository(pool);
    this.documentTypeRepo = new DocumentTypeRepository(pool);
    this.userRepo = new UserRepository(pool);

    // 預設設定
    this.settings = {
      enabled: true,
      schedule: '0 9 * * *', // 每天早上9點執行
      reminderDays: 7, // 7天未上傳提醒
      targetRoles: ['admin', 'global_affairs']
    };
  }

  // 初始化排程任務
  initialize(): void {
    if (!this.settings.enabled) {
      console.log('⚠️  排程任務已停用');
      return;
    }

    // 排程：處理待發送的通知
    this.scheduleTask('process-pending-notifications', '*/5 * * * *', async () => {
      await this.processPendingNotifications();
    });

    // 排程：檢查逾期文件並發送提醒
    this.scheduleTask('check-overdue-documents', this.settings.schedule, async () => {
      await this.checkOverdueDocuments();
    });

    // 排程：清理舊通知
    this.scheduleTask('cleanup-old-notifications', '0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    console.log('✅ 排程任務已初始化');
  }

  // 排程任務
  private scheduleTask(name: string, schedule: string, task: () => Promise<void>): void {
    try {
      const scheduledTask = cron.schedule(schedule, async () => {
        console.log(`⏰ 執行排程任務: ${name}`);
        try {
          await task();
          console.log(`✅ 排程任務完成: ${name}`);
        } catch (error) {
          console.error(`❌ 排程任務失敗: ${name}`, error);
        }
      });

      this.tasks.set(name, scheduledTask);
      console.log(`📅 已排程任務: ${name} (${schedule})`);
    } catch (error) {
      console.error(`❌ 排程任務設定失敗: ${name}`, error);
    }
  }

  // 處理待發送的通知
  private async processPendingNotifications(): Promise<void> {
    const count = await this.notificationService.processPendingScheduledNotifications();
    if (count > 0) {
      console.log(`📧 已處理 ${count} 則待發送通知`);
    }
  }

  // 檢查逾期文件並發送提醒
  private async checkOverdueDocuments(): Promise<void> {
    try {
      // 獲取所有學生
      const studentsResult = await this.studentRepo.findAll({ page: 1, limit: 1000 });
      const students = studentsResult.data;

      // 獲取所有文件類型
      const documentTypes = await this.documentTypeRepo.findAll({ page: 1, limit: 100 });

      let reminderCount = 0;

      for (const student of students) {
        // 獲取學生的所有文件
        const documentsResult = await this.documentRepo.findByStudent(student.student_id);
        const documents = documentsResult.data;
        const uploadedTypes = new Set(documents.map((doc: any) => doc.type_id));

        // 找出缺少的文件類型
        const missingTypes = documentTypes.data.filter(
          type => type.is_required && !uploadedTypes.has(type.type_id)
        );

        if (missingTypes.length > 0) {
          // 發送提醒給相關單位
          for (const docType of missingTypes) {
            if (docType.responsible_unit_id) {
              // 獲取該單位的使用者
              const usersResult = await this.userRepo.findByUnit(docType.responsible_unit_id);
              const users = usersResult.data;
              
              for (const user of users) {
                // 檢查使用者角色是否在目標角色列表中
                if (this.settings.targetRoles.includes(user.role)) {
                  await this.notificationService.createNotification({
                    recipientId: user.user_id,
                    type: NotificationType.SYSTEM,
                    title: '文件上傳提醒',
                    content: `學生 ${student.name} 的 ${docType.type_name} 尚未上傳，請盡快處理。`,
                    metadata: {
                      category: 'document_reminder',
                      studentId: student.student_id,
                      studentName: student.name,
                      documentType: docType.type_name,
                      priority: 'medium'
                    }
                  });
                  reminderCount++;
                }
              }
            }
          }
        }
      }

      if (reminderCount > 0) {
        console.log(`📬 已發送 ${reminderCount} 則文件提醒通知`);
      }
    } catch (error) {
      console.error('❌ 檢查逾期文件失敗:', error);
    }
  }

  // 清理舊通知
  private async cleanupOldNotifications(): Promise<void> {
    try {
      const count = await this.notificationService.cleanupOldNotifications(90);
      if (count > 0) {
        console.log(`🗑️  已清理 ${count} 則舊通知`);
      }
    } catch (error) {
      console.error('❌ 清理舊通知失敗:', error);
    }
  }

  // 更新設定
  updateSettings(settings: Partial<ReminderSettings>): void {
    this.settings = { ...this.settings, ...settings };
    
    // 如果排程時間改變，重新初始化
    if (settings.schedule) {
      this.stopTask('check-overdue-documents');
      this.scheduleTask('check-overdue-documents', settings.schedule, async () => {
        await this.checkOverdueDocuments();
      });
    }

    console.log('✅ 排程設定已更新:', this.settings);
  }

  // 獲取當前設定
  getSettings(): ReminderSettings {
    return { ...this.settings };
  }

  // 停止特定任務
  stopTask(name: string): void {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
      console.log(`⏹️  已停止排程任務: ${name}`);
    }
  }

  // 停止所有任務
  stopAll(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`⏹️  已停止排程任務: ${name}`);
    });
    this.tasks.clear();
    console.log('⏹️  所有排程任務已停止');
  }

  // 手動觸發任務
  async triggerTask(name: string): Promise<void> {
    console.log(`🔧 手動觸發任務: ${name}`);
    
    switch (name) {
      case 'process-pending-notifications':
        await this.processPendingNotifications();
        break;
      case 'check-overdue-documents':
        await this.checkOverdueDocuments();
        break;
      case 'cleanup-old-notifications':
        await this.cleanupOldNotifications();
        break;
      default:
        throw new Error(`未知的任務: ${name}`);
    }
  }

  // 獲取所有任務狀態
  getTasksStatus(): Array<{ name: string; isRunning: boolean }> {
    const status: Array<{ name: string; isRunning: boolean }> = [];
    
    this.tasks.forEach((_task, name) => {
      status.push({
        name,
        isRunning: true // cron tasks don't have a direct status check
      });
    });
    
    return status;
  }
}

// 單例模式
let schedulerServiceInstance: SchedulerService | null = null;

export function getSchedulerService(pool: Pool): SchedulerService {
  if (!schedulerServiceInstance) {
    schedulerServiceInstance = new SchedulerService(pool);
  }
  return schedulerServiceInstance;
}
