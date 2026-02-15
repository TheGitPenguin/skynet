import cron from 'node-cron';
import type { CronTask } from './models/cronTask.js';
import { getLocalTimeString } from '../../utils/timeUtils.js';

export class CronScheduler {
    private tasks: Map<string, cron.ScheduledTask> = new Map();

    constructor(cronTasks: CronTask[]) {
        this.initializeTasks(cronTasks);
    }

    private initializeTasks(cronTasks: CronTask[]): void {
        for (const cronTask of cronTasks) {
            this.scheduleTask(cronTask);
        }
    }

    private scheduleTask(cronTask: CronTask): void {
        try {
            const scheduledTask = cron.schedule(cronTask.schedule, async () => {
                console.log(`[${getLocalTimeString()}] Executing cron task: "${cronTask.name}"`);
                try {
                    await Promise.resolve(cronTask.task());
                    console.log(`[${getLocalTimeString()}] Task "${cronTask.name}" completed successfully.`);
                } catch (error) {
                    console.error(`Error executing task "${cronTask.name}":`, error);
                }
            });

            this.tasks.set(cronTask.name, scheduledTask);
            console.log(`Cron task "${cronTask.name}" scheduled: ${cronTask.schedule}`);
        } catch (error) {
            console.error(`Error scheduling task "${cronTask.name}":`, error);
        }
    }

    public stopTask(taskName: string): void {
        const task = this.tasks.get(taskName);
        if (task) {
            task.stop();
            this.tasks.delete(taskName);
            console.log(`Cron task "${taskName}" stopped.`);
        } else {
            console.warn(`Cron task "${taskName}" not found.`);
        }
    }

    public stopAllTasks(): void {
        for (const [taskName, task] of this.tasks.entries()) {
            task.stop();
            console.log(`Cron task "${taskName}" stopped.`);
        }
        this.tasks.clear();
    }

    public getTasks(): Map<string, cron.ScheduledTask> {
        return this.tasks;
    }
}
