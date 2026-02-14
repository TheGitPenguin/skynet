export interface CronTask {
    name: string;
    schedule: string;
    task: () => Promise<void> | void;
}
