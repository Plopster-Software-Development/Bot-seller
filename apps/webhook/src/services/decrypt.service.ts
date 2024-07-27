import { Injectable } from '@nestjs/common';
import { createDecipheriv, Decipher } from 'crypto';

interface Payload {
  iv: string;
  value: string;
  tag?: string; // tag opcional para otros algoritmos, pero no usado en aes-256-cbc
}

class DecryptException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptException';
  }
}

@Injectable()
export class DecryptService {
  private readonly cipherAlgorithm: string = 'aes-256-cbc'; // Asegúrate de que esto coincida con el algoritmo en Laravel

  constructor(private readonly keys: Buffer[]) {}

  private getJsonPayload(payload: string): Payload {
    return JSON.parse(payload);
  }

  public decrypt(payload: string, unserialize = true): any {
    const payloadObj: Payload = JSON.parse(
      Buffer.from(payload, 'base64').toString(),
    );

    const iv = Buffer.from(payloadObj.iv, 'base64');

    let decrypted: string | false = false;

    for (const key of this.keys) {
      try {
        const decipher: Decipher = createDecipheriv(
          this.cipherAlgorithm,
          key,
          iv,
        );

        // Desencripta el texto
        let decryptedBuffer = decipher.update(payloadObj.value, 'base64');
        decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);

        decrypted = decryptedBuffer.toString();
        break;
      } catch (error) {
        // Manejo de errores si la desencriptación falla
      }
    }

    if (decrypted === false) {
      throw new DecryptException('Could not decrypt the data.');
    }

    return unserialize ? JSON.parse(decrypted) : decrypted;
  }
}
