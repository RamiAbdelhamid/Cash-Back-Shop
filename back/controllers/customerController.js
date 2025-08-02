import Customer from '../models/Customer.js';

// إضافة عميل جديد
export const addCustomer = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const storeId = req.user.userId;

    // تنظيف رقم الهاتف - يقبل أي رقم هاتف
    let cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');

    // التحقق من وجود العميل بنفس رقم الهاتف
    const existingCustomer = await Customer.findOne({ 
      phoneNumber: cleanPhoneNumber, 
      storeId 
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مسجل مسبقاً'
      });
    }

    // إنشاء عميل جديد
    const customer = new Customer({
      name: name || '',
      phoneNumber: cleanPhoneNumber,
      storeId
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'تم إضافة العميل بنجاح',
      customer
    });
  } catch (err) {
    console.error('خطأ في إضافة العميل:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في إضافة العميل',
      error: err.message
    });
  }
};

// الحصول على جميع عملاء المتجر
export const getCustomers = async (req, res) => {
  try {
    const storeId = req.user.userId;
    const customers = await Customer.find({ 
      storeId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customers
    });
  } catch (err) {
    console.error('خطأ في جلب العملاء:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب العملاء',
      error: err.message
    });
  }
};

// تحديث بيانات العميل
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cashbackBalance } = req.body; // إزالة phoneNumber من التحديث
    const storeId = req.user.userId;

    // التحقق من وجود العميل
    const customer = await Customer.findOne({ 
      _id: id, 
      storeId 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // تحديث البيانات (فقط الاسم ورصيد الكاش باك)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (cashbackBalance !== undefined) updateData.cashbackBalance = cashbackBalance;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات العميل بنجاح',
      customer: updatedCustomer
    });
  } catch (err) {
    console.error('خطأ في تحديث العميل:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث بيانات العميل',
      error: err.message
    });
  }
};

// حذف العميل (تعطيل)
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.userId;

    const customer = await Customer.findOne({ 
      _id: id, 
      storeId 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // تعطيل العميل بدلاً من حذفه
    customer.isActive = false;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'تم حذف العميل بنجاح'
    });
  } catch (err) {
    console.error('خطأ في حذف العميل:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف العميل',
      error: err.message
    });
  }
};

// البحث عن عميل برقم الهاتف
export const searchCustomer = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    const storeId = req.user.userId;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }

    // تنظيف رقم الهاتف - يقبل أي رقم هاتف
    let cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');

    const customer = await Customer.findOne({ 
      phoneNumber: cleanPhoneNumber, 
      storeId,
      isActive: true 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      customer
    });
  } catch (err) {
    console.error('خطأ في البحث عن العميل:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في البحث عن العميل',
      error: err.message
    });
  }
}; 

// البحث عن رصيد الكاش باك للعميل في متجر محدد
export const getCashbackBalance = async (req, res) => {
  try {
    const { storeId, phoneNumber } = req.query;

    if (!storeId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'معرف المتجر ورقم الهاتف مطلوبان'
      });
    }

    // تنظيف رقم الهاتف - يقبل أي رقم هاتف
    let cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');

    const customer = await Customer.findOne({ 
      phoneNumber: cleanPhoneNumber, 
      storeId,
      isActive: true 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على رصيد كاش باك لهذا العميل في المتجر المحدد'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        storeId: customer.storeId,
        phoneNumber: customer.phoneNumber,
        balance: customer.cashbackBalance,
        customerName: customer.name
      }
    });
  } catch (err) {
    console.error('خطأ في البحث عن رصيد الكاش باك:', err);
    res.status(500).json({
      success: false,
      message: 'فشل في البحث عن رصيد الكاش باك',
      error: err.message
    });
  }
}; 