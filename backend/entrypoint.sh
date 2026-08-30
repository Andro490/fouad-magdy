#!/bin/sh
# ══════════════════════════════════════════════════════════
# entrypoint.sh - يشغل Prisma schema push ثم يبدأ السيرفر
# ══════════════════════════════════════════════════════════
set -e

echo "⏳ انتظار جاهزية قاعدة البيانات (postgres:5432)..."

# انتظار PostgreSQL يصبح جاهزاً باستخدام netcat
RETRIES=30
until nc -z postgres 5432 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ فشل الاتصال بقاعدة البيانات بعد 60 ثانية"
    exit 1
  fi
  echo "   لا تزال قاعدة البيانات غير جاهزة... ($RETRIES محاولة متبقية)"
  sleep 2
done

echo "✅ قاعدة البيانات جاهزة!"

# إنشاء/تحديث الجداول من schema.prisma مباشرةً
echo "🔧 تطبيق Prisma schema على قاعدة البيانات..."
npx prisma db push --accept-data-loss

echo "🚀 تشغيل السيرفر..."
exec node dist/server.js
