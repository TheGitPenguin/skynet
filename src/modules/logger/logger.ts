import fs from 'fs';
import path from 'path';
import { getLocalDateTimeString } from '../../utils/timeUtils.js';

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

export class LoggerSubscriber {
    private name: string;
    private logFilePath: string;

    constructor(name: string, logDirectory: string) {
        this.name = name;
        this.logFilePath = path.join(logDirectory, `${name}.log`);
    }

    private formatMessage(level: LogLevel, message: string): string {
        return `[${getLocalDateTimeString()}] [${this.name}] [${level}] ${message}`;
    }

    private writeToFile(formatted: string): void {
        try {
            fs.appendFileSync(this.logFilePath, formatted + '\n', 'utf-8');
        } catch (error) {
            process.stderr.write(`Failed to write log to ${this.logFilePath}: ${error}\n`);
        }
    }

    private log(level: LogLevel, message: string, ...args: unknown[]): void {
        const extra = args.length > 0
            ? ' ' + args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
            : '';
        const formatted = this.formatMessage(level, message + extra);

        switch (level) {
            case LogLevel.ERROR:
                process.stderr.write(formatted + '\n');
                break;
            case LogLevel.WARN:
                process.stderr.write(formatted + '\n');
                break;
            default:
                process.stdout.write(formatted + '\n');
                break;
        }

        this.writeToFile(formatted);
    }

    public debug(message: string, ...args: unknown[]): void {
        this.log(LogLevel.DEBUG, message, ...args);
    }

    public info(message: string, ...args: unknown[]): void {
        this.log(LogLevel.INFO, message, ...args);
    }

    public warn(message: string, ...args: unknown[]): void {
        this.log(LogLevel.WARN, message, ...args);
    }

    public error(message: string, ...args: unknown[]): void {
        this.log(LogLevel.ERROR, message, ...args);
    }
}

export class Logger {
    private logDirectory: string;
    private subscribers: Map<string, LoggerSubscriber> = new Map();

    constructor(logDirectory: string) {
        this.logDirectory = logDirectory;
        this.ensureDirectoryExists();
    }

    private ensureDirectoryExists(): void {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }

    public subscribe(name: string): LoggerSubscriber {
        if (this.subscribers.has(name)) {
            return this.subscribers.get(name)!;
        }

        const subscriber = new LoggerSubscriber(name, this.logDirectory);
        this.subscribers.set(name, subscriber);
        return subscriber;
    }

    public getSubscriber(name: string): LoggerSubscriber | undefined {
        return this.subscribers.get(name);
    }

    public getSubscribers(): Map<string, LoggerSubscriber> {
        return this.subscribers;
    }
}
