import { Timestamp } from '@angular/fire/firestore';

export interface IComment {
  id: string;
  userName: string;
  comment: string;
  timestamp: Timestamp;
  likes: {
    idUsers: object;
    numLikes: number
  };
  answers?: {
    [id: string]: IComment
  };
  parentComment?: string;
}
