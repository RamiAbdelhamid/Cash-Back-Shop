import express from 'express';
import { 
  addPurchase, 
  getPurchases, 
  getCustomerPurchases, 
  deletePurchase, 
  getPurchaseStats,
  getCustomerStats
} from '../controllers/purchaseController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// جميع المسارات تتطلب تسجيل دخول
router.use(verifyToken);

// إضافة مشترى جديد
router.post('/', addPurchase);

// الحصول على جميع مشتريات المتجر
router.get('/', getPurchases);

// البحث عن مشتريات عميل معين
router.get('/customer', getCustomerPurchases);

// إحصائيات المشتريات
router.get('/stats', getPurchaseStats);

// إحصائيات العميل المحدد
router.get('/customer-stats', getCustomerStats);

// حذف مشترى
router.delete('/:id', deletePurchase);

export default router; 