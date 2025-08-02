# Cash Back Shop

تطبيق ويب لشراء المنتجات والحصول على كاش باك.

## الميزات

- تسجيل الدخول وإنشاء حساب
- عرض المنتجات المتاحة
- شراء المنتجات
- تتبع المشتريات
- عرض رصيد الكاش باك
- تحميل صورة الملف الشخصي

## التقنيات المستخدمة

### الواجهة الأمامية (Frontend)
- React 19
- React Router DOM
- Tailwind CSS
- Vite
- Axios

### الخادم الخلفي (Backend)
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (لرفع الملفات)
- bcryptjs (لتشفير كلمات المرور)

## التثبيت والتشغيل

### المتطلبات
- Node.js (الإصدار 18 أو أحدث)
- MongoDB

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd Cash-Back-Shop
```

2. **تثبيت التبعيات**
```bash
# تثبيت تبعيات الخادم الخلفي
cd back
npm install

# تثبيت تبعيات الواجهة الأمامية
cd ../Shop
npm install
```

3. **إعداد متغيرات البيئة**
```bash
# في مجلد back، أنشئ ملف .env
cd back
touch .env
```

أضف المتغيرات التالية إلى ملف `.env`:
```
MONGO_URI=mongodb://localhost:27017/cashback-shop
JWT_SECRET=your-secret-key
PORT=5000
```

4. **بناء تطبيق React**
```bash
cd Shop
npm run build
```

5. **تشغيل الخادم**
```bash
cd back
npm start
```

## النشر على Render

### إعداد Render

1. **ربط المستودع بـ Render**
   - اذهب إلى [Render.com](https://render.com)
   - أنشئ حساب جديد أو سجل الدخول
   - اضغط على "New +" واختر "Web Service"
   - اربط مستودع GitHub الخاص بك

2. **إعداد الخدمة**
   - **Name**: cash-back-shop
   - **Environment**: Node
   - **Build Command**: `cd back && npm install && cd ../Shop && npm install && npm run build`
   - **Start Command**: `cd back && npm start`
   - **Root Directory**: `back`

3. **إضافة متغيرات البيئة**
   - `MONGO_URI`: رابط MongoDB الخاص بك
   - `JWT_SECRET`: مفتاح سري عشوائي
   - `PORT`: 10000 (أو أي منفذ متاح)

### حل مشكلة مسارات React

المشكلة التي تواجهها هي أن مسارات React مثل `/dashboard` لا تعمل على Render. تم حل هذه المشكلة من خلال:

1. **تحديث الخادم الخلفي** (`back/server.js`):
   - إضافة middleware لخدمة ملفات React الثابتة
   - إضافة route handler للتعامل مع جميع المسارات غير الموجودة
   - إضافة فحص لوجود ملفات البناء

2. **إضافة ملفات التكوين**:
   - `Shop/public/_redirects`: للتعامل مع مسارات React
   - `Shop/vercel.json`: للتوجيه الصحيح
   - `Shop/netlify.toml`: كبديل إضافي

3. **تحديث إعدادات Vite** (`Shop/vite.config.js`):
   - إضافة `historyApiFallback: true`
   - تكوين مجلد البناء

4. **إضافة سكريبتات البناء**:
   - `build.sh`: سكريبت شامل للبناء
   - تحديث `package.json` مع سكريبتات البناء

## هيكل المشروع

```
Cash-Back-Shop/
├── back/                 # الخادم الخلفي
│   ├── controllers/      # وحدات التحكم
│   ├── models/          # نماذج البيانات
│   ├── routes/          # مسارات API
│   ├── uploads/         # الملفات المرفوعة
│   └── server.js        # نقطة بداية الخادم
├── Shop/                # الواجهة الأمامية
│   ├── src/
│   │   ├── components/  # المكونات
│   │   ├── layout/      # تخطيط الصفحة
│   │   ├── pages/       # صفحات التطبيق
│   │   └── utils/       # الأدوات المساعدة
│   └── public/          # الملفات العامة
└── README.md
```

## API Endpoints

### المصادقة
- `POST /api/register` - تسجيل مستخدم جديد
- `POST /api/login` - تسجيل الدخول
- `GET /api/profile` - الحصول على معلومات الملف الشخصي
- `PUT /api/profile` - تحديث الملف الشخصي

### العملاء
- `GET /api/customers` - الحصول على قائمة العملاء
- `POST /api/customers` - إنشاء عميل جديد
- `PUT /api/customers/:id` - تحديث بيانات العميل
- `DELETE /api/customers/:id` - حذف العميل

### المشتريات
- `GET /api/purchases` - الحصول على قائمة المشتريات
- `POST /api/purchases` - إنشاء مشترى جديد
- `GET /api/purchases/:id` - الحصول على تفاصيل المشترى

### الكاش باك
- `GET /api/cashback/inquiry` - الاستعلام عن رصيد الكاش باك

## المساهمة

1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.