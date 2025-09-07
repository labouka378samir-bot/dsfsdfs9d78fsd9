import { useApp } from '../contexts/AppContext';

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.cart': 'Cart',
    'nav.orders': 'My Orders',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.search': 'Search products...',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.total': 'Total',
    'common.subtotal': 'Subtotal',
    'common.tax': 'Tax',
    'common.add_to_cart': 'Add to Cart',
    'common.buy_now': 'Buy Now',
    'common.continue': 'Continue',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.refresh': 'Refresh',
    'common.update': 'Update',
    'common.create': 'Create',
    'common.remove': 'Remove',
    'common.clear': 'Clear',
    
    // Product
    'product.duration': 'Duration',
    'product.days': 'days',
    'product.day': 'day',
    'product.month': 'month',
    'product.months': 'months',
    'product.year': 'year',
    'product.years': 'years',
    'product.activation_instructions': 'Activation Instructions',
    'product.out_of_stock': 'Out of Stock',
    'product.in_stock': 'In Stock',
    'product.limited_stock': 'Limited Stock',
    'product.new': 'New',
    'product.hot': 'Hot',
    'product.best_value': 'Best Value',
    'product.popular': 'Popular',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    'cart.clear': 'Clear Cart',
    'cart.remove': 'Remove',
    'cart.update': 'Update',
    'cart.item_added': 'Item added to cart',
    'cart.item_removed': 'Item removed from cart',
    'cart.cart_cleared': 'Cart cleared',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.no_orders': 'No orders found',
    'orders.order_number': 'Order #',
    'orders.date': 'Date',
    'orders.status': 'Status',
    'orders.amount': 'Amount',
    'orders.view_details': 'View Details',
    'orders.download_receipt': 'Download Receipt',
    'orders.track_order': 'Track Order',
    'orders.reorder': 'Reorder',
    
    // Payment
    'payment.method': 'Payment Method',
    'payment.paypal': 'PayPal',
    'payment.crypto': 'Cryptocurrency',
    'payment.edahabia': 'Edahabia / CIB',
    'payment.success': 'Payment Successful!',
    'payment.failed': 'Payment Failed',
    'payment.processing': 'Processing Payment...',
    'payment.secure': 'Secure Payment',
    'payment.encrypted': 'Encrypted Transaction',
    'payment.verified': 'Verified Merchant',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.username': 'Username',
    'auth.phone': 'Phone Number',
    'auth.full_name': 'Full Name',
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.forgot_password': 'Forgot Password?',
    'auth.reset_password': 'Reset Password',
    'auth.create_account': 'Create Account',
    'auth.already_have_account': 'Already have an account?',
    'auth.no_account': "Don't have an account?",
    'auth.terms_agree': 'I agree to the Terms and Conditions',
    'auth.privacy_agree': 'I agree to the Privacy Policy',
    'auth.newsletter': 'Subscribe to newsletter',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.categories': 'Categories',
    'admin.settings': 'Settings',
    'admin.codes': 'Codes',
    'admin.payments': 'Payments',
    'admin.users': 'Users',
    'admin.analytics': 'Analytics',
    'admin.reports': 'Reports',
    'admin.notifications': 'Notifications',
    
    // Status
    'status.pending': 'Pending',
    'status.paid': 'Paid',
    'status.failed': 'Failed',
    'status.delivered': 'Delivered',
    'status.refunded': 'Refunded',
    'status.processing': 'Processing',
    'status.shipped': 'Shipped',
    'status.cancelled': 'Cancelled',
    'status.completed': 'Completed',
    
    // Contact
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email Support',
    'contact.telegram': 'Telegram',
    'contact.instagram': 'Instagram',
    'contact.phone': 'Phone',
    'contact.address': 'Address',
    
    // Footer
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.support': 'Support',
    'footer.about': 'About Us',
    'footer.faq': 'FAQ',
    'footer.help': 'Help Center',
    'footer.contact': 'Contact Us',
    'footer.careers': 'Careers',
    
    // Error Messages
    'error.network': 'Network error. Please check your connection.',
    'error.server': 'Server error. Please try again later.',
    'error.validation': 'Please check your input and try again.',
    'error.unauthorized': 'You are not authorized to perform this action.',
    'error.not_found': 'The requested resource was not found.',
    'error.generic': 'An error occurred. Please try again.',
    
    // Success Messages
    'success.saved': 'Changes saved successfully!',
    'success.created': 'Created successfully!',
    'success.updated': 'Updated successfully!',
    'success.deleted': 'Deleted successfully!',
    'success.sent': 'Sent successfully!',
    'success.uploaded': 'Uploaded successfully!',
  },
  
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.cart': 'السلة',
    'nav.orders': 'طلباتي',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.search': 'البحث عن المنتجات...',
    'common.price': 'السعر',
    'common.quantity': 'الكمية',
    'common.total': 'المجموع',
    'common.subtotal': 'المجموع الفرعي',
    'common.tax': 'الضريبة',
    'common.add_to_cart': 'أضف إلى السلة',
    'common.buy_now': 'اشتر الآن',
    'common.continue': 'متابعة',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.close': 'إغلاق',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.refresh': 'تحديث',
    'common.update': 'تحديث',
    'common.create': 'إنشاء',
    'common.remove': 'إزالة',
    'common.clear': 'مسح',
    
    // Product
    'product.duration': 'المدة',
    'product.days': 'أيام',
    'product.day': 'يوم',
    'product.month': 'شهر',
    'product.months': 'أشهر',
    'product.year': 'سنة',
    'product.years': 'سنوات',
    'product.activation_instructions': 'تعليمات التفعيل',
    'product.out_of_stock': 'نفد المخزون',
    'product.in_stock': 'متوفر',
    'product.limited_stock': 'مخزون محدود',
    'product.new': 'جديد',
    'product.hot': 'مميز',
    'product.best_value': 'أفضل قيمة',
    'product.popular': 'شائع',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة',
    'cart.checkout': 'الدفع',
    'cart.clear': 'إفراغ السلة',
    'cart.remove': 'إزالة',
    'cart.update': 'تحديث',
    'cart.item_added': 'تم إضافة العنصر إلى السلة',
    'cart.item_removed': 'تم إزالة العنصر من السلة',
    'cart.cart_cleared': 'تم إفراغ السلة',
    
    // Orders
    'orders.title': 'طلباتي',
    'orders.no_orders': 'لا توجد طلبات',
    'orders.order_number': 'رقم الطلب #',
    'orders.date': 'التاريخ',
    'orders.status': 'الحالة',
    'orders.amount': 'المبلغ',
    'orders.view_details': 'عرض التفاصيل',
    'orders.download_receipt': 'تحميل الإيصال',
    'orders.track_order': 'تتبع الطلب',
    'orders.reorder': 'إعادة الطلب',
    
    // Payment
    'payment.method': 'طريقة الدفع',
    'payment.paypal': 'باي بال',
    'payment.crypto': 'العملة المشفرة',
    'payment.edahabia': 'الذهبية / CIB',
    'payment.success': 'تم الدفع بنجاح!',
    'payment.failed': 'فشل الدفع',
    'payment.processing': 'جاري معالجة الدفع...',
    'payment.secure': 'دفع آمن',
    'payment.encrypted': 'معاملة مشفرة',
    'payment.verified': 'تاجر موثق',
    
    // Auth
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirm_password': 'تأكيد كلمة المرور',
    'auth.username': 'اسم المستخدم',
    'auth.phone': 'رقم الهاتف',
    'auth.full_name': 'الاسم الكامل',
    'auth.signin': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.forgot_password': 'نسيت كلمة المرور؟',
    'auth.reset_password': 'إعادة تعيين كلمة المرور',
    'auth.create_account': 'إنشاء حساب',
    'auth.already_have_account': 'لديك حساب بالفعل؟',
    'auth.no_account': 'ليس لديك حساب؟',
    'auth.terms_agree': 'أوافق على الشروط والأحكام',
    'auth.privacy_agree': 'أوافق على سياسة الخصوصية',
    'auth.newsletter': 'الاشتراك في النشرة الإخبارية',
    
    // Admin
    'admin.dashboard': 'لوحة الإدارة',
    'admin.products': 'المنتجات',
    'admin.orders': 'الطلبات',
    'admin.categories': 'الفئات',
    'admin.settings': 'الإعدادات',
    'admin.codes': 'الأكواد',
    'admin.payments': 'المدفوعات',
    'admin.users': 'المستخدمون',
    'admin.analytics': 'التحليلات',
    'admin.reports': 'التقارير',
    'admin.notifications': 'الإشعارات',
    
    // Status
    'status.pending': 'قيد الانتظار',
    'status.paid': 'مدفوع',
    'status.failed': 'فشل',
    'status.delivered': 'تم التسليم',
    'status.refunded': 'مسترد',
    'status.processing': 'قيد المعالجة',
    'status.shipped': 'تم الشحن',
    'status.cancelled': 'ملغي',
    'status.completed': 'مكتمل',
    
    // Contact
    'contact.whatsapp': 'واتساب',
    'contact.email': 'دعم البريد الإلكتروني',
    'contact.telegram': 'تليجرام',
    'contact.instagram': 'انستجرام',
    'contact.phone': 'الهاتف',
    'contact.address': 'العنوان',
    
    // Footer
    'footer.terms': 'الشروط والأحكام',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.support': 'الدعم',
    'footer.about': 'من نحن',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.help': 'مركز المساعدة',
    'footer.contact': 'اتصل بنا',
    'footer.careers': 'الوظائف',
    
    // Error Messages
    'error.network': 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
    'error.server': 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    'error.validation': 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
    'error.unauthorized': 'غير مخول لك تنفيذ هذا الإجراء.',
    'error.not_found': 'المورد المطلوب غير موجود.',
    'error.generic': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    
    // Success Messages
    'success.saved': 'تم حفظ التغييرات بنجاح!',
    'success.created': 'تم الإنشاء بنجاح!',
    'success.updated': 'تم التحديث بنجاح!',
    'success.deleted': 'تم الحذف بنجاح!',
    'success.sent': 'تم الإرسال بنجاح!',
    'success.uploaded': 'تم الرفع بنجاح!',
  },
};

export function useTranslation() {
  const { state } = useApp();
  
  const t = (key: string): string => {
    return translations[state.language]?.[key] || translations.en[key] || key;
  };
  
  const getTranslation = (translations: Array<{ language: string; [key: string]: any }>, field: string) => {
    const translation = translations.find(t => t.language === state.language);
    return translation?.[field] || translations.find(t => t.language === 'en')?.[field] || '';
  };
  
  return { t, getTranslation };
}