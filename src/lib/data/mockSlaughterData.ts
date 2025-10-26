// Données mock ultra-réalistes pour les graphiques d'abattage
export interface SlaughterDataBySpecies {
    abattoir: string;
    location: string;
    species: {
        BOVIN: number;
        OVIN: number;
        CAPRIN: number;
        AUTRE: number;
    };
    total: number;
    capacity: number;
    efficiency: number; // Pourcentage d'utilisation
}

export interface TimeSeriesData {
    date: string;
    BOVIN: number;
    OVIN: number;
    CAPRIN: number;
    AUTRE: number;
    total: number;
}

// Données mock pour la répartition par espèce et abattoir
export const mockSlaughterDataBySpecies: SlaughterDataBySpecies[] = [
    {
        abattoir: 'Abattoir Central',
        location: 'Alger',
        species: {
            BOVIN: 25,  // Barre rouge
            OVIN: 45,   // Barre bleue  
            CAPRIN: 15, // Barre verte
            AUTRE: 8    // Barre violette
        },
        total: 93,
        capacity: 300,
        efficiency: 31.0
    },
    {
        abattoir: 'Abattoir Nord',
        location: 'Oran',
        species: {
            BOVIN: 18,  // Barre rouge
            OVIN: 35,   // Barre bleue
            CAPRIN: 22, // Barre verte
            AUTRE: 5    // Barre violette
        },
        total: 80,
        capacity: 250,
        efficiency: 32.0
    },
    {
        abattoir: 'Abattoir Sud',
        location: 'Constantine',
        species: {
            BOVIN: 32,  // Barre rouge
            OVIN: 55,   // Barre bleue
            CAPRIN: 18, // Barre verte
            AUTRE: 12   // Barre violette
        },
        total: 117,
        capacity: 350,
        efficiency: 33.4
    },
    {
        abattoir: 'Abattoir Est',
        location: 'Annaba',
        species: {
            BOVIN: 22,  // Barre rouge
            OVIN: 40,   // Barre bleue
            CAPRIN: 28, // Barre verte
            AUTRE: 7    // Barre violette
        },
        total: 97,
        capacity: 280,
        efficiency: 34.6
    },
    {
        abattoir: 'Abattoir Ouest',
        location: 'Tlemcen',
        species: {
            BOVIN: 15,  // Barre rouge
            OVIN: 30,   // Barre bleue
            CAPRIN: 20, // Barre verte
            AUTRE: 4    // Barre violette
        },
        total: 69,
        capacity: 200,
        efficiency: 34.5
    }
];

// Données temporelles pour les tendances
export const mockTimeSeriesData: TimeSeriesData[] = [
    { date: '2024-01-01', BOVIN: 180, OVIN: 420, CAPRIN: 150, AUTRE: 35, total: 785 },
    { date: '2024-01-02', BOVIN: 195, OVIN: 445, CAPRIN: 165, AUTRE: 42, total: 847 },
    { date: '2024-01-03', BOVIN: 210, OVIN: 480, CAPRIN: 180, AUTRE: 38, total: 898 },
    { date: '2024-01-04', BOVIN: 185, OVIN: 465, CAPRIN: 170, AUTRE: 45, total: 865 },
    { date: '2024-01-05', BOVIN: 220, OVIN: 520, CAPRIN: 195, AUTRE: 48, total: 983 },
    { date: '2024-01-06', BOVIN: 205, OVIN: 490, CAPRIN: 185, AUTRE: 52, total: 932 },
    { date: '2024-01-07', BOVIN: 190, OVIN: 470, CAPRIN: 175, AUTRE: 40, total: 875 }
];

// Configuration des couleurs par espèce
export const speciesColors = {
    BOVIN: {
        primary: '#ef4444',    // Rouge
        secondary: '#dc2626',
        light: '#fef2f2',
        dark: '#991b1b'
    },
    OVIN: {
        primary: '#3b82f6',    // Bleu
        secondary: '#2563eb',
        light: '#eff6ff',
        dark: '#1e40af'
    },
    CAPRIN: {
        primary: '#10b981',    // Vert
        secondary: '#059669',
        light: '#ecfdf5',
        dark: '#047857'
    },
    AUTRE: {
        primary: '#8b5cf6',    // Violet
        secondary: '#7c3aed',
        light: '#f5f3ff',
        dark: '#6d28d9'
    },
    // Nouvelles clés pour correspondre à l'API
    Bovin: {
        primary: '#ef4444',    // Rouge
        secondary: '#dc2626',
        light: '#fef2f2',
        dark: '#991b1b'
    },
    Ovin: {
        primary: '#3b82f6',    // Bleu
        secondary: '#2563eb',
        light: '#eff6ff',
        dark: '#1e40af'
    },
    Caprin: {
        primary: '#10b981',    // Vert
        secondary: '#059669',
        light: '#ecfdf5',
        dark: '#047857'
    },
    Autre: {
        primary: '#8b5cf6',    // Violet
        secondary: '#7c3aed',
        light: '#f5f3ff',
        dark: '#6d28d9'
    }
};

// Labels traduits pour les espèces
export const speciesLabels = {
    BOVIN: { fr: 'Bovins', ar: 'أبقار', en: 'Cattle' },
    OVIN: { fr: 'Ovins', ar: 'أغنام', en: 'Sheep' },
    CAPRIN: { fr: 'Caprins', ar: 'ماعز', en: 'Goats' },
    AUTRE: { fr: 'Autres', ar: 'أخرى', en: 'Others' },
    // Nouvelles clés pour correspondre à l'API
    Bovin: { fr: 'Bovins', ar: 'أبقار', en: 'Cattle' },
    Ovin: { fr: 'Ovins', ar: 'أغنام', en: 'Sheep' },
    Caprin: { fr: 'Caprins', ar: 'ماعز', en: 'Goats' },
    Autre: { fr: 'Autres', ar: 'أخرى', en: 'Others' }
};
