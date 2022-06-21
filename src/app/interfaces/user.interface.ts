export interface IUser {
  id: string,
  userName: string,
  favoriteStations: string[],
  profileImage: {
    compressImage: string,
    imageUrl: string,
    imageLocalPath: string,
  },
  location: {
    country: string,
    countryCode: string
  }
}
