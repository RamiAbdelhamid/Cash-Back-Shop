# استكشاف الأخطاء وحل المشاكل

## المشاكل الشائعة وحلولها

### 1. خطأ "ENOENT: no such file or directory, stat '/opt/render/project/src/Shop/dist/index.html'"

**السبب**: تطبيق React لم يتم بناؤه بشكل صحيح أو المسار غير صحيح.

**الحلول**:

#### أ. تحقق من إعدادات Render
```bash
# في Render، تأكد من الإعدادات التالية:
Build Command: |
  cd back && npm install
  cd ../Shop && npm install
  cd ../Shop && npm run build

Start Command: cd back && npm start
Root Directory: back
```

#### ب. اختبار البناء محلياً
```bash
# في مجلد المشروع الرئيسي
chmod +x build.sh
./build.sh
```

#### ج. فحص ملفات البناء
```bash
# بعد البناء، تحقق من وجود الملفات
ls -la Shop/dist/
cat Shop/dist/index.html
```

### 2. خطأ "MongoDB connection error"

**السبب**: مشكلة في الاتصال بقاعدة البيانات.

**الحلول**:

#### أ. تحقق من متغيرات البيئة
```bash
# في Render، تأكد من إضافة:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
PORT=10000
NODE_ENV=production
```

#### ب. اختبار الاتصال
```bash
# تأكد من أن MongoDB متاح من الإنترنت
mongo "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### 3. خطأ "Cannot find module"

**السبب**: تبعيات مفقودة أو غير مثبتة.

**الحلول**:

#### أ. إعادة تثبيت التبعيات
```bash
# في مجلد back
rm -rf node_modules package-lock.json
npm install

# في مجلد Shop
rm -rf node_modules package-lock.json
npm install
```

#### ب. فحص ملفات package.json
```bash
# تأكد من أن جميع التبعيات مذكورة
cat back/package.json
cat Shop/package.json
```

### 4. خطأ "Port already in use"

**السبب**: المنفذ مشغول.

**الحلول**:

#### أ. تغيير المنفذ
```bash
# في ملف .env
PORT=10000
```

#### ب. إيقاف العمليات المشغولة
```bash
# في Linux/Mac
lsof -ti:5000 | xargs kill -9

# في Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### 5. خطأ "CORS error"

**السبب**: مشكلة في إعدادات CORS.

**الحلول**:

#### أ. تحديث إعدادات CORS في الخادم
```javascript
// في back/server.js
app.use(cors({
  origin: ['https://your-app.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

### 6. خطأ "File upload failed"

**السبب**: مشكلة في إعدادات Multer.

**الحلول**:

#### أ. تحقق من مجلد uploads
```bash
# تأكد من وجود المجلد
mkdir -p back/uploads
chmod 755 back/uploads
```

#### ب. تحديث إعدادات Multer
```javascript
// في back/server.js
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

## اختبار التطبيق

### اختبار محلي
```bash
# 1. بناء تطبيق React
cd Shop
npm run build

# 2. تشغيل الخادم
cd ../back
npm start

# 3. اختبار المسارات
curl http://localhost:5000/
curl http://localhost:5000/dashboard
curl http://localhost:5000/api/cashback/inquiry
```

### اختبار على Render
```bash
# بعد النشر، اختبر المسارات التالية:
https://your-app.onrender.com/
https://your-app.onrender.com/dashboard
https://your-app.onrender.com/purchases
https://your-app.onrender.com/login
https://your-app.onrender.com/register
```

## سجلات الأخطاء

### فحص سجلات Render
1. اذهب إلى لوحة التحكم في Render
2. اضغط على خدمتك
3. اذهب إلى تبويب "Logs"
4. ابحث عن الأخطاء

### فحص سجلات محلية
```bash
# تشغيل الخادم مع سجلات مفصلة
cd back
NODE_ENV=development DEBUG=* npm start
```

## إعادة النشر

### إعادة نشر كاملة
```bash
# 1. حذف البناء السابق
rm -rf Shop/dist

# 2. إعادة البناء
cd Shop
npm run build

# 3. رفع التغييرات
git add .
git commit -m "Fix build issues"
git push origin main

# 4. في Render، اضغط على "Manual Deploy"
```

### إعادة نشر سريعة
```bash
# في Render، اضغط على "Redeploy"
```

## الدعم

إذا استمرت المشاكل:

1. **تحقق من السجلات**: راجع سجلات Render للحصول على تفاصيل الأخطاء
2. **اختبار محلي**: تأكد من أن التطبيق يعمل محلياً أولاً
3. **فحص التبعيات**: تأكد من أن جميع التبعيات مثبتة بشكل صحيح
4. **مراجعة الإعدادات**: تحقق من متغيرات البيئة وإعدادات Render

## روابط مفيدة

- [Render Documentation](https://render.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Express.js Documentation](https://expressjs.com/) 