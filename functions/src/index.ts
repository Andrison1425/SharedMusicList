import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Firestore } from "@google-cloud/firestore";

admin.initializeApp();
const firestore = new Firestore();
// firebase deploy --only functions


exports.newMusicInList = functions.firestore
    .document("/stations/{idStation}/")
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data() as IStation;
        const afterData = change.after.data() as IStation;

        const beforeMusicsID: string[] = beforeData.musics.map(music => music.id);

        let newMusics = 0;
        afterData.musics.forEach(music => {
            if (!beforeMusicsID.includes(music.id)) {
                newMusics++;
            }
        })

        if (newMusics > 0) {
            const tokensRef = firestore.doc("/music-list-user-tokens/" + afterData.id);

            return tokensRef.get()
                .then(resp => {
                    const userTokens = resp.data()?.userTokens;

                    if (userTokens) {
                        sendNotification({
                            notification: {
                                title: 'Nuevas canciones',
                                body: newMusics + ' nuevas canciones en ' + afterData.name,
                            },
                            path: 'radio/station/' + afterData.id,
                            tokens: userTokens
                        })
                        // 
                    }
                })
        }
    });

const sendNotification = (notification: INotification) => {
    admin.messaging().sendMulticast({
        tokens: notification.tokens,
        notification: notification.notification,
        data: {
            path: notification.path
        },
        android: {
            notification: {
                color: '#A52502'
            }
        }
    })
};

interface IStation {
    id: string,
    musics: IMusic[],
    name: string,
    description: string,
    inReproduction: number,
    artistsName: string[],
    author: {
        userName: string,
        id: string
    },
    reactions: {
        numLikes: number,
        numDislikes: number,
        idUsersAndReaction: object,
    },
    views: number,
    timestamp: any,
    image: {
        localPath: string,
        path: string,
        compress: string
    },
    comments: IComment[],
    tags: string[]
}

interface IMusic {
    title: string;
    artist: string
    unapprovedArtists?: boolean;
    downloadUrl: string;
    localData?: string;
    id: string;
    duration?: number;
    stationId: string;
    localPath?: string;
    local: {
        isNew: boolean
    }
}

interface IComment {
    id: string;
    userName: string;
    comment: string;
    timestamp: any;
    likes: {
        idUsers: object;
        numLikes: number
    };
    answers?: {
        [id: string]: IComment
    };
    parentComment?: string;
}

interface INotification {
    tokens: string[],
    path: string,
    notification: {
        title: string,
        body: string
    }
}