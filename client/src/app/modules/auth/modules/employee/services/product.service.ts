declare function require(path: string);
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ProductService {

  constructor(private _http: HttpClient) { }

  /* @param {string} imageUrl -
   * @returns {}
   */
  getImage(dataUrl: string) {
    if (dataUrl) {
      return this._http.get(dataUrl, {responseType: 'blob'});
    }
  }

  getNoPictureImage() {
    return require('../../../../../../assets/img/no-picture.png');
  }

  /* After product image(type: png) is cropped, it is not saved in 
   * a file and represented as base64 string. In order to upload
   * image to S3, we have to convert it into a File first.
   * 
   * @param {string} dataUri - base64 encoded string of image
   * @param {string} presignedUrl - S3 URL to upload image to.
   */
  putImageToS3(dataUri: string, presignedUrl: string) {
    if (presignedUrl && dataUri.length > 0) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'image/png',
          'x-amz-acl': 'public-read'
        })
      };
      const fileName = presignedUrl.split('/').pop();  // extract file name
      const imageFile = new File([this._dataUriToBlob(dataUri)], fileName, { type: 'image/png'});
      return this._http.put(presignedUrl, imageFile, httpOptions)
      .subscribe(response => {
        console.log('Put request is successful ' + response);
      },
      error => {
        console.log('Error: ' + error);
      });
    }
  }

  /* convert input base64 string to a blob.
   * @param {string} dataUri - base64 encoded string of png image.
   * @returns {Blob}
   */
  private _dataUriToBlob(dataUir: string) {
    const byteString = window.atob(dataUir.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });    
    return blob;
  }
}
