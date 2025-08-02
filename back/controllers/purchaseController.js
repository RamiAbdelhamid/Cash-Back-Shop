import Purchase from '../models/Purchase.js';
import Customer from '../models/Customer.js';

// إضافة مشترى جديد
export const addPurchase = async (req, res) => {
  try {
    const { 
      customerPhone, 
      purchaseAmount, 
      cashbackType,
      useExistingCashback,
      cashbackToUse
    } = req.body;
    
    const storeId = req.user.userId;

    // البحث عن العميل برقم الهاتف
    const customer = await Customer.findOne({ 
      phoneNumber: customerPhone, 
      storeId,
      isActive: true 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود. يرجى التحقق من رقم الهاتف'
      });
    }

    const purchaseAmountNum = parseFloat(purchaseAmount) || 0;
    const cashbackToUseNum = parseFloat(cashbackToUse) || 0;

    // التحقق من رصيد الكاش باك إذا كان سيتم استخدامه
    if (useExistingCashback && cashbackToUseNum > customer.cashbackBalance) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ المراد استخدامه أكبر من رصيد الكاش باك المتوفر'
      });
    }
    const cashbackPercentage = parseFloat(req.body.cashbackPercentage) || 0;
    const newCashbackAmount = purchaseAmountNum * (cashbackPercentage / 100);
    
    
    // حساب التغيير في رصيد الكاش باك
    const cashbackChange = newCashbackAmount - cashbackToUseNum;

    // إنشاء المشترى
    const purchase = new Purchase({
      customerId: customer._id,
      storeId,
      purchaseAmount: purchaseAmountNum,
      cashbackAmount: newCashbackAmount,
      cashbackPercentage: cashbackPercentage,
      description: cashbackType || 'مشترى عادي'
    });

    await purchase.save();

    // تحديث رصيد الكاش باك للعميل
    customer.cashbackBalance += cashbackChange;
    await customer.save();

    // جلب بيانات المشترى مع معلومات العميل
    const purchaseWithCustomer = await Purchase.findById(purchase._id)
      .populate('customerId', 'name phoneNumber cashbackBalance');

    res.status(201).json({
      success: true,
      message: 'تم تسجيل عملية الشراء بنجاح',
      purchase: purchaseWithCustomer,
      updatedCustomerBalance: customer.cashbackBalance,
      cashbackAdded: newCashbackAmount,
      cashbackUsed: cashbackToUseNum
    });
  } catch (err) {
    console.error('خطأ في إضافة المشترى:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في تسجيل عملية الشراء',
      error: err.message
    });
  }
};

// الحصول على جميع مشتريات المتجر
export const getPurchases = async (req, res) => {
  try {
    const storeId = req.user.userId;
    const { page = 1, limit = 10, customerId } = req.query;

    const query = { storeId, isActive: true };
    if (customerId) {
      query.customerId = customerId;
    }

    const purchases = await Purchase.find(query)
      .populate('customerId', 'name phoneNumber')
      .sort({ purchaseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Purchase.countDocuments(query);

    res.status(200).json({
      success: true,
      purchases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('خطأ في جلب المشتريات:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب المشتريات',
      error: err.message
    });
  }
};

// البحث عن مشتريات عميل معين
export const getCustomerPurchases = async (req, res) => {
  try {
    const { customerPhone, customerName } = req.query;
    const storeId = req.user.userId;

    let customer = null;
    
    if (customerPhone) {
      customer = await Customer.findOne({ 
        phoneNumber: customerPhone, 
        storeId,
        isActive: true 
      });
    } else if (customerName) {
      customer = await Customer.findOne({ 
        name: customerName, 
        storeId,
        isActive: true 
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    const purchases = await Purchase.find({ 
      customerId: customer._id, 
      storeId,
      isActive: true 
    })
    .populate('customerId', 'name phoneNumber cashbackBalance')
    .sort({ purchaseDate: -1 });

    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.purchaseAmount, 0);
    const totalCashback = purchases.reduce((sum, purchase) => sum + purchase.cashbackAmount, 0);

    res.status(200).json({
      success: true,
      customer,
      purchases,
      summary: {
        totalPurchases,
        totalCashback,
        purchaseCount: purchases.length
      }
    });
  } catch (err) {
    console.error('خطأ في جلب مشتريات العميل:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب مشتريات العميل',
      error: err.message
    });
  }
};

// حذف مشترى (تعطيل)
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.userId;

    const purchase = await Purchase.findOne({ 
      _id: id, 
      storeId 
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'المشترى غير موجود'
      });
    }

    // إعادة خصم الكاش باك من رصيد العميل
    const customer = await Customer.findById(purchase.customerId);
    if (customer) {
      customer.cashbackBalance -= purchase.cashbackAmount;
      await customer.save();
    }

    // تعطيل المشترى
    purchase.isActive = false;
    await purchase.save();

    res.status(200).json({
      success: true,
      message: 'تم حذف المشترى بنجاح'
    });
  } catch (err) {
    console.error('خطأ في حذف المشترى:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف المشترى',
      error: err.message
    });
  }
};

// إحصائيات المشتريات
export const getPurchaseStats = async (req, res) => {
  try {
    const storeId = req.user.userId;
    const { period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'month') {
      dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (period === 'year') {
      dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
    }

    const purchases = await Purchase.find({ 
      storeId, 
      isActive: true,
      purchaseDate: dateFilter
    });

    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.purchaseAmount, 0);
    const totalCashback = purchases.reduce((sum, purchase) => sum + purchase.cashbackAmount, 0);
    const uniqueCustomers = new Set(purchases.map(p => p.customerId.toString())).size;

    res.status(200).json({
      success: true,
      stats: {
        totalPurchases,
        totalCashback,
        purchaseCount: purchases.length,
        uniqueCustomers,
        averagePurchase: purchases.length > 0 ? totalPurchases / purchases.length : 0
      }
    });
  } catch (err) {
    console.error('خطأ في جلب إحصائيات المشتريات:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات',
      error: err.message
    });
  }
};

// إحصائيات العميل المحدد
export const getCustomerStats = async (req, res) => {
  try {
    const { customerPhone } = req.query;
    const storeId = req.user.userId;

    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'رقم هاتف العميل مطلوب'
      });
    }

    // البحث عن العميل
    const customer = await Customer.findOne({ 
      phoneNumber: customerPhone, 
      storeId,
      isActive: true 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // جلب جميع مشتريات العميل
    const purchases = await Purchase.find({ 
      customerId: customer._id, 
      storeId,
      isActive: true 
    }).sort({ purchaseDate: -1 });

    // حساب الإحصائيات
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.purchaseAmount, 0);
    const totalCashback = purchases.reduce((sum, purchase) => sum + purchase.cashbackAmount, 0);
    const purchaseCount = purchases.length;
    const averagePurchase = purchaseCount > 0 ? totalPurchases / purchaseCount : 0;

    // آخر مشترى
    const lastPurchase = purchases.length > 0 ? purchases[0] : null;

    res.status(200).json({
      success: true,
      customerStats: {
        totalPurchases,
        totalCashback,
        purchaseCount,
        averagePurchase,
        lastPurchaseDate: lastPurchase ? lastPurchase.purchaseDate : null,
        customerName: customer.name,
        customerPhone: customer.phoneNumber,
        currentCashbackBalance: customer.cashbackBalance
      }
    });
  } catch (err) {
    console.error('خطأ في جلب إحصائيات العميل:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إحصائيات العميل',
      error: err.message
    });
  }
}; 