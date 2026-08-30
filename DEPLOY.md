# 🚀 دليل رفع المشروع على Hostinger VPS

## ✅ الهيكل الجديد - كل شيء على VPS بدون Railway

```
[Browser] ──→ [Nginx :80]
                  ├── /api/* ──→ [Backend :5000]  (Node.js + Express)
                  │                    ↓
                  │             [PostgreSQL :5432]  (على نفس VPS)
                  └── /*     ──→ [Frontend :80]    (React build)
```

**كل شيء داخل Docker على الـ VPS - بدون Railway ❌**

---

## خطوات الـ Deploy (أول مرة)

### 1. تثبيت Docker على VPS
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
sudo apt install docker-compose-plugin -y
```

### 2. جلب المشروع
```bash
cd /var/www
git clone https://github.com/Andro490/fouad-magdy.git
cd fouad-magdy
```

### 3. إنشاء ملف `.env.production`
```bash
nano backend/.env.production
```
الصق المحتوى التالي (**مهم: تغيير كلمة سر JWT**):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://fouad:fouad_db_password_2024@postgres:5432/fouad_f9"
JWT_SECRET="your_strong_secret_here_change_this"
TELEGRAM_BOT_TOKEN="8907464118:AAEN9qZtlmfId4CECxilKP3Tb14nkCa9p2M"
TELEGRAM_CHAT_ID="6188790474"
TELEGRAM_SECRET="fouad_secret_123"
BACKEND_URL="https://fouadf9.network"
ALLOWED_ORIGINS="https://fouadf9.network,https://www.fouadf9.network"
ALLOW_MOCK_TOKENS="false"
ADMIN_PHONE="Foadmagdy0152020"
ADMIN_PASSWORD="Foadmagdy0152020"
```

### 4. تشغيل المشروع
```bash
bash deploy.sh
```

---

## نقل البيانات من Railway إلى VPS (مرة واحدة)

> قبل ما تغلق Railway، انقل البيانات الموجودة

```bash
# 1. على جهازك أو Railway shell - export البيانات
pg_dump "postgresql://postgres:lNiHqXsrEroKCAKUJsIVDtaQoknvwRnN@altaria.proxy.rlwy.net:20973/railway" > railway_backup.sql

# 2. انقل الملف للـ VPS
scp railway_backup.sql root@srv1932803.hstgr.cloud:/var/www/fouad-magdy/

# 3. على الـ VPS - بعد تشغيل docker compose
cd /var/www/fouad-magdy
docker compose exec -T postgres psql -U fouad fouad_f9 < railway_backup.sql

echo "✅ تم نقل البيانات بنجاح!"
```

---

## الملفات المضافة

| الملف | الوظيفة |
|-------|---------|
| `docker-compose.yml` | 4 services: postgres + backend + frontend + nginx |
| `backend/Dockerfile` | بناء الـ backend image |
| `backend/entrypoint.sh` | ينتظر postgres ثم يعمل schema push ثم يشغل السيرفر |
| `frontend/Dockerfile` | بناء الـ frontend image |
| `frontend/nginx-frontend.conf` | SPA routing |
| `nginx/nginx.conf` | Reverse proxy رئيسي |
| `backend/.env.production` | متغيرات البيئة |
| `deploy.sh` | سكريبت نشر تلقائي |

---

## أوامر مفيدة

```bash
# نسخ احتياطي من قاعدة البيانات
docker compose exec postgres pg_dump -U fouad fouad_f9 > backup_$(date +%Y%m%d).sql

# استعادة نسخة احتياطية
docker compose exec -T postgres psql -U fouad fouad_f9 < backup.sql

# مشاهدة الـ logs
docker compose logs -f
docker compose logs postgres -f
docker compose logs backend -f

# تحديث بعد push
git pull && docker compose up --build -d
```
