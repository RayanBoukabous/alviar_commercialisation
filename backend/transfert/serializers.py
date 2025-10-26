from rest_framework import serializers
from django.contrib.auth import get_user_model
from abattoir.models import Abattoir
from bete.models import Bete
from .models import Transfert, TransfertBete, Reception

User = get_user_model()


class AbattoirSimpleSerializer(serializers.ModelSerializer):
    """Sérialiseur simple pour les abattoirs"""
    
    adresse_complete = serializers.ReadOnlyField()
    
    class Meta:
        model = Abattoir
        fields = ['id', 'nom', 'wilaya', 'commune', 'adresse_complete']


class UserSimpleSerializer(serializers.ModelSerializer):
    """Sérialiseur simple pour les utilisateurs"""
    
    nom = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'nom']
    
    def get_nom(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username


class BeteSimpleSerializer(serializers.ModelSerializer):
    """Sérialiseur simple pour les bêtes"""
    
    espece_nom = serializers.CharField(source='espece.nom', read_only=True)
    
    class Meta:
        model = Bete
        fields = [
            'id', 'num_boucle', 'espece_nom', 'sexe', 
            'poids_vif', 'statut', 'etat_sante'
        ]


class TransfertBeteSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les bêtes de transfert"""
    
    bete = BeteSimpleSerializer(read_only=True)
    bete_id = serializers.IntegerField(write_only=True)
    ajoute_par = UserSimpleSerializer(read_only=True)
    date_ajout = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = TransfertBete
        fields = [
            'id', 'bete', 'bete_id', 'ajoute_par', 'date_ajout'
        ]
        read_only_fields = ['id', 'ajoute_par', 'date_ajout']


class TransfertSerializer(serializers.ModelSerializer):
    """Sérialiseur principal pour les transferts"""
    
    # Relations
    abattoir_expediteur = AbattoirSimpleSerializer(read_only=True)
    abattoir_expediteur_id = serializers.IntegerField(write_only=True)
    abattoir_destinataire = AbattoirSimpleSerializer(read_only=True)
    abattoir_destinataire_id = serializers.IntegerField(write_only=True)
    
    # Utilisateurs
    cree_par = UserSimpleSerializer(read_only=True)
    valide_par = UserSimpleSerializer(read_only=True)
    annule_par = UserSimpleSerializer(read_only=True)
    
    # Bêtes
    betes = TransfertBeteSerializer(many=True, read_only=True)
    betes_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    # Champs calculés
    nombre_betes_actuelles = serializers.ReadOnlyField()
    est_complet = serializers.ReadOnlyField()
    peut_etre_livre = serializers.ReadOnlyField()
    peut_etre_annule = serializers.ReadOnlyField()
    
    # Statut display
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Transfert
        fields = [
            'id', 'numero_transfert',
            'abattoir_expediteur', 'abattoir_expediteur_id',
            'abattoir_destinataire', 'abattoir_destinataire_id',
            'nombre_betes', 'nombre_betes_actuelles',
            'statut', 'statut_display',
            'date_creation', 'date_livraison', 'date_annulation',
            'cree_par', 'valide_par', 'annule_par',
            'motif', 'notes',
            'betes', 'betes_ids',
            'est_complet', 'peut_etre_livre', 'peut_etre_annule',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero_transfert', 'nombre_betes_actuelles',
            'date_creation', 'date_livraison', 'date_annulation',
            'cree_par', 'valide_par', 'annule_par',
            'est_complet', 'peut_etre_livre', 'peut_etre_annule',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validation personnalisée"""
        # Vérifier que l'abattoir expéditeur et destinataire sont différents
        if data.get('abattoir_expediteur_id') == data.get('abattoir_destinataire_id'):
            raise serializers.ValidationError(
                "L'abattoir expéditeur et destinataire doivent être différents"
            )
        
        # Vérifier que l'abattoir expéditeur existe
        try:
            abattoir_exp = Abattoir.objects.get(id=data['abattoir_expediteur_id'])
        except Abattoir.DoesNotExist:
            raise serializers.ValidationError("Abattoir expéditeur introuvable")
        
        # Vérifier que l'abattoir destinataire existe
        try:
            abattoir_dest = Abattoir.objects.get(id=data['abattoir_destinataire_id'])
        except Abattoir.DoesNotExist:
            raise serializers.ValidationError("Abattoir destinataire introuvable")
        
        return data
    
    def create(self, validated_data):
        """Création d'un transfert avec gestion des bêtes"""
        betes_ids = validated_data.pop('betes_ids', [])
        
        try:
            # Créer le transfert
            transfert = Transfert.objects.create(**validated_data)
            
            # Ajouter les bêtes si fournies
            betes_ajoutees = 0
            betes_ignorees = []
            
            if betes_ids:
                for bete_id in betes_ids:
                    try:
                        bete = Bete.objects.get(id=bete_id)
                        # Vérifier si la bête peut être ajoutée
                        if (bete.abattoir == transfert.abattoir_expediteur and 
                            bete.statut == 'VIVANT'):
                            transfert.ajouter_bete(bete)
                            betes_ajoutees += 1
                        else:
                            betes_ignorees.append({
                                'id': bete.id,
                                'num_boucle': bete.num_boucle,
                                'raison': 'Bête n\'appartient pas à l\'abattoir expéditeur ou n\'est pas vivante'
                            })
                    except Bete.DoesNotExist:
                        betes_ignorees.append({
                            'id': bete_id,
                            'num_boucle': 'N/A',
                            'raison': 'Bête introuvable'
                        })
                    except Exception as e:
                        betes_ignorees.append({
                            'id': bete_id,
                            'num_boucle': 'N/A',
                            'raison': f'Erreur lors de l\'ajout: {str(e)}'
                        })
            
            # Stocker les informations sur les bêtes ignorées dans le transfert
            if betes_ignorees:
                transfert.notes = f"{transfert.notes or ''}\nBêtes ignorées lors de la création: {len(betes_ignorees)} bêtes ignorées.".strip()
                transfert.save()
            
            return transfert
            
        except Exception as e:
            # En cas d'erreur, supprimer le transfert créé s'il existe
            if 'transfert' in locals():
                transfert.delete()
            raise serializers.ValidationError(f"Erreur lors de la création du transfert: {str(e)}")


class TransfertListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour la liste des transferts"""
    
    abattoir_expediteur = AbattoirSimpleSerializer(read_only=True)
    abattoir_destinataire = AbattoirSimpleSerializer(read_only=True)
    cree_par = UserSimpleSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    nombre_betes_actuelles = serializers.ReadOnlyField()
    
    class Meta:
        model = Transfert
        fields = [
            'id', 'numero_transfert',
            'abattoir_expediteur', 'abattoir_destinataire',
            'nombre_betes', 'nombre_betes_actuelles',
            'statut', 'statut_display',
            'date_creation', 'date_livraison',
            'cree_par', 'motif'
        ]


class ReceptionSerializer(serializers.ModelSerializer):
    """Sérialiseur principal pour les réceptions"""
    
    # Relations
    transfert = TransfertListSerializer(read_only=True)
    transfert_id = serializers.IntegerField(write_only=True)
    
    # Utilisateurs
    cree_par = UserSimpleSerializer(read_only=True)
    valide_par = UserSimpleSerializer(read_only=True)
    annule_par = UserSimpleSerializer(read_only=True)
    
    # Champs calculés
    taux_reception = serializers.ReadOnlyField()
    est_complete = serializers.ReadOnlyField()
    est_partielle = serializers.ReadOnlyField()
    est_vide = serializers.ReadOnlyField()
    peut_etre_confirmee = serializers.ReadOnlyField()
    peut_etre_annulee = serializers.ReadOnlyField()
    
    # Statut display
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    # Abattoirs via le transfert
    abattoir_expediteur = serializers.SerializerMethodField()
    abattoir_destinataire = serializers.SerializerMethodField()
    
    class Meta:
        model = Reception
        fields = [
            'id', 'numero_reception', 'transfert', 'transfert_id',
            'nombre_betes_attendues', 'nombre_betes_recues', 
            'nombre_betes_manquantes', 'betes_manquantes',
            'statut', 'statut_display',
            'date_creation', 'date_reception', 'date_annulation',
            'cree_par', 'valide_par', 'annule_par',
            'note',
            'taux_reception', 'est_complete', 'est_partielle', 
            'est_vide', 'peut_etre_confirmee', 'peut_etre_annulee',
            'abattoir_expediteur', 'abattoir_destinataire',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero_reception', 'nombre_betes_attendues',
            'date_creation', 'date_reception', 'date_annulation',
            'cree_par', 'valide_par', 'annule_par',
            'taux_reception', 'est_complete', 'est_partielle', 
            'est_vide', 'peut_etre_confirmee', 'peut_etre_annulee',
            'created_at', 'updated_at'
        ]
    
    def get_abattoir_expediteur(self, obj):
        """Retourne l'abattoir expéditeur via le transfert"""
        if obj.transfert:
            return AbattoirSimpleSerializer(obj.transfert.abattoir_expediteur).data
        return None
    
    def get_abattoir_destinataire(self, obj):
        """Retourne l'abattoir destinataire via le transfert"""
        if obj.transfert:
            return AbattoirSimpleSerializer(obj.transfert.abattoir_destinataire).data
        return None
    
    def validate(self, data):
        """Validation personnalisée"""
        # Vérifier que le transfert existe
        transfert_id = data.get('transfert_id')
        if transfert_id:
            try:
                transfert = Transfert.objects.get(id=transfert_id)
                data['nombre_betes_attendues'] = transfert.nombre_betes
            except Transfert.DoesNotExist:
                raise serializers.ValidationError("Transfert introuvable")
        
        return data


class ReceptionListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour la liste des réceptions"""
    
    transfert = TransfertListSerializer(read_only=True)
    cree_par = UserSimpleSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    taux_reception = serializers.ReadOnlyField()
    
    class Meta:
        model = Reception
        fields = [
            'id', 'numero_reception', 'transfert',
            'nombre_betes_attendues', 'nombre_betes_recues',
            'statut', 'statut_display', 'taux_reception',
            'date_creation', 'date_reception', 'cree_par'
        ]


class ConfirmerReceptionSerializer(serializers.Serializer):
    """Sérialiseur pour confirmer une réception"""
    
    nombre_betes_recues = serializers.IntegerField(min_value=0)
    betes_manquantes = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    note = serializers.CharField(required=False, allow_blank=True)
    
    def validate_nombre_betes_recues(self, value):
        """Validation du nombre de bêtes reçues"""
        reception = self.context.get('reception')
        if reception and value > reception.nombre_betes_attendues:
            raise serializers.ValidationError(
                "Le nombre de bêtes reçues ne peut pas dépasser le nombre attendu"
            )
        return value


class AnnulerReceptionSerializer(serializers.Serializer):
    """Sérialiseur pour annuler une réception"""
    
    motif_annulation = serializers.CharField(required=False, allow_blank=True)


class TransfertStatsSerializer(serializers.Serializer):
    """Sérialiseur pour les statistiques des transferts"""
    
    total_transferts = serializers.IntegerField()
    transferts_en_cours = serializers.IntegerField()
    transferts_livres = serializers.IntegerField()
    transferts_annules = serializers.IntegerField()
    total_betes_transferees = serializers.IntegerField()
    taux_livraison = serializers.FloatField()


class ReceptionStatsSerializer(serializers.Serializer):
    """Sérialiseur pour les statistiques des réceptions"""
    
    total_receptions = serializers.IntegerField()
    receptions_en_attente = serializers.IntegerField()
    receptions_completes = serializers.IntegerField()
    receptions_partielles = serializers.IntegerField()
    receptions_annulees = serializers.IntegerField()
    total_betes_recues = serializers.IntegerField()
    taux_reception = serializers.FloatField()

