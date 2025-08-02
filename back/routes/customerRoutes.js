import express from 'express';
import { 
  addCustomer, 
  getCustomers, 
  updateCustomer, 
  deleteCustomer, 
  searchCustomer,
  getCashbackBalance
} from '../controllers/customerController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// جميع المسارات تتطلب تسجيل دخول
router.use(verifyToken);

// إضافة عميل جديد
router.post('/', addCustomer);

// الحصول على جميع العملاء
router.get('/', getCustomers);

// البحث عن عميل برقم الهاتف
router.get('/search', searchCustomer);

// البحث عن رصيد الكاش باك للعميل في متجر محدد
router.get('/cashback', getCashbackBalance);

// تحديث بيانات العميل
router.put('/:id', updateCustomer);

// حذف العميل
router.delete('/:id', deleteCustomer);

export default router; 