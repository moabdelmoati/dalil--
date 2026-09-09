import http from 'http';

export interface LocalAskInput {
  question: string;
  documentText?: string;
  history?: Array<{ role: string; text?: string }>;
}

export async function askLocalModel(input: LocalAskInput, url: string = 'http://127.0.0.1:8000/ask'): Promise<string> {
  const payload = JSON.stringify({
    question: input.question,
    documentText: input.documentText || '',
    history: input.history || [],
  });

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 8000,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 60000,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(data);
              resolve(json.answer || '');
            } catch (err) {
              reject(new Error('Invalid JSON from local AI server'));
            }
          } else {
            reject(new Error(`Local AI server returned status ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Local AI server request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

export async function isLocalModelOnline(url: string = 'http://127.0.0.1:8000/health'): Promise<boolean> {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 8000,
        path: parsedUrl.pathname,
        method: 'GET',
        timeout: 2000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}
