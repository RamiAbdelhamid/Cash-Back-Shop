# تعليمات النشر على Render

## المشكلة الأصلية
كانت المشكلة أن مسارات React مثل `/dashboard` لا تعمل على Render وتظهر خطأ "not found". هذا يحدث لأن الخادم لا يعرف كيفية التعامل مع مسارات React Router.

## الحل المطبق

### 1. تحديث الخادم الخلفي (`back/server.js`)

تم إضافة الكود التالي للتعامل مع مسارات React:

```javascript
// Serve static files from React build
app.use(express.static(path.join(__dirname, '../Shop/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Shop/dist/index.html'));
});
```

### 2. إضافة ملفات التكوين

#### ملف `Shop/public/_redirects`:
```
/*    /index.html   200
```

#### ملف `Shop/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### ملف `Shop/netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. تحديث إعدادات Vite (`Shop/vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react() , tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  base: '/',
  server: {
    historyApiFallback: true,
  },
})
```

## خطوات النشر على Render

### 1. إعداد المستودع
```bash
# تأكد من أن جميع التغييرات تم رفعها
git add .
git commit -m "Fix React routing for deployment"
git push origin main
```

### 2. إعداد Render

1. اذهب إلى [Render.com](https://render.com)
2. سجل الدخول أو أنشئ حساب جديد
3. اضغط على "New +" واختر "Web Service"
4. اربط مستودع GitHub الخاص بك

### 3. تكوين الخدمة

- **Name**: `cash-back-shop`
- **Environment**: `Node`
- **Region**: اختر المنطقة الأقرب لك
- **Branch**: `main`
- **Root Directory**: `back`
- **Build Command**: 
  ```bash
  cd back && npm install && cd ../Shop && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  cd back && npm start
  ```

### 4. إضافة متغيرات البيئة

في قسم "Environment Variables"، أضف:

- `MONGO_URI`: رابط MongoDB الخاص بك
- `JWT_SECRET`: مفتاح سري عشوائي (مثال: `my-super-secret-key-123`)
- `PORT`: `10000`
- `NODE_ENV`: `production`

### 5. النشر

1. اضغط على "Create Web Service"
2. انتظر حتى يكتمل البناء والنشر
3. ستظهر رسالة "Deploy successful"

## اختبار التطبيق

بعد النشر، يمكنك اختبار المسارات التالية:

- ✅ `https://your-app.onrender.com/` - الصفحة الرئيسية
- ✅ `https://your-app.onrender.com/dashboard` - لوحة التحكم
- ✅ `https://your-app.onrender.com/purchases` - المشتريات
- ✅ `https://your-app.onrender.com/login` - تسجيل الدخول
- ✅ `https://your-app.onrender.com/register` - إنشاء حساب

## استكشاف الأخطاء

### إذا كانت المسارات لا تزال لا تعمل:

1. **تحقق من ملفات البناء**:
   - تأكد من أن مجلد `Shop/dist` تم إنشاؤه
   - تأكد من وجود ملف `index.html` في المجلد

2. **تحقق من سجلات Render**:
   - اذهب إلى لوحة التحكم في Render
   - اضغط على خدمتك
   - اذهب إلى تبويب "Logs"
   - ابحث عن أي أخطاء

3. **اختبار محلي**:
   ```bash
   cd Shop
   npm run build
   cd ../back
   npm start
   ```

### إذا كان الخادم لا يبدأ:

1. تحقق من متغيرات البيئة
2. تأكد من أن رابط MongoDB صحيح
3. تحقق من سجلات الأخطاء في Render

## ملاحظات مهمة

- تأكد من أن MongoDB متاح من الإنترنت (أو استخدم MongoDB Atlas)
- تأكد من أن جميع التبعيات مثبتة بشكل صحيح
- قد يستغرق النشر الأول وقتاً أطول بسبب تثبيت التبعيات

## الدعم

إذا واجهت أي مشاكل، يمكنك:
1. مراجعة سجلات Render
2. التحقق من ملف `README.md` للحصول على مزيد من المعلومات
3. التأكد من أن جميع الملفات تم رفعها بشكل صحيح 