// All cryptographic operations happen here using the Web Crypto API
// The private key NEVER leaves the browser unencrypted

const useCrypto = () => {

  // ── GENERATE RSA-2048 KEY PAIR ───────────────────────────────
  const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name:           'RSA-PSS',
        modulusLength:  2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash:           'SHA-256'
      },
      true, // extractable
      ['sign', 'verify']
    );
    return keyPair;
  };

  // ── EXPORT KEY TO PEM FORMAT ─────────────────────────────────
  const exportPublicKeyPem = async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    const b64      = btoa(String.fromCharCode(...new Uint8Array(exported)));
    return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
  };

  const exportPrivateKeyBuffer = async (privateKey) => {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
    return exported;
  };

  // ── ENCRYPT PRIVATE KEY WITH PASSPHRASE ──────────────────────
  const encryptPrivateKey = async (privateKeyBuffer, passphrase) => {
    const enc      = new TextEncoder();
    const salt     = window.crypto.getRandomValues(new Uint8Array(16));
    const iv       = window.crypto.getRandomValues(new Uint8Array(12));

    // Derive AES key from passphrase using PBKDF2
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Encrypt the private key bytes
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      privateKeyBuffer
    );

    return {
      encryptedPrivateKey: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv:                  btoa(String.fromCharCode(...salt, ...iv)), // store salt+iv together
      salt:                btoa(String.fromCharCode(...salt))
    };
  };

  // ── DECRYPT PRIVATE KEY WITH PASSPHRASE ──────────────────────
  const decryptPrivateKey = async (encryptedB64, ivB64, saltB64, passphrase) => {
    const enc       = new TextEncoder();
    const encrypted = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
    const salt      = Uint8Array.from(atob(saltB64),      c => c.charCodeAt(0));
    const iv        = Uint8Array.from(atob(ivB64),        c => c.charCodeAt(0)).slice(16); // last 12 bytes

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encrypted
    );

    return decrypted; // ArrayBuffer of private key bytes
  };

  // ── SIGN A BUFFER WITH PRIVATE KEY ───────────────────────────
  const signBuffer = async (passphrase, hashBuffer, encryptedPrivateKey, iv, salt) => {
    const privateKeyBuffer = await decryptPrivateKey(encryptedPrivateKey, iv, salt, passphrase);

    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'RSA-PSS', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: 32 },
      privateKey,
      hashBuffer
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  };

  // ── VERIFY A SIGNATURE ────────────────────────────────────────
  const verifySignature = async (publicKeyPem, signatureB64, dataBuffer) => {
    // Convert PEM to ArrayBuffer
    const pemBody = publicKeyPem
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\n/g, '');
    const keyBuffer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      keyBuffer,
      { name: 'RSA-PSS', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBuffer = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));

    return window.crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      publicKey,
      signatureBuffer,
      dataBuffer
    );
  };

  // ── HASH A BUFFER (SHA-256) ───────────────────────────────────
  const hashBuffer = async (buffer) => {
    const hashBuf = await window.crypto.subtle.digest('SHA-256', buffer);
    return {
      buffer: hashBuf,
      hex: [...new Uint8Array(hashBuf)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    };
  };

  return {
    generateKeyPair,
    exportPublicKeyPem,
    exportPrivateKeyBuffer,
    encryptPrivateKey,
    decryptPrivateKey,
    signBuffer,
    verifySignature,
    hashBuffer
  };
};

export default useCrypto;