import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/** Argon2id hashing (OWASP-recommended). Plain passwords are never stored or logged. */
@Injectable()
export class PasswordService {
  private dummyHash?: Promise<string>;

  hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Burns the same time as a real verification, so a login for an unknown
   * email is indistinguishable (timing-wise) from a wrong password.
   */
  async verifyAgainstDummy(password: string): Promise<false> {
    this.dummyHash ??= this.hash('vyro-dummy-password-for-timing');
    await this.verify(await this.dummyHash, password);
    return false;
  }
}
