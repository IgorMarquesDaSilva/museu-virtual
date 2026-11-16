// Inicia a API e o Vue CLI com o mesmo comando usado nas aulas: npm run serve.
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const frontDir = path.resolve(__dirname, '..');
const backDir = path.resolve(frontDir, '..', 'museu-back-end');
const backEntry = path.join(backDir, 'src', 'server.js');
const vueCli = path.join(frontDir, 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');

let backProcess;
let frontProcess;
let stopping = false;

async function apiReady() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/health', {
      signal: AbortSignal.timeout(800)
    });
    return response.ok && (await response.json()).status === 'ok';
  } catch {
    return false;
  }
}

function stop() {
  stopping = true;
  frontProcess?.kill();
  backProcess?.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

async function main() {
  if (!existsSync(vueCli) || !existsSync(path.join(backDir, 'node_modules', 'express'))) {
    throw new Error('Instale as dependências nas duas pastas com npm install antes de iniciar.');
  }

  if (!(await apiReady())) {
    console.log('Iniciando o back-end na porta 3000...');
    backProcess = spawn(process.execPath, [backEntry], { cwd: backDir, stdio: 'inherit' });
    backProcess.on('error', error => console.error('Falha ao iniciar o back-end:', error.message));

    let ready = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (await apiReady()) {
        ready = true;
        break;
      }
      if (backProcess.exitCode !== null) break;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!ready) throw new Error('O back-end não iniciou. Confira a porta 3000 e as dependências.');
  } else {
    console.log('Back-end já está ativo na porta 3000.');
  }

  frontProcess = spawn(process.execPath, [vueCli, 'serve', ...process.argv.slice(2)], {
    cwd: frontDir,
    stdio: 'inherit'
  });
  frontProcess.on('error', error => console.error('Falha ao iniciar o Vue CLI:', error.message));
  frontProcess.on('exit', code => {
    if (!stopping) stop();
    process.exitCode = process.exitCode || code || 0;
  });
  backProcess?.on('exit', code => {
    if (!stopping && frontProcess) {
      console.error('O back-end parou. Encerrando o servidor Vue.');
      frontProcess.kill();
      process.exitCode = code || 1;
    }
  });
}

main().catch(error => {
  console.error(error.message);
  stop();
  process.exitCode = 1;
});
