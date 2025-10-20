'use client';

import React from 'react';
import { Bete } from '@/lib/api/livestockService';

interface PrintBeteDocumentProps {
  bete: Bete;
  isRTL?: boolean;
}

export const PrintBeteDocument: React.FC<PrintBeteDocumentProps> = ({ bete, isRTL = false }) => {
  return (
    <div className="hidden print:block print:bg-white print:text-black">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-family: 'Arial', sans-serif;
          }
          
          .print-document {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }
          
          .print-header {
            border-bottom: 3px solid #1a1a1a;
            padding-bottom: 15px;
            margin-bottom: 20px;
            position: relative;
          }
          
          .print-logo {
            font-size: 32px;
            font-weight: 900;
            color: #1a1a1a;
            letter-spacing: 2px;
          }
          
          .print-company-name {
            font-size: 11px;
            color: #666;
            margin-top: 3px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .print-doc-title {
            position: absolute;
            top: 0;
            right: 0;
            text-align: right;
          }
          
          .print-doc-type {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .print-doc-subtitle {
            font-size: 9px;
            color: #666;
            margin-top: 3px;
            text-transform: uppercase;
          }
          
          .print-reference {
            margin: 15px 0;
            padding: 10px 15px;
            background-color: #f8f8f8;
            border-left: 4px solid #1a1a1a;
          }
          
          .print-ref-label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .print-ref-value {
            font-size: 14px;
            font-weight: 700;
            color: #1a1a1a;
            margin-top: 2px;
          }
          
          .print-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .print-section-title {
            font-size: 11px;
            font-weight: 700;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 5px;
            margin-bottom: 12px;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .print-table td {
            padding: 8px 12px;
            border: 1px solid #ddd;
            font-size: 10px;
          }
          
          .print-table .label {
            width: 40%;
            font-weight: 600;
            color: #333;
            background-color: #f8f8f8;
          }
          
          .print-table .value {
            width: 60%;
            color: #1a1a1a;
          }
          
          .print-status-badge {
            display: inline-block;
            padding: 3px 10px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-green {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #2e7d32;
          }
          
          .status-orange {
            background-color: #fff3e0;
            color: #e65100;
            border: 1px solid #e65100;
          }
          
          .status-red {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #c62828;
          }
          
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 10px 0;
            border-top: 1px solid #ddd;
            font-size: 8px;
            color: #666;
            text-align: center;
            background-color: white;
          }
          
          .print-signature-area {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          
          .print-signature-box {
            border-top: 1px solid #333;
            padding-top: 8px;
            text-align: center;
          }
          
          .print-signature-label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      `}</style>

      <div className="print-document">
        {/* En-tête officiel */}
        <div className="print-header">
          <div>
            <div className="print-logo">ALVIAR</div>
            <div className="print-company-name">
              {isRTL ? 'الجزائرية للحوم الحمراء' : 'Algérienne des Viandes Rouges'}
            </div>
          </div>
          <div className="print-doc-title">
            <div className="print-doc-type">
              {isRTL ? 'بطاقة تقنية' : 'FICHE TECHNIQUE'}
            </div>
            <div className="print-doc-subtitle">
              {isRTL ? 'حيوان - ماشية' : 'Animal - Bétail'}
            </div>
          </div>
        </div>

        {/* Référence */}
        <div className="print-reference">
          <div className="print-ref-label">
            {isRTL ? 'رقم التعريف / Numéro d\'identification' : 'Numéro d\'identification / N° ID'}
          </div>
          <div className="print-ref-value">{bete.numero_identification}</div>
        </div>

        {/* Informations générales */}
        <div className="print-section">
          <div className="print-section-title">
            {isRTL ? 'معلومات عامة' : 'INFORMATIONS GÉNÉRALES'}
          </div>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label">{isRTL ? 'رقم الحلقة' : 'Numéro de boucle'}</td>
                <td className="value">{bete.numero_identification}</td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'النوع' : 'Espèce'}</td>
                <td className="value">{bete.espece_nom || 'Non spécifié'}</td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'الجنس' : 'Sexe'}</td>
                <td className="value">
                  {bete.sexe === 'M' ? (isRTL ? 'ذكر (Mâle)' : 'Mâle') : (isRTL ? 'أنثى (Femelle)' : 'Femelle')}
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'المسلخ المعين' : 'Abattoir assigné'}</td>
                <td className="value">{bete.abattoir_nom || 'Non assigné'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Statut sanitaire et vital */}
        <div className="print-section">
          <div className="print-section-title">
            {isRTL ? 'الحالة الصحية والحيوية' : 'STATUT SANITAIRE ET VITAL'}
          </div>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label">{isRTL ? 'الحالة' : 'Statut vital'}</td>
                <td className="value">
                  <span className={`print-status-badge ${
                    bete.statut === 'VIVANT' ? 'status-green' :
                    bete.statut === 'EN_STABULATION' ? 'status-orange' :
                    'status-red'
                  }`}>
                    {bete.statut === 'VIVANT' ? (isRTL ? 'حي' : 'VIVANT') :
                     bete.statut === 'EN_STABULATION' ? (isRTL ? 'في الحظيرة' : 'EN STABULATION') :
                     bete.statut === 'ABATTU' ? (isRTL ? 'مذبوح' : 'ABATTU') :
                     (isRTL ? 'ميت' : 'MORT')}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'الحالة الصحية' : 'État sanitaire'}</td>
                <td className="value">
                  <span className={`print-status-badge ${
                    bete.etat_sante === 'BON' ? 'status-green' : 'status-red'
                  }`}>
                    {bete.etat_sante === 'BON' ? (isRTL ? 'جيد' : 'BON') : (isRTL ? 'مريض' : 'MALADE')}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'أولوية الذبح' : 'Priorité d\'abattage'}</td>
                <td className="value">
                  <span className={`print-status-badge ${bete.abattage_urgence ? 'status-red' : 'status-green'}`}>
                    {bete.abattage_urgence ? (isRTL ? 'عاجل' : 'URGENT') : (isRTL ? 'عادي' : 'NORMAL')}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Données pondérales */}
        <div className="print-section">
          <div className="print-section-title">
            {isRTL ? 'البيانات الوزنية' : 'DONNÉES PONDÉRALES'}
          </div>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label">{isRTL ? 'الوزن الحي' : 'Poids vif'}</td>
                <td className="value" style={{ fontWeight: 700 }}>
                  {bete.poids_vif ? `${bete.poids_vif} kg` : 'Non renseigné'}
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'الوزن الساخن' : 'Poids carcasse à chaud'}</td>
                <td className="value" style={{ fontWeight: 700 }}>
                  {bete.poids_a_chaud ? `${bete.poids_a_chaud} kg` : 'Non renseigné'}
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'الوزن البارد' : 'Poids carcasse à froid'}</td>
                <td className="value" style={{ fontWeight: 700 }}>
                  {bete.poids_a_froid ? `${bete.poids_a_froid} kg` : 'Non renseigné'}
                </td>
              </tr>
              {bete.poids_vif && bete.poids_a_chaud && (
                <tr>
                  <td className="label">{isRTL ? 'معدل التصافي' : 'Rendement carcasse'}</td>
                  <td className="value" style={{ fontWeight: 700 }}>
                    {((bete.poids_a_chaud / bete.poids_vif) * 100).toFixed(2)} %
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Traçabilité et affectation */}
        <div className="print-section">
          <div className="print-section-title">
            {isRTL ? 'التتبع والتخصيص' : 'TRAÇABILITÉ ET AFFECTATION'}
          </div>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label">{isRTL ? 'المسلخ' : 'Établissement'}</td>
                <td className="value">{bete.abattoir_nom || 'Non assigné'}</td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'المسؤول' : 'Responsable/Client'}</td>
                <td className="value">{bete.responsable?.full_name || 'Non assigné'}</td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'تاريخ الإدخال' : 'Date d\'entrée système'}</td>
                <td className="value">
                  {new Date(bete.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} à {new Date(bete.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'آخر تحديث' : 'Dernière modification'}</td>
                <td className="value">
                  {new Date(bete.updated_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} à {new Date(bete.updated_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'المشغل' : 'Opérateur'}</td>
                <td className="value">{bete.created_by?.full_name || 'Système'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Durée dans le système */}
        <div className="print-section">
          <div className="print-section-title">
            {isRTL ? 'معلومات إضافية' : 'INFORMATIONS COMPLÉMENTAIRES'}
          </div>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label">{isRTL ? 'مدة التواجد في النظام' : 'Durée présence système'}</td>
                <td className="value">
                  {Math.floor((new Date().getTime() - new Date(bete.created_at).getTime()) / (1000 * 60 * 60 * 24))} {isRTL ? 'يوم' : 'jour(s)'}
                </td>
              </tr>
              <tr>
                <td className="label">{isRTL ? 'آخر نشاط' : 'Dernière activité'}</td>
                <td className="value">
                  Il y a {Math.floor((new Date().getTime() - new Date(bete.updated_at).getTime()) / (1000 * 60 * 60))} heure(s)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Zone de signatures */}
        <div className="print-signature-area">
          <div className="print-signature-box">
            <div className="print-signature-label">
              {isRTL ? 'المسؤول / Responsable' : 'Le responsable'}
            </div>
          </div>
          <div className="print-signature-box">
            <div className="print-signature-label">
              {isRTL ? 'المدير / Directeur' : 'Le directeur'}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="print-footer">
          <div style={{ marginBottom: '3px' }}>
            <strong>ALVIAR</strong> - {isRTL ? 'الجزائرية للحوم الحمراء' : 'Algérienne des Viandes Rouges'} | 
            {isRTL ? ' نظام إدارة متكامل' : ' Système de Gestion Intégré'}
          </div>
          <div>
            {isRTL ? 'وثيقة رسمية' : 'Document officiel'} • 
            {isRTL ? ' تاريخ الإصدار: ' : ' Date d\'édition : '}
            {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • 
            {isRTL ? ' مرجع: ' : ' Réf.: '}{bete.numero_identification}
          </div>
        </div>
      </div>
    </div>
  );
};
