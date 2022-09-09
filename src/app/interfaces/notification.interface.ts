import { Timestamp } from '@angular/fire/firestore';
import { Notifications } from "../enums/notification.enum";

export interface INotification {
    title: string;
    body: string;
    timestamp: Timestamp;
    type: Notifications;
    id: string;
    data: {
        musicListId?: string;
    }
}