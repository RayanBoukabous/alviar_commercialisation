import { apiClient } from './client';

export interface PaymentPlan {
    id: number;
    name: string;
    price: string;
    currency: string;
    billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | 'QUARTERLY' | 'LIFETIME';
    requestLimit: number;
    isDefault: boolean;
    trialDays: number;
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
}

export interface BillingCycle {
    value: string;
    label: string;
}

export interface Currency {
    value: string;
    symbol: string;
}

export interface BillingCyclesAndCurrencies {
    billingCycles: BillingCycle[];
    currencies: Currency[];
}

export interface CreatePaymentPlanRequest {
    name: string;
    price: number;
    currency: string;
    billingCycle: string;
    requestLimit: number;
    isDefault: boolean;
    trialDays: number;
    features: string[];
    isActive: boolean;
}

export class PaymentPlansService {
    /**
     * Récupère tous les plans de paiement
     */
    static async getAllPaymentPlans(): Promise<PaymentPlan[]> {
        try {
            console.log('🔍 Récupération de tous les plans de paiement depuis l\'API...');

            const response = await apiClient.get<PaymentPlan[]>('/payment-plans');

            console.log('✅ Plans de paiement récupérés avec succès:', response);

            // L'API retourne directement un tableau de plans de paiement
            return response.data || response || [];
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des plans de paiement:', error);
            throw new Error(`Erreur lors de la récupération des plans de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Récupère tous les plans de paiement actifs
     */
    static async getActivePaymentPlans(): Promise<PaymentPlan[]> {
        try {
            console.log('🔍 Récupération des plans de paiement actifs depuis l\'API...');

            const response = await apiClient.get<PaymentPlan[]>('/payment-plans/active');

            console.log('✅ Plans de paiement actifs récupérés avec succès:', response);

            // L'API retourne directement un tableau de plans de paiement actifs
            return response.data || response || [];
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des plans de paiement actifs:', error);
            throw new Error(`Erreur lors de la récupération des plans de paiement actifs: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Récupère un plan de paiement par son ID
     */
    static async getPaymentPlanById(id: number): Promise<PaymentPlan> {
        try {
            console.log(`🔍 Récupération du plan de paiement ${id} depuis l'API...`);

            const response = await apiClient.get<PaymentPlan>(`/payment-plans/${id}`);

            console.log(`✅ Plan de paiement ${id} récupéré avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la récupération du plan de paiement ${id}:`, error);
            throw new Error(`Erreur lors de la récupération du plan de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Récupère les cycles de facturation et devises disponibles
     */
    static async getBillingCyclesAndCurrencies(): Promise<BillingCyclesAndCurrencies> {
        try {
            console.log('🔍 Récupération des cycles de facturation et devises...');

            const response = await apiClient.get<BillingCyclesAndCurrencies>('/payment-plans/billing-cycles-and-currencies');

            console.log('✅ Cycles de facturation et devises récupérés avec succès:', response);

            return response.data || response;
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des cycles et devises:', error);
            throw new Error(`Erreur lors de la récupération des cycles et devises: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Crée un nouveau plan de paiement
     */
    static async createPaymentPlan(paymentPlanData: CreatePaymentPlanRequest): Promise<PaymentPlan> {
        try {
            console.log('🔍 Création d\'un nouveau plan de paiement...', paymentPlanData);

            const response = await apiClient.post<PaymentPlan>('/payment-plans', paymentPlanData);

            console.log('✅ Plan de paiement créé avec succès:', response);

            return response.data || response;
        } catch (error: any) {
            console.error('❌ Erreur lors de la création du plan de paiement:', error);
            throw new Error(`Erreur lors de la création du plan de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Met à jour un plan de paiement
     */
    static async updatePaymentPlan(id: number, paymentPlanData: Partial<CreatePaymentPlanRequest>): Promise<PaymentPlan> {
        try {
            console.log(`🔍 Mise à jour du plan de paiement ${id}...`, paymentPlanData);

            const response = await apiClient.patch<PaymentPlan>(`/payment-plans/${id}`, paymentPlanData);

            console.log(`✅ Plan de paiement ${id} mis à jour avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la mise à jour du plan de paiement ${id}:`, error);
            throw new Error(`Erreur lors de la mise à jour du plan de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Supprime un plan de paiement
     */
    static async deletePaymentPlan(id: number): Promise<void> {
        try {
            console.log(`🔍 Suppression du plan de paiement ${id}...`);

            await apiClient.delete(`/payment-plans/${id}`);

            console.log(`✅ Plan de paiement ${id} supprimé avec succès`);
        } catch (error: any) {
            console.error(`❌ Erreur lors de la suppression du plan de paiement ${id}:`, error);
            throw new Error(`Erreur lors de la suppression du plan de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Active un plan de paiement
     */
    static async activatePaymentPlan(id: number): Promise<PaymentPlan> {
        try {
            console.log(`🔍 Activation du plan de paiement ${id}...`);

            const response = await apiClient.patch<PaymentPlan>(`/payment-plans/${id}/activate`);

            console.log(`✅ Plan de paiement ${id} activé avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de l'activation du plan de paiement ${id}:`, error);
            throw new Error(`Erreur lors de l'activation du plan de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Désactive un plan de paiement
     */
    static async deactivatePaymentPlan(id: number): Promise<PaymentPlan> {
        try {
            console.log(`🔍 Désactivation du plan de paiement ${id}...`);

            const response = await apiClient.patch<PaymentPlan>(`/payment-plans/${id}/deactivate`);

            console.log(`✅ Plan de paiement ${id} désactivé avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la désactivation du plan de paiement ${id}:`, error);
            throw new Error(`Erreur lors de la désactivation du plan de paiement: ${error.message || 'Erreur inconnue'}`);
        }
    }
}
