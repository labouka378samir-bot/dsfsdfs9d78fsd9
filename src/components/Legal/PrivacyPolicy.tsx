import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${state.language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {state.language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
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
                  في متجر ATHMANEBZN، نحن ملتزمون بحماية خصوصيتكم وأمان بياناتكم الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتكم عند استخدام خدماتنا.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. المعلومات التي نجمعها</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li><strong>معلومات الحساب:</strong> البريد الإلكتروني، رقم الهاتف، الاسم</li>
                  <li><strong>معلومات الطلب:</strong> تفاصيل المنتجات المشتراة، تاريخ الشراء</li>
                  <li><strong>معلومات الدفع:</strong> نحن لا نحتفظ بتفاصيل بطاقات الائتمان أو معلومات الدفع</li>
                  <li><strong>معلومات تقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. كيفية استخدام المعلومات</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>معالجة وتنفيذ طلباتكم</li>
                  <li>تقديم الدعم الفني والعملاء</li>
                  <li>إرسال تحديثات حول طلباتكم</li>
                  <li>تحسين خدماتنا وتجربة المستخدم</li>
                  <li>منع الاحتيال وضمان الأمان</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. مشاركة المعلومات</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  نحن لا نبيع أو نؤجر أو نشارك معلوماتكم الشخصية مع أطراف ثالثة، باستثناء:
                </p>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>مقدمي خدمات الدفع (PayPal، مقدمي العملات المشفرة)</li>
                  <li>عند الطلب من السلطات القانونية المختصة</li>
                  <li>لحماية حقوقنا أو سلامة المستخدمين</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5. أمان البيانات</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>تشفير SSL لجميع المعاملات</li>
                  <li>خوادم آمنة ومحمية</li>
                  <li>وصول محدود للموظفين المخولين فقط</li>
                  <li>نسخ احتياطية منتظمة ومشفرة</li>
                  <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6. ملفات تعريف الارتباط (Cookies)</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتكم:
                </p>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>حفظ تفضيلات اللغة والعملة</li>
                  <li>تذكر عناصر سلة التسوق</li>
                  <li>تحليل استخدام الموقع</li>
                  <li>تحسين الأداء والأمان</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7. حقوقكم</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li><strong>الوصول:</strong> طلب نسخة من بياناتكم الشخصية</li>
                  <li><strong>التصحيح:</strong> تحديث أو تصحيح معلوماتكم</li>
                  <li><strong>الحذف:</strong> طلب حذف بياناتكم (مع مراعاة المتطلبات القانونية)</li>
                  <li><strong>النقل:</strong> الحصول على بياناتكم بصيغة قابلة للقراءة</li>
                  <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتكم في حالات معينة</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8. الاحتفاظ بالبيانات</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>نحتفظ بمعلومات الحساب طالما كان الحساب نشطاً</li>
                  <li>سجلات المعاملات تُحفظ لمدة 7 سنوات للأغراض القانونية</li>
                  <li>البيانات التقنية تُحذف بعد 2 سنة من عدم النشاط</li>
                  <li>يمكنكم طلب حذف بياناتكم في أي وقت</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9. حماية الأطفال</h3>
                <p className="text-gray-700 leading-relaxed">
                  خدماتنا مخصصة للأشخاص البالغين (18 سنة فأكثر). نحن لا نجمع عمداً معلومات شخصية من الأطفال دون سن 18 عاماً.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10. التحديثات</h3>
                <p className="text-gray-700 leading-relaxed">
                  قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم إشعاركم بأي تغييرات مهمة عبر البريد الإلكتروني أو إشعار على الموقع.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11. التواصل</h3>
                <p className="text-gray-700 leading-relaxed">
                  لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقكم، يرجى التواصل معنا عبر WhatsApp: +213 96 35 47 92
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h3>
                <p className="text-gray-700 leading-relaxed">
                  At ATHMANEBZN Store, we are committed to protecting your privacy and the security of your personal data. This policy explains how we collect, use, and protect your information when using our services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li><strong>Account Information:</strong> Email address, phone number, name</li>
                  <li><strong>Order Information:</strong> Details of purchased products, purchase date</li>
                  <li><strong>Payment Information:</strong> We do not store credit card details or payment information</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, operating system</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Information</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Process and fulfill your orders</li>
                  <li>Provide technical and customer support</li>
                  <li>Send updates about your orders</li>
                  <li>Improve our services and user experience</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We do not sell, rent, or share your personal information with third parties, except:
                </p>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Payment service providers (PayPal, cryptocurrency providers)</li>
                  <li>When required by competent legal authorities</li>
                  <li>To protect our rights or user safety</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>SSL encryption for all transactions</li>
                  <li>Secure and protected servers</li>
                  <li>Limited access to authorized personnel only</li>
                  <li>Regular encrypted backups</li>
                  <li>Continuous monitoring for suspicious activities</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We use cookies to improve your experience:
                </p>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Save language and currency preferences</li>
                  <li>Remember shopping cart items</li>
                  <li>Analyze website usage</li>
                  <li>Improve performance and security</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct your information</li>
                  <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Obtain your data in a readable format</li>
                  <li><strong>Objection:</strong> Object to processing of your data in certain cases</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h3>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>We retain account information as long as the account is active</li>
                  <li>Transaction records are kept for 7 years for legal purposes</li>
                  <li>Technical data is deleted after 2 years of inactivity</li>
                  <li>You can request deletion of your data at any time</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Children's Protection</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our services are intended for adults (18 years and older). We do not knowingly collect personal information from children under 18 years of age.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Updates</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may update this policy from time to time. You will be notified of any important changes via email or website notification.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h3>
                <p className="text-gray-700 leading-relaxed">
                  For any inquiries about the privacy policy or to exercise your rights, please contact us via WhatsApp: +213 96 35 47 92
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