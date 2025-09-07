import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAndConditions({ isOpen, onClose }: TermsAndConditionsProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {state.language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {state.language === 'ar' ? (
            <>
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. مقدمة</h3>
                <p className="text-gray-700 leading-relaxed">
                  مرحباً بكم في متجر ATHMANEBZN للمنتجات الرقمية. باستخدام موقعنا وخدماتنا، فإنكم توافقون على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل إجراء أي عملية شراء.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. المنتجات والخدمات</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>نحن نقدم منتجات رقمية حصرياً مثل اشتراكات البث، حسابات الألعاب، وتراخيص البرمجيات</li>
                  <li>جميع المنتجات أصلية ومضمونة 100%</li>
                  <li>التسليم فوري أو خلال 24 ساعة كحد أقصى</li>
                  <li>نحتفظ بالحق في تعديل الأسعار والتوفر دون إشعار مسبق</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. الدفع والفوترة</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>نقبل الدفع عبر PayPal، العملات المشفرة (USDT)، والبطاقات الجزائرية</li>
                  <li>جميع الأسعار نهائية وتشمل أي رسوم إضافية</li>
                  <li>الدفع مطلوب بالكامل قبل التسليم</li>
                  <li>لا نحتفظ بمعلومات الدفع الخاصة بكم</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. التسليم</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>التسليم الفوري للمنتجات التلقائية</li>
                  <li>التسليم خلال 1-24 ساعة للمنتجات اليدوية</li>
                  <li>سيتم إرسال تفاصيل المنتج عبر البريد الإلكتروني المسجل</li>
                  <li>يرجى التحقق من صندوق الرسائل غير المرغوب فيها</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5. الضمان والاستبدال</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>ضمان كامل على جميع المنتجات طوال مدة الاشتراك</li>
                  <li>استبدال مجاني في حالة عدم عمل المنتج</li>
                  <li>في حالة توقف المنتج خلال المدة المحددة، يتم الاستبدال فوراً</li>
                  <li>لا يمكن استرداد الأموال بعد التسليم الناجح</li>
                  <li>يجب الإبلاغ عن أي مشاكل خلال 48 ساعة من التسليم</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6. المسؤوليات</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>العميل مسؤول عن حماية معلومات الحساب المستلم</li>
                  <li>يُمنع مشاركة أو بيع المنتجات المشتراة</li>
                  <li>نحن غير مسؤولين عن سوء الاستخدام من قبل العميل</li>
                  <li>العميل مسؤول عن التحقق من توافق المنتج مع احتياجاته</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7. الخصوصية والأمان</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>نحن نحترم خصوصيتكم ونحمي بياناتكم الشخصية</li>
                  <li>لا نشارك معلوماتكم مع أطراف ثالثة</li>
                  <li>جميع المعاملات مشفرة وآمنة</li>
                  <li>يمكنكم طلب حذف بياناتكم في أي وقت</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8. التواصل والدعم</h3>
                <p className="text-gray-700 leading-relaxed">
                  للحصول على الدعم أو لأي استفسارات، يرجى التواصل معنا عبر WhatsApp على الرقم: +213 96 35 47 92
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9. تعديل الشروط</h3>
                <p className="text-gray-700 leading-relaxed">
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار العملاء بأي تغييرات مهمة عبر الموقع أو البريد الإلكتروني.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10. القانون المعمول به</h3>
                <p className="text-gray-700 leading-relaxed">
                  تخضع هذه الشروط للقوانين الجزائرية والدولية المعمول بها في مجال التجارة الإلكترونية.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h3>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to ATHMANEBZN Digital Products Store. By using our website and services, you agree to comply with these terms and conditions. Please read them carefully before making any purchase.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Products and Services</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>We provide exclusively digital products such as streaming subscriptions, gaming accounts, and software licenses</li>
                  <li>All products are 100% original and guaranteed</li>
                  <li>Instant delivery or within 24 hours maximum</li>
                  <li>We reserve the right to modify prices and availability without prior notice</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Payment and Billing</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>We accept payment via PayPal, Cryptocurrency (USDT), and Algerian bank cards</li>
                  <li>All prices are final and include any additional fees</li>
                  <li>Full payment is required before delivery</li>
                  <li>We do not store your payment information</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Delivery</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Instant delivery for automatic products</li>
                  <li>Delivery within 1-24 hours for manual products</li>
                  <li>Product details will be sent to your registered email</li>
                  <li>Please check your spam folder</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Warranty and Replacement</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Full warranty on all products for the entire subscription period</li>
                  <li>Free replacement if the product doesn't work</li>
                  <li>If the product stops working during the specified period, immediate replacement is provided</li>
                  <li>No refunds after successful delivery</li>
                  <li>Any issues must be reported within 48 hours of delivery</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Responsibilities</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Customer is responsible for protecting received account information</li>
                  <li>Sharing or reselling purchased products is prohibited</li>
                  <li>We are not responsible for customer misuse</li>
                  <li>Customer is responsible for verifying product compatibility with their needs</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy and Security</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>We respect your privacy and protect your personal data</li>
                  <li>We do not share your information with third parties</li>
                  <li>All transactions are encrypted and secure</li>
                  <li>You can request deletion of your data at any time</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Contact and Support</h3>
                <p className="text-gray-700 leading-relaxed">
                  For support or any inquiries, please contact us via WhatsApp: +213 96 35 47 92
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Terms Modification</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. Customers will be notified of any important changes via the website or email.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Applicable Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These terms are subject to Algerian and international laws applicable in the field of e-commerce.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            {state.language === 'ar' 
              ? 'آخر تحديث: ديسمبر 2024 - متجر ATHMANEBZN للمنتجات الرقمية'
              : 'Last updated: December 2024 - ATHMANEBZN Digital Products Store'
            }
          </p>
        </div>
      </div>
    </div>
  );
}