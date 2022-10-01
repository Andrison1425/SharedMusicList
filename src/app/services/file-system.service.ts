import { Colors } from './../enums/color.enum';
import { ToastService } from './toast.service';
import { Injectable } from '@angular/core';
import { Filesystem, WriteFileOptions, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {

  constructor(
    private toastService: ToastService
  ) {
    //
  }

  async writeFile(data: string, fileName: string, dir: string) {
    const dataWrite: WriteFileOptions = {
      data: data,
      path: 'Chanime/' + dir + fileName,
      directory: Directory.External,
    };

    try {// Se guarda si existe la carpeta Puzeos y la carpeta que se pase por dir
      const fileUrl = await Filesystem.writeFile(dataWrite);

      return fileUrl.uri;
    } catch (e) {
      try {// Se guarda no existe la carpeta Puzeos ni la carpeta que se pase por dir
        await Filesystem.mkdir({
          directory: Directory.External,
          recursive: true,
          path: 'Chanime/'
        });

        await Filesystem.mkdir({
          directory: Directory.External,
          recursive: true,
          path: 'Chanime/' + dir
        });

        const fileUrl = await Filesystem.writeFile(dataWrite);

        return fileUrl.uri;
      } catch (e) {
        try {// Se guarda si existe la carpeta Puzeos pero no la carpeta que se pase por dir
          await Filesystem.mkdir({
            directory: Directory.External,
            recursive: true,
            path: 'Chanime/' + dir
          });

          const fileUrl = await Filesystem.writeFile(dataWrite);
          console.log(fileUrl)
          return fileUrl.uri;
        } catch (e) {
          this.toastService.presentToast('No se pudo guardar el archivo', Colors.DANGER, 3000);
        }
      }
    }
  }

  async deleteFile(path: string) {
    await Filesystem.deleteFile({
      path
    })
  }
}
