'use client';

import React, { useEffect } from 'react';
import { FileText, Download, Printer } from 'lucide-react';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    taxId: string;
  };
  to: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  items: {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
  isRTL?: boolean;
  onClose?: () => void;
}

export default function InvoiceTemplate({ data, isRTL = false, onClose }: InvoiceTemplateProps) {
  useEffect(() => {
    // Force white background for professional printing
    document.body.style.backgroundColor = 'white';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Logic to download PDF
    console.log('Downloading invoice...');
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open('', '_blank', 'width=1200,height=800');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${isRTL ? 'ar' : 'fr'}" dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture - ${data.invoiceNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white text-gray-900">
          ${getInvoiceHTML()}
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const getInvoiceHTML = () => {
    const thankYouMessage = isRTL ? 'شكراً لاختياركم خدماتنا' : 'Merci d\'avoir choisi nos services';
    const contactMessage = isRTL ? 'للاستفسارات، يرجى الاتصال بنا على:' : 'Pour toute question, veuillez nous contacter au:';
    
    return `
      <div class="min-h-screen bg-white p-8" dir="${isRTL ? 'rtl' : 'ltr'}">
        <!-- Company Header -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <div class="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-2xl">A</span>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            ${isRTL ? 'الشركة الجزائرية للحوم الحمراء' : 'Société Algérienne des Viandes Rouges'}
          </h1>
          <p class="text-gray-600">
            ${isRTL ? 'ALVIAR - شركة رائدة في مجال إنتاج وتوزيع اللحوم الحمراء' : 'ALVIAR - Leading company in red meat production and distribution'}
          </p>
        </div>

        <!-- Invoice Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- From -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              ${isRTL ? 'من:' : 'De:'}
            </h3>
            <div class="space-y-2">
              <p class="font-semibold text-gray-900">${data.from.name}</p>
              <p class="text-gray-600">${data.from.address}</p>
              <p class="text-gray-600">${data.from.city}</p>
              <p class="text-gray-600">${isRTL ? 'الهاتف:' : 'Tél:'} ${data.from.phone}</p>
              <p class="text-gray-600">Email: ${data.from.email}</p>
              <p class="text-gray-600">${isRTL ? 'رقم الضريبة:' : 'N° Fiscal:'} ${data.from.taxId}</p>
            </div>
          </div>

          <!-- To -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              ${isRTL ? 'إلى:' : 'À:'}
            </h3>
            <div class="space-y-2">
              <p class="font-semibold text-gray-900">${data.to.name}</p>
              <p class="text-gray-600">${data.to.address}</p>
              <p class="text-gray-600">${data.to.city}</p>
              <p class="text-gray-600">${isRTL ? 'الهاتف:' : 'Tél:'} ${data.to.phone}</p>
              <p class="text-gray-600">Email: ${data.to.email}</p>
            </div>
          </div>
        </div>

        <!-- Invoice Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p class="text-gray-600">${isRTL ? 'رقم الفاتورة:' : 'N° Facture:'}</p>
            <p class="font-semibold text-gray-900">${data.invoiceNumber}</p>
          </div>
          <div>
            <p class="text-gray-600">${isRTL ? 'تاريخ الفاتورة:' : 'Date Facture:'}</p>
            <p class="font-semibold text-gray-900">${data.date}</p>
          </div>
          <div>
            <p class="text-gray-600">${isRTL ? 'تاريخ الاستحقاق:' : 'Date Échéance:'}</p>
            <p class="font-semibold text-gray-900">${data.dueDate}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8">
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                  ${isRTL ? 'الوصف' : 'Description'}
                </th>
                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  ${isRTL ? 'الكمية' : 'Quantité'}
                </th>
                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  ${isRTL ? 'الوحدة' : 'Unité'}
                </th>
                <th class="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                  ${isRTL ? 'سعر الوحدة' : 'Prix Unitaire'}
                </th>
                <th class="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                  ${isRTL ? 'المجموع' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, index) => `
                <tr class="hover:bg-gray-50">
                  <td class="border border-gray-300 px-4 py-3 text-gray-900">
                    ${item.description}
                  </td>
                  <td class="border border-gray-300 px-4 py-3 text-center text-gray-900">
                    ${item.quantity.toLocaleString()}
                  </td>
                  <td class="border border-gray-300 px-4 py-3 text-center text-gray-900">
                    ${item.unit}
                  </td>
                  <td class="border border-gray-300 px-4 py-3 text-right text-gray-900">
                    ${new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0
                    }).format(item.unitPrice)}
                  </td>
                  <td class="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                    ${new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0
                    }).format(item.total)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="flex justify-end mb-8">
          <div class="w-80">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">${isRTL ? 'المجموع الفرعي:' : 'Sous-total:'}</span>
                <span class="text-gray-900">
                  ${new Intl.NumberFormat('fr-DZ', {
                    style: 'currency',
                    currency: 'DZD',
                    minimumFractionDigits: 0
                  }).format(data.subtotal)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">${isRTL ? 'الضريبة (19%):' : 'TVA (19%):'}</span>
                <span class="text-gray-900">
                  ${new Intl.NumberFormat('fr-DZ', {
                    style: 'currency',
                    currency: 'DZD',
                    minimumFractionDigits: 0
                  }).format(data.tax)}
                </span>
              </div>
              <div class="flex justify-between border-t border-gray-300 pt-2">
                <span class="text-lg font-semibold text-gray-900">${isRTL ? 'المجموع الإجمالي:' : 'Total:'}</span>
                <span class="text-lg font-semibold text-gray-900">
                  ${new Intl.NumberFormat('fr-DZ', {
                    style: 'currency',
                    currency: 'DZD',
                    minimumFractionDigits: 0
                  }).format(data.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        ${data.notes ? `
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              ${isRTL ? 'ملاحظات:' : 'Notes:'}
            </h3>
            <p class="text-gray-600">${data.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="text-center text-sm text-gray-600 border-t border-gray-300 pt-6">
          <p>${thankYouMessage}</p>
          <p class="mt-2">
            ${contactMessage} ${data.from.phone}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="no-print fixed top-4 right-4 flex space-x-2">
          <button onclick="window.print()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ${isRTL ? 'طباعة' : 'Imprimer'}
          </button>
          <button onclick="window.close()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            ${isRTL ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold theme-text-primary">
            {isRTL ? 'فاتورة' : 'Facture'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isRTL ? 'فتح في نافذة جديدة' : 'Ouvrir dans un nouvel onglet'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              {isRTL ? 'تحميل' : 'Télécharger'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary"
              >
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Company Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold theme-text-primary mb-2">
              {isRTL ? 'الشركة الجزائرية للحوم الحمراء' : 'Société Algérienne des Viandes Rouges'}
            </h1>
            <p className="text-sm theme-text-secondary">
              {isRTL ? 'ALVIAR - شركة رائدة في مجال إنتاج وتوزيع اللحوم الحمراء' : 'ALVIAR - Leading company in red meat production and distribution'}
            </p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4">
                {isRTL ? 'من:' : 'De:'}
              </h3>
              <div className="space-y-2">
                <p className="font-semibold theme-text-primary">{data.from.name}</p>
                <p className="theme-text-secondary">{data.from.address}</p>
                <p className="theme-text-secondary">{data.from.city}</p>
                <p className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Tél:'} {data.from.phone}</p>
                <p className="theme-text-secondary">Email: {data.from.email}</p>
                <p className="theme-text-secondary">{isRTL ? 'رقم الضريبة:' : 'N° Fiscal:'} {data.from.taxId}</p>
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4">
                {isRTL ? 'إلى:' : 'À:'}
              </h3>
              <div className="space-y-2">
                <p className="font-semibold theme-text-primary">{data.to.name}</p>
                <p className="theme-text-secondary">{data.to.address}</p>
                <p className="theme-text-secondary">{data.to.city}</p>
                <p className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Tél:'} {data.to.phone}</p>
                <p className="theme-text-secondary">Email: {data.to.email}</p>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="theme-text-secondary">{isRTL ? 'رقم الفاتورة:' : 'N° Facture:'}</p>
              <p className="font-semibold theme-text-primary">{data.invoiceNumber}</p>
            </div>
            <div>
              <p className="theme-text-secondary">{isRTL ? 'تاريخ الفاتورة:' : 'Date Facture:'}</p>
              <p className="font-semibold theme-text-primary">{data.date}</p>
            </div>
            <div>
              <p className="theme-text-secondary">{isRTL ? 'تاريخ الاستحقاق:' : 'Date Échéance:'}</p>
              <p className="font-semibold theme-text-primary">{data.dueDate}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold theme-text-primary">
                    {isRTL ? 'الوصف' : 'Description'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold theme-text-primary">
                    {isRTL ? 'الكمية' : 'Quantité'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold theme-text-primary">
                    {isRTL ? 'الوحدة' : 'Unité'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold theme-text-primary">
                    {isRTL ? 'سعر الوحدة' : 'Prix Unitaire'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold theme-text-primary">
                    {isRTL ? 'المجموع' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 theme-text-primary">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center theme-text-primary">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center theme-text-primary">
                      {item.unit}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right theme-text-primary">
                      {new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD',
                        minimumFractionDigits: 0
                      }).format(item.unitPrice)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold theme-text-primary">
                      {new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD',
                        minimumFractionDigits: 0
                      }).format(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'المجموع الفرعي:' : 'Sous-total:'}</span>
                  <span className="theme-text-primary">
                    {new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0
                    }).format(data.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الضريبة (19%):' : 'TVA (19%):'}</span>
                  <span className="theme-text-primary">
                    {new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0
                    }).format(data.tax)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span className="text-lg font-semibold theme-text-primary">{isRTL ? 'المجموع الإجمالي:' : 'Total:'}</span>
                  <span className="text-lg font-semibold theme-text-primary">
                    {new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0
                    }).format(data.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold theme-text-primary mb-2">
                {isRTL ? 'ملاحظات:' : 'Notes:'}
              </h3>
              <p className="theme-text-secondary">{data.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm theme-text-secondary border-t border-gray-300 dark:border-gray-600 pt-6">
            <p>{isRTL ? 'شكراً لاختياركم خدماتنا' : 'Merci d\'avoir choisi nos services'}</p>
            <p className="mt-2">
              {isRTL ? 'للاستفسارات، يرجى الاتصال بنا على:' : 'Pour toute question, veuillez nous contacter au:'} {data.from.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
