'use client';

import React from 'react';
import { 
  FileText,
  Download,
  Printer,
  Eye,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  File,
  FileImage
} from 'lucide-react';

interface LivestockDocumentsProps {
  livestock: any;
  isRTL: boolean;
}

export default function LivestockDocuments({ livestock, isRTL }: LivestockDocumentsProps) {
  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - return a consistent format
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'CERTIFICAT_SANTE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CERTIFICAT_ORIGINE':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'BON_TRANSFERT':
        return <File className="h-5 w-5 text-purple-600" />;
      case 'CERTIFICAT_ABATTAGE':
        return <FileImage className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'CERTIFICAT_SANTE':
        return isRTL ? 'شهادة صحية' : 'Certificat de santé';
      case 'CERTIFICAT_ORIGINE':
        return isRTL ? 'شهادة منشأ' : 'Certificat d\'origine';
      case 'BON_TRANSFERT':
        return isRTL ? 'أذن نقل' : 'Bon de transfert';
      case 'CERTIFICAT_ABATTAGE':
        return isRTL ? 'شهادة ذبح' : 'Certificat d\'abattage';
      default:
        return isRTL ? 'وثيقة' : 'Document';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'VALID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'text-green-600 dark:text-green-400';
      case 'EXPIRED':
        return 'text-red-600 dark:text-red-400';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDocumentStatusLabel = (status: string) => {
    switch (status) {
      case 'VALID':
        return isRTL ? 'صالح' : 'Valide';
      case 'EXPIRED':
        return isRTL ? 'منتهي الصلاحية' : 'Expiré';
      case 'PENDING':
        return isRTL ? 'في الانتظار' : 'En attente';
      default:
        return isRTL ? 'غير محدد' : 'Non spécifié';
    }
  };

  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleDownload = (document: any) => {
    // Simulation de téléchargement
    console.log('Téléchargement du document:', document.title);
    // Ici vous pourriez implémenter la logique de téléchargement réelle
  };

  const handlePrint = (document: any) => {
    // Simulation d'impression
    console.log('Impression du document:', document.title);
    // Ici vous pourriez implémenter la logique d'impression réelle
  };

  const handleView = (document: any) => {
    // Simulation de visualisation
    console.log('Visualisation du document:', document.title);
    // Ici vous pourriez ouvrir le document dans une nouvelle fenêtre
  };

  return (
    <div className="space-y-6">
      {/* Résumé des documents */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'ملخص الوثائق' : 'Résumé des documents'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <FileText className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'إجمالي الوثائق' : 'Total documents'}
              </span>
            </div>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {livestock.documents ? livestock.documents.length : 0}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <CheckCircle className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'صالح' : 'Valides'}
              </span>
            </div>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {livestock.documents ? livestock.documents.filter((doc: any) => doc.status === 'VALID').length : 0}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <AlertTriangle className={`h-5 w-5 text-red-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'منتهية الصلاحية' : 'Expirés'}
              </span>
            </div>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {livestock.documents ? livestock.documents.filter((doc: any) => doc.status === 'EXPIRED').length : 0}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Clock className={`h-5 w-5 text-yellow-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'في الانتظار' : 'En attente'}
              </span>
            </div>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {livestock.documents ? livestock.documents.filter((doc: any) => doc.status === 'PENDING').length : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'قائمة الوثائق' : 'Liste des documents'}
        </h2>
        
        {livestock.documents && livestock.documents.length > 0 ? (
          <div className="space-y-4">
            {livestock.documents.map((document: any, index: number) => (
              <div key={document.id} className="p-4 border rounded-lg theme-border-primary theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-3`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {getDocumentTypeIcon(document.type)}
                    <div className={isRTL ? 'mr-3 text-right' : 'ml-3 text-left'}>
                      <h3 className="font-medium theme-text-primary theme-transition">
                        {document.title}
                      </h3>
                      <p className="text-sm theme-text-secondary theme-transition">
                        {getDocumentTypeLabel(document.type)}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusColor(document.status)}`}>
                      {getDocumentStatusIcon(document.status)}
                      <span className={isRTL ? 'mr-1' : 'ml-1'}>
                        {getDocumentStatusLabel(document.status)}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'تاريخ الإصدار' : 'Date d\'émission'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {formatDate(document.date)}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'صادر بواسطة' : 'Émis par'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {document.issuedBy}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'نوع الملف' : 'Type de fichier'}
                    </p>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getFileIcon(document.fileUrl)}
                      <span className={`theme-text-primary theme-transition ${isRTL ? 'mr-2' : 'ml-2'}`}>
                        {document.fileUrl.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'} pt-3 border-t theme-border-primary`}>
                  <button 
                    onClick={() => handleView(document)}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 theme-transition flex items-center"
                  >
                    <Eye className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {isRTL ? 'عرض' : 'Voir'}
                  </button>
                  <button 
                    onClick={() => handleDownload(document)}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 theme-transition flex items-center"
                  >
                    <Download className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {isRTL ? 'تحميل' : 'Télécharger'}
                  </button>
                  <button 
                    onClick={() => handlePrint(document)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 theme-transition flex items-center"
                  >
                    <Printer className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {isRTL ? 'طباعة' : 'Imprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لا توجد وثائق' : 'Aucun document'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'لم يتم رفع أي وثائق لهذا الحيوان' : 'Aucun document téléchargé pour cet animal'}
            </p>
          </div>
        )}
      </div>

      {/* Documents requis */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'الوثائق المطلوبة' : 'Documents requis'}
        </h2>
        
        <div className="space-y-3">
          {[
            { type: 'CERTIFICAT_SANTE', label: isRTL ? 'شهادة صحية' : 'Certificat de santé', required: true },
            { type: 'CERTIFICAT_ORIGINE', label: isRTL ? 'شهادة منشأ' : 'Certificat d\'origine', required: true },
            { type: 'BON_TRANSFERT', label: isRTL ? 'أذن نقل' : 'Bon de transfert', required: livestock.status === 'TRANSFERE' },
            { type: 'CERTIFICAT_ABATTAGE', label: isRTL ? 'شهادة ذبح' : 'Certificat d\'abattage', required: livestock.status === 'ABATTU' }
          ].map((reqDoc, index) => {
            const existingDoc = livestock.documents?.find((doc: any) => doc.type === reqDoc.type);
            const isPresent = !!existingDoc;
            const isValid = existingDoc?.status === 'VALID';
            
            return (
              <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} p-3 rounded-lg ${isValid ? 'bg-green-50 dark:bg-green-900/20' : isPresent ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {isValid ? (
                    <CheckCircle className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  ) : isPresent ? (
                    <AlertTriangle className={`h-5 w-5 text-yellow-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  ) : (
                    <AlertTriangle className={`h-5 w-5 text-red-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  )}
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h4 className="font-medium theme-text-primary theme-transition">
                      {reqDoc.label}
                    </h4>
                    <p className="text-sm theme-text-secondary theme-transition">
                      {isValid ? (isRTL ? 'صالح ومكتمل' : 'Valide et complet') :
                       isPresent ? (isRTL ? 'موجود ولكن غير صالح' : 'Présent mais non valide') :
                       (isRTL ? 'مفقود' : 'Manquant')}
                    </p>
                  </div>
                </div>
                {reqDoc.required && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isRTL ? 'mr-auto' : 'ml-auto'} ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isRTL ? 'مطلوب' : 'Requis'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
