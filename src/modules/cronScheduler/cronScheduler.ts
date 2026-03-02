import cron from 'node-cron';
import type { CronTask } from './models/cronTask.js';
import { getLocalTimeString } from '../../utils/timeUtils.js';
import type { LoggerSubscriber } from '../logger/logger.js';

export class CronScheduler {
    private tasks: Map<string, cron.ScheduledTask> = new Map();
    private logger: LoggerSubscriber;

    constructor(logger: LoggerSubscriber, cronTasks: CronTask[]) {
        this.logger = logger;
        this.logger.info(`Initializing ${cronTasks.length} cron task(s)...`);
        this.initializeTasks(cronTasks);
        this.logger.info('CronScheduler ready.');
    }

    private initializeTasks(cronTasks: CronTask[]): void {
        for (const cronTask of cronTasks) {
            this.scheduleTask(cronTask);
        }
    }

    private scheduleTask(cronTask: CronTask): void {
        try {
            const scheduledTask = cron.schedule(cronTask.schedule, async () => {
                this.logger.info(`Executing cron task: "${cronTask.name}"`);
                try {
                    await Promise.resolve(cronTask.task());
                    this.logger.info(`Task "${cronTask.name}" completed successfully.`);
                } catch (error) {
                    this.logger.error(`Error executing task "${cronTask.name}":`, error);
                }
            });

            this.tasks.set(cronTask.name, scheduledTask);
            this.logger.info(`Cron task "${cronTask.name}" scheduled: ${cronTask.schedule}`);
        } catch (error) {
            this.logger.error(`Error scheduling task "${cronTask.name}":`, error);
        }
    }

    public stopTask(taskName: string): void {
        const task = this.tasks.get(taskName);
        if (task) {
            task.stop();
            this.tasks.delete(taskName);
            this.logger.info(`Cron task "${taskName}" stopped.`);
        } else {
            this.logger.warn(`Cron task "${taskName}" not found.`);
        }
    }

    public stopAllTasks(): void {
        this.logger.info(`Stopping all ${this.tasks.size} cron task(s)...`);
        for (const [taskName, task] of this.tasks.entries()) {
            task.stop();
            this.logger.info(`Cron task "${taskName}" stopped.`);
        }
        this.tasks.clear();
        this.logger.info('All cron tasks stopped.');
    }

    public getTasks(): Map<string, cron.ScheduledTask> {
        return this.tasks;
    }
}
