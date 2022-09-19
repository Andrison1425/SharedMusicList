import { Timestamp } from '@angular/fire/firestore';
import * as imageConversion from 'image-conversion';

export async function compressUriImage(uri: string): Promise<string> {
  const fetchData = await fetch(uri);
  const blob = await fetchData.blob();
  const file = new File([blob], 'FileName', { type: 'image/png' });
  const compressImgBlob = await imageConversion.compressAccurately(file, 1);
  const compressBase64 = await convertBlobToBase64(compressImgBlob) as string;
  return compressBase64;
}

export const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = getFileReader();
  reader.onerror = reject;
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(blob);
});

const getFileReader = (): FileReader => {
  const fileReader = new FileReader();
  // tslint:disable-next-line: no-string-literal
  const zoneOriginalInstance = (fileReader)['__zone_symbol__originalInstance'];
  return zoneOriginalInstance || fileReader;
};

export const getFakeTimestamp = () => {
  return {
    seconds: 0,
    nanoseconds: 0,
    toDate: () => new Date(),
    toMillis: () => 0,
    isEqual: (other: Timestamp) => true,
    toString: () => '',
    toJSON: () => { return {
        seconds: 0,
        nanoseconds: 0
    }},
    valueOf: () => ''
  }
}

export const extractExtension = (fileName: string): string | undefined => {
  const re = /(?:\.([^.]+))?$/;

  return re.exec(fileName)[1]
}