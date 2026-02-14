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
                console.log(`[${getLocalTimeString()}] Exécution de la tâche cron : "${cronTask.name}"`);
                try {
                    await Promise.resolve(cronTask.task());
                    console.log(`[${getLocalTimeString()}] Tâche "${cronTask.name}" terminée avec succès.`);
                } catch (error) {
                    console.error(`Erreur lors de l'exécution de la tâche "${cronTask.name}" :`, error);
                }
            });

            this.tasks.set(cronTask.name, scheduledTask);
            console.log(`Tâche cron "${cronTask.name}" planifiée : ${cronTask.schedule}`);
        } catch (error) {
            console.error(`Erreur lors de la planification de la tâche "${cronTask.name}" :`, error);
        }
    }

    public stopTask(taskName: string): void {
        const task = this.tasks.get(taskName);
        if (task) {
            task.stop();
            this.tasks.delete(taskName);
            console.log(`Tâche cron "${taskName}" arrêtée.`);
        } else {
            console.warn(`Tâche cron "${taskName}" non trouvée.`);
        }
    }

    public stopAllTasks(): void {
        for (const [taskName, task] of this.tasks.entries()) {
            task.stop();
            console.log(`Tâche cron "${taskName}" arrêtée.`);
        }
        this.tasks.clear();
    }

    public getTasks(): Map<string, cron.ScheduledTask> {
        return this.tasks;
    }
}
