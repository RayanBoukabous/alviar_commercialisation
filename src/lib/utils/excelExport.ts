import * as XLSX from 'xlsx';
import { HistoriqueChambreFroide } from '@/lib/api/abattoirService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExcelExportOptions {
    abattoirName: string;
    abattoirLocation: string;
    exportDate: Date;
    isRTL?: boolean;
}

/**
 * Fonction pour exporter l'historique des chambres froides en Excel avec un format ultra-professionnel
 */
export const exportHistoriqueChambresFroides = (
    historique: HistoriqueChambreFroide[],
    options: ExcelExportOptions
) => {
    // Créer un nouveau workbook
    const workbook = XLSX.utils.book_new();

    // Préparer les données pour l'export avec style professionnel
    const excelData = prepareProfessionalExcelData(historique, options);

    // Créer la feuille de calcul
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Ajouter le logo Alviar dans la cellule A2
    addAlviarLogoToWorksheet(worksheet);

    // Définir les styles et la largeur des colonnes
    const columnWidths = [
        { wch: 18 }, // Date
        { wch: 15 }, // Heure
        { wch: 25 }, // Chambre froide
        { wch: 18 }, // Température
        { wch: 15 }, // Statut
        { wch: 25 }, // Utilisateur
        { wch: 20 }, // Username
        { wch: 25 }, // Abattoir
    ];

    worksheet['!cols'] = columnWidths;

    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique Températures');

    // Générer le nom du fichier avec la date
    const fileName = `ALVIAR_Historique_Chambres_Froides_${format(options.exportDate, 'yyyy-MM-dd_HH-mm')}.xlsx`;

    // Exporter le fichier
    XLSX.writeFile(workbook, fileName);
};

/**
 * Préparer les données pour l'export Excel avec en-têtes professionnels
 */
const prepareProfessionalExcelData = (
    historique: HistoriqueChambreFroide[],
    options: ExcelExportOptions
): any[][] => {
    const data: any[][] = [];

    // En-tête ultra-professionnel avec logo Alviar
    data.push(['']); // Ligne vide
    data.push(['']); // Ligne pour le logo
    data.push(['ALVIAR - ENTREPRISE ALGÉRIENNE DE VIANDES ROUGES']);
    data.push(['RAPPORT D\'HISTORIQUE DES CHAMBRES FROIDES']);
    data.push(['']); // Ligne vide
    data.push(['Abattoir:', options.abattoirName]);
    data.push(['Localisation:', options.abattoirLocation]);
    data.push(['Date d\'export:', format(options.exportDate, 'dd/MM/yyyy à HH:mm', { locale: fr })]);
    data.push(['Total des mesures:', historique.length]);
    data.push(['']); // Ligne vide

    // En-têtes des colonnes avec style professionnel
    const headers = [
        'DATE',
        'HEURE',
        'CHAMBRE FROIDE',
        'TEMPÉRATURE (°C)',
        'STATUT',
        'UTILISATEUR',
        'USERNAME',
        'ABATTOIR'
    ];

    data.push(headers);

    // Données de l'historique avec formatage professionnel
    historique.forEach(item => {
        const tempStatus = getTemperatureStatusLabel(item.temperature);
        const date = new Date(item.date_mesure);

        data.push([
            format(date, 'dd/MM/yyyy', { locale: fr }),
            format(date, 'HH:mm', { locale: fr }),
            item.chambre_froide_numero || 'N/A',
            typeof item.temperature === 'number' ? item.temperature.toFixed(1) : parseFloat(item.temperature).toFixed(1),
            tempStatus,
            item.mesure_par_nom || 'N/A',
            item.mesure_par_username || 'N/A',
            item.abattoir_nom || 'N/A'
        ]);
    });

    // Ligne vide
    data.push(['']);

    // Pied de page professionnel
    data.push(['']);
    data.push(['Rapport généré automatiquement par le système ALVIAR']);
    data.push(['Contact: info@alviar.dz | www.alviar.dz']);
    data.push(['© 2024 ALVIAR - Tous droits réservés | Entreprise certifiée ISO 22000']);

    return data;
};

/**
 * Ajouter le logo Alviar à la feuille Excel
 */
const addAlviarLogoToWorksheet = (worksheet: any) => {
    try {
        // Créer une référence à l'image du logo Alviar blanc
        const logoPath = '/alviar_logo_white.png';

        // Ajouter l'image dans la cellule A2
        if (!worksheet['!images']) {
            worksheet['!images'] = [];
        }

        // Ajouter l'image du logo
        worksheet['!images'].push({
            type: 'image',
            position: 'A2',
            image: logoPath,
            width: 200,
            height: 60
        });
    } catch (error) {
        console.warn('Impossible d\'ajouter le logo Alviar:', error);
    }
};

/**
 * Obtenir le label du statut de température
 */
const getTemperatureStatusLabel = (temp: number | string): string => {
    const tempNum = typeof temp === 'string' ? parseFloat(temp) : temp;

    if (isNaN(tempNum)) return 'Inconnu';
    if (tempNum < -18) return 'Excellent';
    if (tempNum < -15) return 'Bon';
    if (tempNum < -10) return 'Attention';
    return 'Critique';
};

/**
 * Fonction pour exporter un rapport détaillé avec design ultra-professionnel
 */
export const exportDetailedReport = (
    historique: HistoriqueChambreFroide[],
    options: ExcelExportOptions
) => {
    const workbook = XLSX.utils.book_new();

    // Feuille 1: Données avec design professionnel
    const rawData = prepareProfessionalExcelData(historique, options);
    const rawWorksheet = XLSX.utils.aoa_to_sheet(rawData);

    // Ajouter le logo Alviar
    addAlviarLogoToWorksheet(rawWorksheet);

    rawWorksheet['!cols'] = [
        { wch: 18 }, { wch: 15 }, { wch: 25 }, { wch: 18 },
        { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(workbook, rawWorksheet, 'Historique Températures');

    const fileName = `ALVIAR_Rapport_Detaille_Chambres_Froides_${format(options.exportDate, 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};

