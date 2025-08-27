// src/typings.d.ts
declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(cameraId: any, config: any, qrCodeSuccessCallback: (decodedText: string) => void, qrCodeErrorCallback?: (errorMessage: string) => void): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    static getCameras(): Promise<Array<{ id: string; label?: string }>>;
  }
  export default Html5Qrcode;
}
