'use client';

import React from 'react';

interface PrintCarcassDocumentProps {
  bete: any;
  isRTL?: boolean;
}

export const PrintCarcassDocument: React.FC<PrintCarcassDocumentProps> = ({ bete, isRTL = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rendement = bete.poids_vif && bete.poids_a_chaud 
    ? ((bete.poids_a_chaud / bete.poids_vif) * 100).toFixed(2) 
    : 'N/A';

  return (
    <div className="hidden print:block print:bg-white print:text-black">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm 2.5cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1a1a1a;
          }
          
          .print-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }
          
          /* En-tête élégant */
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .print-logo {
            font-size: 36px;
            font-weight: 700;
            color: #000;
            letter-spacing: 3px;
          }
          
          .print-company {
            text-align: right;
            font-size: 10px;
            color: #666;
            line-height: 1.6;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 10px;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .print-subtitle {
            font-size: 11px;
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          
          /* Sections */
          .print-section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #000;
            border-left: 4px solid #000;
            padding-left: 10px;
            margin-bottom: 15px;
          }
          
          /* Grille d'information */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px 30px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            font-weight: 500;
          }
          
          .info-value {
            font-size: 12px;
            color: #000;
            font-weight: 500;
          }
          
          /* Tableau des poids */
          .weights-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .weights-table th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: left;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #ddd;
          }
          
          .weights-table td {
            padding: 10px;
            font-size: 11px;
            border: 1px solid #ddd;
            font-weight: 500;
          }
          
          /* Rendement highlight */
          .rendement-box {
            background-color: #f8f8f8;
            border: 2px solid #000;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
          }
          
          .rendement-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .rendement-value {
            font-size: 32px;
            font-weight: 700;
            color: #000;
          }
          
          /* Pied de page */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 40px;
            font-size: 9px;
            color: #999;
            text-align: center;
          }
          
          .signature-area {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
            margin-top: 50px;
            margin-bottom: 30px;
          }
          
          .signature-box {
            text-align: center;
            padding-top: 50px;
            border-top: 1px solid #999;
          }
          
          .signature-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Badge de statut */
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #000;
            background-color: #f8f8f8;
          }
        }
      `}</style>

      <div className="print-container">
        {/* En-tête */}
        <div className="print-header">
          <div>
            <div className="print-logo">ALVIAR</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px', fontWeight: 500 }}>
              Algérienne des Viandes Rouges
            </div>
          </div>
          <div className="print-company">
            <div style={{ fontWeight: 600, fontSize: '11px', color: '#000' }}>SOCIÉTÉ ALVIAR</div>
            <div>Alger, Algérie</div>
            <div>Tél: +213 (0) XX XX XX XX</div>
            <div>Email: contact@alviar.dz</div>
          </div>
        </div>

        {/* Titre */}
        <div className="print-title">Fiche Technique - Carcasse</div>
        <div className="print-subtitle">
          Document généré le {formatDateTime(new Date().toISOString())} • Référence: {bete.numero_identification}
        </div>

        {/* Informations générales */}
        <div className="print-section">
          <div className="section-title">Identification</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Numéro de boucle</div>
              <div className="info-value">{bete.numero_identification}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Numéro post-abattage</div>
              <div className="info-value">{bete.num_boucle_post_abattage || bete.numero_identification}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Espèce</div>
              <div className="info-value">{bete.espece_nom}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Sexe</div>
              <div className="info-value">{bete.sexe === 'M' ? 'Mâle' : 'Femelle'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Statut</div>
              <div className="info-value">
                <span className="status-badge">Abattu</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">État de santé</div>
              <div className="info-value">
                <span className="status-badge">{bete.etat_sante === 'BON' ? 'Bon' : 'Malade'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Données pondérales */}
        <div className="print-section">
          <div className="section-title">Données Pondérales</div>
          <table className="weights-table">
            <thead>
              <tr>
                <th>Type de pesée</th>
                <th>Poids (kg)</th>
                <th>Remarque</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Poids vif</td>
                <td>{bete.poids_vif ? `${bete.poids_vif} kg` : 'Non renseigné'}</td>
                <td>Avant abattage</td>
              </tr>
              <tr>
                <td>Poids à chaud</td>
                <td>{bete.poids_a_chaud ? `${bete.poids_a_chaud} kg` : 'Non renseigné'}</td>
                <td>Immédiatement après abattage</td>
              </tr>
              <tr>
                <td>Poids à froid</td>
                <td>{bete.poids_a_froid ? `${bete.poids_a_froid} kg` : 'Non renseigné'}</td>
                <td>Après refroidissement</td>
              </tr>
            </tbody>
          </table>

          {/* Rendement */}
          {bete.poids_vif && bete.poids_a_chaud && (
            <div className="rendement-box">
              <div className="rendement-label">Rendement Carcasse</div>
              <div className="rendement-value">{rendement}%</div>
            </div>
          )}
        </div>

        {/* Informations d'abattage */}
        <div className="print-section">
          <div className="section-title">Traçabilité & Abattage</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Date d'abattage</div>
              <div className="info-value">{formatDateTime(bete.updated_at)}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Abattoir</div>
              <div className="info-value">{bete.abattoir_nom || 'Non assigné'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Date d'enregistrement</div>
              <div className="info-value">{formatDate(bete.created_at)}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Enregistré par</div>
              <div className="info-value">{bete.created_by?.full_name || 'Système'}</div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="signature-area">
          <div className="signature-box">
            <div className="signature-label">Responsable Qualité</div>
          </div>
          <div className="signature-box">
            <div className="signature-label">Directeur</div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="print-footer">
          <div>© {new Date().getFullYear()} ALVIAR - Algérienne des Viandes Rouges • Document confidentiel</div>
          <div style={{ marginTop: '5px' }}>
            Ce document a été généré automatiquement et ne nécessite pas de signature pour être valide
          </div>
        </div>
      </div>
    </div>
  );
};






