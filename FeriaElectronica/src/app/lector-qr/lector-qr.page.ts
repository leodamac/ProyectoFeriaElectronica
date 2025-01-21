import { Component, ViewChild, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


import jsQR from "jsqr";
import * as QRCode from 'qrcode';

interface Integrante {
  nombre: string;
  foto: string;
}

interface Proyecto {
  nombre: string;
  integrantes: Integrante[];
  imagenProyecto: string;
}

@Component({
  selector: 'app-lector-qr',
  templateUrl: './lector-qr.page.html',
  styleUrls: ['./lector-qr.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LectorQRPage{
  @ViewChild('video', { static: false }) video!: ElementRef;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  @ViewChild('fileinput', { static: false }) fileinput!: ElementRef;

  scanActive = false;
  scanResult: string | null = null;
  qrCodeUrl: string | null = null;
  userInput: string = '';
  proyecto: Proyecto | null = null;

  proyectos: { [key: string]: Proyecto } = {
    'g1fesd': {
      nombre: 'Casa Inteligente',
      integrantes: [
        { nombre: 'María García', foto: 'assets/integrante1.jpg' },
        { nombre: 'Carla Figueroa', foto: 'assets/integrante2.jpg' }
      ],
      imagenProyecto: 'assets/g1fesd.jpg'
    },

    'g2fesd': {
      nombre: 'Incubadora',
      integrantes: [
        { nombre: 'Pedro Rodriguez', foto: 'assets/integrante3.jpg' },
        { nombre: 'Nicolás Tesla', foto: 'assets/integrante4.jpg' }
      ],
      imagenProyecto: 'assets/g2fesd.jpg'
    },
  };

  constructor() {}

  startScan() {
    this.scanActive = true;
    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement;
    const canvasContext = canvasElement.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
      videoElement.srcObject = stream;
      videoElement.setAttribute('playsinline', true);
      videoElement.play();

      requestAnimationFrame(this.scan.bind(this, videoElement, canvasElement, canvasContext));
    });
  }

  scan(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D) {
    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      canvasElement.height = videoElement.videoHeight;
      canvasElement.width = videoElement.videoWidth;
      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        this.scanActive = false;
        this.scanResult = code.data;
        this.mostrarDatosProyecto(code.data);
        if (videoElement.srcObject && videoElement.srcObject instanceof MediaStream) {
          (videoElement.srcObject as MediaStream).getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
      } else {
        requestAnimationFrame(this.scan.bind(this, videoElement, canvasElement, canvasContext));
      }
    } else {
      requestAnimationFrame(this.scan.bind(this, videoElement, canvasElement, canvasContext));
    }
  }

  captureImage() {
    this.fileinput.nativeElement.click();
  }

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = () => {
          try {
            const canvasElement = this.canvas.nativeElement;
            const canvasContext = canvasElement.getContext('2d');
            canvasElement.height = image.height;
            canvasElement.width = image.width;
            canvasContext.drawImage(image, 0, 0, canvasElement.width, canvasElement.height);
            const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              this.scanResult = code.data;
              this.mostrarDatosProyecto(code.data);
            } else {
              console.error('No QR code found.');
            }
          } catch (error) {
            console.error('Error processing the image', error);
          }
        };
      };
      reader.readAsDataURL(file);
    } else {
      console.error('No file selected.');
    }
  }

  reset() {
    this.scanResult = null;
    this.scanActive = false;
    this.proyecto = null;
  }

  mostrarDatosProyecto(codigo: string) {
    this.proyecto = this.proyectos[codigo] || null;
  }

  async generarCodigoQR() {
    try {
      this.qrCodeUrl = await QRCode.toDataURL(this.userInput);
    } catch (error) {
      console.error('Error generando el código QR:', error);
    }
  }
}
