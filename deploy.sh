#!/bin/bash
# ══════════════════════════════════════════════════════════════
# deploy.sh - تشغيل المشروع على VPS (Hostinger)
# الاستخدام: bash deploy.sh
# ══════════════════════════════════════════════════════════════

set -e  # إيقاف عند أي خطأ

echo "🚀 بدء نشر مشروع Fouad F9..."
echo "══════════════════════════════"

# ── 1. التحقق من وجود ملف env.production ─────────────────────
if [ ! -f "backend/.env.production" ]; then
  echo "❌ خطأ: ملف backend/.env.production غير موجود!"
  echo "   انسخ المحتوى التالي في backend/.env.production"
  exit 1
fi

# ── 2. سحب آخر كود من GitHub ──────────────────────────────────
echo "📥 سحب آخر التحديثات من GitHub..."
git pull origin main || git pull origin master

# ── 3. إيقاف الـ containers القديمة ─────────────────────────────
echo "⏹  إيقاف الـ containers القديمة..."
docker compose down --remove-orphans 2>/dev/null || true

# ── 4. بناء وتشغيل containers جديدة ─────────────────────────────
echo "🔨 بناء وتشغيل المشروع..."
docker compose up --build -d

# ── 5. التحقق من التشغيل ─────────────────────────────────────────
echo ""
echo "⏳ انتظار تشغيل الـ containers (60 ثانية)..."
sleep 60

echo ""
echo "📊 حالة الـ containers:"
docker compose ps

echo ""
echo "🔍 فحص صحة Backend..."
if curl -f http://localhost:5000/ > /dev/null 2>&1; then
  echo "✅ Backend يعمل بنجاح!"
else
  echo "⚠️  Backend لم يستجب - تحقق من الـ logs:"
  docker compose logs backend --tail=30
fi

echo ""
echo "🗄️  فحص PostgreSQL..."
if docker compose exec postgres pg_isready -U fouad -d fouad_f9 > /dev/null 2>&1; then
  echo "✅ PostgreSQL يعمل بنجاح!"
else
  echo "⚠️  PostgreSQL لم يستجب"
  docker compose logs postgres --tail=20
fi

echo ""
echo "✅ تم النشر بنجاح!"
echo "🌐 الموقع متاح على: https://fouadf9.network"
echo ""
echo "📋 أوامر مفيدة:"
echo "   docker compose logs -f           # متابعة الـ logs"
echo "   docker compose logs backend -f   # logs الـ backend فقط"
echo "   docker compose logs postgres -f  # logs قاعدة البيانات"
echo "   docker compose restart backend   # إعادة تشغيل الـ backend"
echo "   docker compose down              # إيقاف كل شيء"
echo ""
echo "💾 نسخ احتياطي لقاعدة البيانات:"
echo "   docker compose exec postgres pg_dump -U fouad fouad_f9 > backup.sql"
echo "   docker compose exec -T postgres psql -U fouad fouad_f9 < backup.sql"
