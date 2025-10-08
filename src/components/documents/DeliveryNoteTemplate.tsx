'use client';

import React, { useEffect } from 'react';
import { FileText, Download, Printer, Truck, MapPin, Clock } from 'lucide-react';

interface DeliveryNoteData {
  deliveryNumber: string;
  date: string;
  from: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  to: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  driver: {
    name: string;
    license: string;
    phone: string;
  };
  vehicle: {
    plate: string;
    type: string;
    capacity: number;
  };
  items: {
    description: string;
    quantity: number;
    unit: string;
    batchNumber: string;
    condition: string;
  }[];
  totalQuantity: number;
  notes?: string;
  receivedBy?: {
    name: string;
    signature: string;
    date: string;
  };
}

interface DeliveryNoteTemplateProps {
  data: DeliveryNoteData;
  isRTL?: boolean;
  onClose?: () => void;
}

export default function DeliveryNoteTemplate({ data, isRTL = false, onClose }: DeliveryNoteTemplateProps) {
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
    console.log('Downloading delivery note...');
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
          <title>Bon de Livraison - ${data.deliveryNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white text-gray-900">
          ${getDeliveryNoteHTML()}
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const getDeliveryNoteHTML = () => {
    const deliveryMessage = isRTL ? 'تم التسليم وفقاً للمواصفات المطلوبة' : 'Livraison effectuée selon les spécifications requises';
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

        <!-- Delivery Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- From -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              ${isRTL ? 'من:' : 'De:'}
            </h3>
            <div class="space-y-2">
              <p class="font-semibold text-gray-900">${data.from.name}</p>
              <p class="text-gray-600">${data.from.address}</p>
              <p class="text-gray-600">${data.from.city}</p>
              <p class="text-gray-600">${isRTL ? 'الهاتف:' : 'Tél:'} ${data.from.phone}</p>
              <p class="text-gray-600">Email: ${data.from.email}</p>
            </div>
          </div>

          <!-- To -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
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

        <!-- Transport Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
              </svg>
              ${isRTL ? 'معلومات السائق:' : 'Informations Chauffeur:'}
            </h3>
            <div class="space-y-2">
              <p class="text-gray-600">${isRTL ? 'الاسم:' : 'Nom:'} <span class="font-semibold text-gray-900">${data.driver.name}</span></p>
              <p class="text-gray-600">${isRTL ? 'الرخصة:' : 'Permis:'} <span class="font-semibold text-gray-900">${data.driver.license}</span></p>
              <p class="text-gray-600">${isRTL ? 'الهاتف:' : 'Tél:'} <span class="font-semibold text-gray-900">${data.driver.phone}</span></p>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
              </svg>
              ${isRTL ? 'معلومات المركبة:' : 'Informations Véhicule:'}
            </h3>
            <div class="space-y-2">
              <p class="text-gray-600">${isRTL ? 'اللوحة:' : 'Plaque:'} <span class="font-semibold text-gray-900">${data.vehicle.plate}</span></p>
              <p class="text-gray-600">${isRTL ? 'النوع:' : 'Type:'} <span class="font-semibold text-gray-900">${data.vehicle.type}</span></p>
              <p class="text-gray-600">${isRTL ? 'السعة:' : 'Capacité:'} <span class="font-semibold text-gray-900">${data.vehicle.capacity} kg</span></p>
            </div>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p class="text-gray-600">${isRTL ? 'رقم التسليم:' : 'N° Livraison:'}</p>
            <p class="font-semibold text-gray-900">${data.deliveryNumber}</p>
          </div>
          <div>
            <p class="text-gray-600">${isRTL ? 'تاريخ التسليم:' : 'Date Livraison:'}</p>
            <p class="font-semibold text-gray-900">${data.date}</p>
          </div>
          <div>
            <p class="text-gray-600">${isRTL ? 'الكمية الإجمالية:' : 'Quantité Totale:'}</p>
            <p class="font-semibold text-gray-900">${data.totalQuantity.toLocaleString()} kg</p>
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
                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  ${isRTL ? 'رقم الدفعة' : 'N° Lot'}
                </th>
                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  ${isRTL ? 'الحالة' : 'État'}
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
                  <td class="border border-gray-300 px-4 py-3 text-center text-gray-900">
                    ${item.batchNumber}
                  </td>
                  <td class="border border-gray-300 px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ${item.condition}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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

        <!-- Signature Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              ${isRTL ? 'توقيع السائق:' : 'Signature Chauffeur:'}
            </h3>
            <div class="border-b-2 border-gray-300 pb-2 mb-2">
              <p class="text-gray-600">${data.driver.name}</p>
            </div>
            <p class="text-sm text-gray-600">${data.date}</p>
          </div>

          ${data.receivedBy ? `
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                ${isRTL ? 'توقيع المستلم:' : 'Signature Destinataire:'}
              </h3>
              <div class="border-b-2 border-gray-300 pb-2 mb-2">
                <p class="text-gray-600">${data.receivedBy.name}</p>
              </div>
              <p class="text-sm text-gray-600">${data.receivedBy.date}</p>
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-gray-600 border-t border-gray-300 pt-6">
          <p>${deliveryMessage}</p>
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
            {isRTL ? 'بون التسليم' : 'Bon de Livraison'}
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

        {/* Delivery Note Content */}
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

          {/* Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <MapPin className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                {isRTL ? 'من:' : 'De:'}
              </h3>
              <div className="space-y-2">
                <p className="font-semibold theme-text-primary">{data.from.name}</p>
                <p className="theme-text-secondary">{data.from.address}</p>
                <p className="theme-text-secondary">{data.from.city}</p>
                <p className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Tél:'} {data.from.phone}</p>
                <p className="theme-text-secondary">Email: {data.from.email}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <MapPin className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
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

          {/* Transport Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Truck className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                {isRTL ? 'معلومات السائق:' : 'Informations Chauffeur:'}
              </h3>
              <div className="space-y-2">
                <p className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'} <span className="font-semibold theme-text-primary">{data.driver.name}</span></p>
                <p className="theme-text-secondary">{isRTL ? 'الرخصة:' : 'Permis:'} <span className="font-semibold theme-text-primary">{data.driver.license}</span></p>
                <p className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Tél:'} <span className="font-semibold theme-text-primary">{data.driver.phone}</span></p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Truck className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                {isRTL ? 'معلومات المركبة:' : 'Informations Véhicule:'}
              </h3>
              <div className="space-y-2">
                <p className="theme-text-secondary">{isRTL ? 'اللوحة:' : 'Plaque:'} <span className="font-semibold theme-text-primary">{data.vehicle.plate}</span></p>
                <p className="theme-text-secondary">{isRTL ? 'النوع:' : 'Type:'} <span className="font-semibold theme-text-primary">{data.vehicle.type}</span></p>
                <p className="theme-text-secondary">{isRTL ? 'السعة:' : 'Capacité:'} <span className="font-semibold theme-text-primary">{data.vehicle.capacity} kg</span></p>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="theme-text-secondary">{isRTL ? 'رقم التسليم:' : 'N° Livraison:'}</p>
              <p className="font-semibold theme-text-primary">{data.deliveryNumber}</p>
            </div>
            <div>
              <p className="theme-text-secondary">{isRTL ? 'تاريخ التسليم:' : 'Date Livraison:'}</p>
              <p className="font-semibold theme-text-primary">{data.date}</p>
            </div>
            <div>
              <p className="theme-text-secondary">{isRTL ? 'الكمية الإجمالية:' : 'Quantité Totale:'}</p>
              <p className="font-semibold theme-text-primary">{data.totalQuantity.toLocaleString()} kg</p>
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
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold theme-text-primary">
                    {isRTL ? 'رقم الدفعة' : 'N° Lot'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold theme-text-primary">
                    {isRTL ? 'الحالة' : 'État'}
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
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center theme-text-primary">
                      {item.batchNumber}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.condition === 'Bon état' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {/* Signature Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4">
                {isRTL ? 'توقيع السائق:' : 'Signature Chauffeur:'}
              </h3>
              <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
                <p className="theme-text-secondary">{data.driver.name}</p>
              </div>
              <p className="text-sm theme-text-secondary">{data.date}</p>
            </div>

            {data.receivedBy && (
              <div>
                <h3 className="text-lg font-semibold theme-text-primary mb-4">
                  {isRTL ? 'توقيع المستلم:' : 'Signature Destinataire:'}
                </h3>
                <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
                  <p className="theme-text-secondary">{data.receivedBy.name}</p>
                </div>
                <p className="text-sm theme-text-secondary">{data.receivedBy.date}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm theme-text-secondary border-t border-gray-300 dark:border-gray-600 pt-6">
            <p>{isRTL ? 'تم التسليم وفقاً للمواصفات المطلوبة' : 'Livraison effectuée selon les spécifications requises'}</p>
            <p className="mt-2">
              {isRTL ? 'للاستفسارات، يرجى الاتصال بنا على:' : 'Pour toute question, veuillez nous contacter au:'} {data.from.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
