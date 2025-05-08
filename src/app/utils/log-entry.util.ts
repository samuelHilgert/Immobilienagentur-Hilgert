import { LogEntry } from '../models/property-inquiry-process.model';
import { PropertyInquiryProcess } from '../models/property-inquiry-process.model';

export function createLogEntry(action: string, user: string, comment?: string): LogEntry {
  return {
    date: new Date(),
    user,
    action,
    comment,
  };
}

export function addLogEntryToProcess(
  process: PropertyInquiryProcess,
  entry: LogEntry
): void {
  if (!process.historyLog) {
    process.historyLog = [];
  }
  process.historyLog.push(entry);
}
