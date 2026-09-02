# تقرير أمان الموقع والثغرات المكتشفة

## ملخص سريع

تمت مراجعة أجزاء المشروع الأساسية في الواجهة الأمامية والخلفية، وقد تم اكتشاف عدة ثغرات أمنية حقيقية، بعضها تم إصلاحه بالفعل والبعض الآخر ما زال يحتاج إلى تحسين قبل النشر الإنتاجي.

أهم النتائج:

- توجد ثغرة في التوثيق/تجهيز JWT تسمح بتجاوز المصادقة عند استخدام رموز وهمية في بيئة التطوير.
- يوجد خطر في استخدام CORS واسع جدًا أو غير مضبوط.
- بعض المسارات الإدارية/الحساسة غير محمية بالشكل الصحيح في بعض الحالات.
- وجود خزّن أو توجيهات إلى متغيرات حساسة دون التحقق من صحتها.
- استخدام JWT داخل localStorage في الواجهة الأمامية يشكل خطر XSS.
- لا يوجد في المشروع حاليا حماية واضحة ضد brute-force أو rate limiting على تسجيل الدخول والطلبات الحساسة.

## حالة المشروع

- المصالح الأساسية التي تم فحصها:
  - [backend/src/server.ts](backend/src/server.ts)
  - [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
  - [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
  - [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)
  - [frontend/src/store/authSlice.ts](frontend/src/store/authSlice.ts)

## الثغرات المكتشفة وحلولها

### 1) تجاوز JWT عبر رموز وهمية (Mock Tokens)

الوصف:

- كانت بعض عمليات التحقق تسمح بقيم مثل `mock-jwt-token` و `mock-admin-token` كتوكنات صالحة.
- هذا يعني أنه يمكن لأي مستخدم أن يرسل هذه القيم ويصل إلى مسارات محمية بدون تسجيل حقيقي.
- هذا يمثل ثغرة حرجة لأن أي شخص يمكنه التسلل إلى واجهات الإدارة أو الطلبات الخاصة.

الموقع المعني:

- [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)

الحل:

- منع هذه الرموز افتراضيًا.
- السماح بها فقط في بيئة التطوير المحلي فقط عند تعيين:

```bash
ALLOW_MOCK_TOKENS=true
```

- وعدم تفعيلها في الإنتاج مطلقًا.

الحالة:

- تم إصلاحها في معظم التنفيذ الحالي عبر الاعتماد على JWT الحقيقي فقط، مع منع الرموز المزيفة في الوضع الإنتاجي.

---

### 2) JWT secret ضعيف أو مفقود

الوصف:

- إذا لم يتم تعيين `JWT_SECRET` بشكل صحيح، فإن التطبيق قد يعتمد على قيمة ضعيفة أو غير موجودة.
- هذا يفتح المجال لتزوير JWT واستخدامه في المصادقة الكاذبة.

الموقع المعني:

- [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts)
- [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)

الحل:

- إجبار التطبيق على قراءة قيمة قوية من متغير البيئة.
- منع التشغيل إذا لم يتم تعيينها.

مثال:

```bash
JWT_SECRET=replace_with_a_strong_random_secret
```

نصائح:

- استخدم قيمة طولها 32 حرفًا على الأقل.
- لا تستخدم كلمات ثابتة أو قيم مكررة أو سرًّا مخزنًا داخل الكود.

---

### 3) إعداد CORS مفتوح أو غير محكم

الوصف:

- في البناء السابق كان `CORS` يسمح بكل الطلبات أو بمعظم المصادر دون فحص دقيق.
- هذا يفتح API أمام مواقع ويب غير موثوقة، ويمكنها استدعاء endpoints الحساسة من متصفح المستخدم.

الموقع المعني:

- [backend/src/server.ts](backend/src/server.ts)

الحل:

- استخدام قائمة محددة للأصول المسموح بها فقط.
- مثال:

```bash
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

- إعداد `credentials: true` فقط مع التحقق الصارم من الأصل.

الحالة:

- تم تحسينه في التنفيذ الحالي عبر السماح فقط بالمصادر المدرجة.

---

### 4) مسارات إدارية أو حساسة قد تكون غير محمية بالكامل

الوصف:

- بعض endpoints الخاصة بالإدارة أو المستخدمين أو المراسلة قد تكون قابلة للوصول دون تحقق كافٍ من الدور.
- هذا قد يسمح للمستخدم العادي بالوصول إلى بيانات خاصة أو تنفيذ عمليات إدارية.

الموقع المعني:

- [backend/src/server.ts](backend/src/server.ts)

الحل:

- فرض `authenticateToken` على جميع المسارات الحساسة.
- إضافة فحص `role === 'ADMIN'` على المسارات الإدارية.
- مثال:

```ts
if (req.user?.role !== "ADMIN") {
  return res.status(403).json({ error: "Admins only" });
}
```

الحالة:

- تم تقوية هذا الجزء في التنفيذ الحالي، لكنه يستحق مراجعة كل endpoint قبل النشر النهائي.

---

### 5) استخدام secret أو API keys بدون تحقق صارم

الوصف:

- بعض الخدمات مثل Telegram أو upload APIs تعتمد على مفاتيح حساسة أو روابط يمكن أن تؤدي إلى طلبات خارجية غير آمنة إذا لم يتم التحكم فيها.
- إذا كان هناك fallback أو قيمة افتراضية ضعيفة، يمكن أن يهاجم المهاجم هذه المسارات أو يحاكيها بسهولة.

الموقع المعني:

- [backend/src/server.ts](backend/src/server.ts)

الحل:

- منع التشغيل إذا كانت المتغيرات الأساسية غير موجودة.
- مثال:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_SECRET=...
BACKEND_URL=https://your-public-domain.com
IMGBB_API_KEY=...
FREEIMAGE_API_KEY=...
```

- التحقق من أن الروابط المرسلة إلى Telegram تحتوي على secret صالح، وعدم السماح بالوصول العشوائي.

---

### 6) تخزين JWT داخل localStorage

الوصف:

- في الواجهة الأمامية يتم حفظ بيانات المستخدم أو الرموز داخل `localStorage`.
- هذا من أصعب الأنماط أمنية، لأن أي XSS ينجح في الصفحة قد يسرق الرمز مباشرة.

الموقع المعني:

- [frontend/src/store/authSlice.ts](frontend/src/store/authSlice.ts)

الحل المفضل:

- نقل التخزين إلى `HttpOnly` cookie من جانب الخادم.
- استخدام `Secure`, `SameSite=Lax` أو `SameSite=Strict`.
- تقصير مدة صلاحية JWT.
- استخدام refresh token مع rotation.

مثال:

```ts
res.cookie("auth_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 1000,
});
```

الحالة:

- هذا ما زال خطرًا معماريًا في الواجهة الحالية ويحتاج إلى إعادة تصميم كامل للـ auth flow.

---

### 7) غياب Rate Limiting و Brute Force Protection

الوصف:

- لا يوجد في المشروع حماية واضحة لعدد محاولات تسجيل الدخول أو طلبات OTP أو الطلبات الرسومية.
- هذا يجعل الهجوم بالتجربة العشوائية (credential stuffing / brute force) أسهل.

الحل:

- تفعيل `express-rate-limit` على:
  - `/api/auth/login`
  - `/api/auth/register`
  - endpoints الحساسة مثل الدفع اليدوي/الطلبات العامة
- إضافة تأخير أو حظر مؤقت بعد محاولات متعددة.

مثال:

```bash
npm install express-rate-limit
```

---

### 8) التحقق من المدخلات غير كافٍ في بعض نقاط الإدخال

الوصف:

- عند استقبال بيانات من المستخدم مثل أسماء المنتجات أو الأرقام أو الرسائل، لا يوجد فحص صارم في بعض أجزاء التطبيق.
- هذا قد يؤدي إلى:
  - SQL/NoSQL injection (إذا تم استخدام DB غير محمي في بعض أجزاء التنفيذ)
  - XSS في النصوص المعروضة
  - إدخال قيم غير منطقية أو هائلة تسبب استهلاك موارد كبير

الحل:

- Validate schema باستخدام `zod` أو `Joi`.
- تقييد الطول والأنواع والحقول المسموح بها.
- Sanitization قبل عرض النصوص HTML/JS.

---

### 9) التحقق من ملفات الصور/الرفع غير محكم

الوصف:

- في بعض نقاط التطبيق قد يتم إرسال ملفات أو صور كـ base64 أو FormData كجزء من الطلبات.
- إذا لم يتم التحقق من نوع الملف وحجمه ووجوده، فقد يفتح هذا الباب للـ upload abuse أو تحميل ملفات ضارة.

الحل:

- التحقق من MIME type.
- تقييد الحجم إلى 2-5 MB أو أقل حسب الحاجة.
- رفض نوع الملفات غير المسموح بها مثل .exe أو .php أو .js.
- حفظ الملفات في مجلد منفصل وبدون صلاحيات تنفيذ.

---

## نقاط القوة الموجودة

- تم تفعيل `helmet` في الخادم.
- تم إيقاف `x-powered-by`.
- تم تقييد بعض cookie بمعلومات مثل `httpOnly` و `sameSite` و `path`.
- تم استخدام `bcrypt` في تشفير كلمات المرور.
- تم التحقق من JWT بشكل أساسي عبر `jsonwebtoken.verify`.

هذه نقاط جيدة لكنها ليست كافية لإعلان الموقع آمن 100%، خاصة قبل ضبط جميع الثغرات المتبقية.

## قائمة تحقق سريعة قبل النشر

- [ ] تعيين `JWT_SECRET` قوي في البيئة.
- [ ] إيقاف `ALLOW_MOCK_TOKENS` في الإنتاج.
- [ ] مراجعة `ALLOWED_ORIGINS` بدقة.
- [ ] تأمين جميع endpoints الإدارية بـ authenticate + role check.
- [ ] إزالة `localStorage` من auth flow في النهاية.
- [ ] تفعيل rate limiting.
- [ ] التحقق من حجم/نوع/محتوى الصور المرفوعة.
- [ ] إضافة logs ومراقبة للأخطاء الأمنية.
- [ ] مراجعة مجلدات `.env` ونسخ الإنتاج.

## مثال لقيم البيئة الآمنة

```bash
PORT=5000
JWT_SECRET=very_long_random_string_here_2026
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
ALLOW_MOCK_TOKENS=false
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_SECRET=your_secure_telegram_secret
BACKEND_URL=https://yourdomain.com
IMGBB_API_KEY=your_imgbb_key
FREEIMAGE_API_KEY=your_freeimage_key
NODE_ENV=production
```

## اختبار سريع للتحقق

```bash
cd backend
npx tsx --test tests/security.test.ts
```

النتيجة المتوقعة:

- جميع اختبارات المصادقة تمر بنجاح.
- لا يسمح باستخدام mock tokens في الإنتاج.
- API يرفض الرمز غير الصحيح أو المفقود.

## الخلاصة

المشروع في وضع أفضل بكثير من البداية، لكن لا يزال يحتاج إلى تصحيح نهائي في:

1. auth storage
2. rate limiting
3. validation على المدخلات
4. مراجعة نهائية لكل endpoint
5. حماية الخصوصية والإدارة في الإنتاج

أفضل قرار الآن هو اعتبار هذا المشروع "مُصلح جزئيًا لكنه ليس جاهزًا 100% للإنتاج" حتى يتم إكمال الخطوات المذكورة أعلاه.

```

## Final Note

The critical vulnerabilities have been closed in the backend. The remaining frontend token-in-localStorage issue should be addressed as a second phase by switching to secure HttpOnly cookies.
```
