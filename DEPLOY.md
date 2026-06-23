# Deploy do verbus (DevLingo)

Frontend na **Vercel**, backend no **servidor Ubuntu LocalDeploy** (`192.168.0.112`),
exposto via **Cloudflare Tunnel** — mesmo padrão dos outros serviços do `Changzaoo`.

| Camada   | Onde        | URL                                      |
|----------|-------------|------------------------------------------|
| Frontend | Vercel      | (gerada no deploy)                       |
| Backend  | Ubuntu :8006| `https://verbus-api.nexusholding.xyz`    |
| Dados    | SQLite      | `/home/v/storage/verbus.db`              |

---

## 1) Backend no servidor (porta 8006)

```bash
cd ~ && git clone https://github.com/Changzaoo/verbus.git verbus
cd verbus/backend
npm install
npm run build                       # compila para dist/
mkdir -p /home/v/storage
nano .env                           # cole o conteúdo de backend/.env.example e preencha
```

`.env` (no servidor):
```
PORT=8006
JWT_SECRET=<openssl rand -hex 32>
DEVLINGO_DB=/home/v/storage/verbus.db
LOG_LEVEL=info
```

No **Painel** (http://192.168.0.112:3000) → Novo Serviço:
- Pasta: `/home/v/verbus/backend`
- Comando: `node --env-file=.env dist/server.js`
- Porta: `8006`
- Teste: `http://192.168.0.112:8080/verbus/health` → o backend responde em `/api/health`.

> Na primeira execução o banco é criado e populado automaticamente (seed) em `DEVLINGO_DB`.

## 2) Cloudflare Tunnel

Adicione ao `~/.cloudflared/config.yml` (na seção `ingress`, antes do `http_status:404`):
```yaml
  - hostname: verbus-api.nexusholding.xyz
    service: http://localhost:8006
```
E crie o DNS:
```bash
cloudflared tunnel route dns localdeploy verbus-api.nexusholding.xyz
sudo systemctl restart cloudflared
```
Teste: `https://verbus-api.nexusholding.xyz/api/health`

## 3) Frontend na Vercel

A variável de ambiente do projeto na Vercel:
```
VITE_API_URL = https://verbus-api.nexusholding.xyz
```
(Configurada no deploy. Após o backend estar no ar, faça **Redeploy** se necessário.)

O CORS do backend já aceita qualquer origem (`origin: true`), então o domínio da
Vercel funciona sem ajuste. O roteamento SPA é tratado pelo `vercel.json`.
