from rest_framework import serializers
from .models import Abattoir, ChambreFroide, HistoriqueChambreFroide, Stabulation, HistoriqueStabulation


class AbattoirSerializer(serializers.ModelSerializer):
    """Serializer pour les abattoirs"""
    
    responsable_nom = serializers.CharField(source='responsable.get_full_name', read_only=True)
    adresse_complete = serializers.ReadOnlyField()
    capacite_totale_reception = serializers.ReadOnlyField()
    capacite_totale_stabulation = serializers.ReadOnlyField()
    betes_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Abattoir
        fields = [
            'id', 'nom', 'wilaya', 'commune', 'adresse_complete', 'telephone', 'email',
            'capacite_reception_ovin', 'capacite_reception_bovin', 
            'capacite_stabulation_ovin', 'capacite_stabulation_bovin',
            'capacite_totale_reception', 'capacite_totale_stabulation', 'actif', 
            'responsable', 'responsable_nom', 'betes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'adresse_complete', 
                           'capacite_totale_reception', 'capacite_totale_stabulation', 'betes_count']


class ChambreFroideSerializer(serializers.ModelSerializer):
    """Serializer pour les chambres froides"""
    
    abattoir_nom = serializers.CharField(source='abattoir.nom', read_only=True)
    nombre_mesures = serializers.SerializerMethodField()
    derniere_temperature = serializers.SerializerMethodField()
    
    class Meta:
        model = ChambreFroide
        fields = [
            'id', 'abattoir', 'abattoir_nom', 'numero', 'dimensions_m3',
            'nombre_mesures', 'derniere_temperature', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'nombre_mesures', 'derniere_temperature']
    
    def get_nombre_mesures(self, obj):
        """Retourne le nombre de mesures de température"""
        return obj.historique_temperatures.count()
    
    def get_derniere_temperature(self, obj):
        """Retourne la dernière température enregistrée"""
        derniere_mesure = obj.historique_temperatures.first()
        return derniere_mesure.temperature if derniere_mesure else None


class HistoriqueChambreFroideSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des températures"""
    
    chambre_froide_numero = serializers.CharField(source='chambre_froide.numero', read_only=True)
    abattoir_nom = serializers.CharField(source='chambre_froide.abattoir.nom', read_only=True)
    mesure_par_nom = serializers.CharField(source='nom_utilisateur', read_only=True)
    mesure_par_username = serializers.CharField(source='mesure_par.username', read_only=True)
    
    class Meta:
        model = HistoriqueChambreFroide
        fields = [
            'id', 'chambre_froide', 'chambre_froide_numero', 'abattoir_nom',
            'temperature', 'date_mesure', 'mesure_par', 'mesure_par_nom', 'mesure_par_username',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'mesure_par_nom', 'mesure_par_username']


class AbattoirStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des abattoirs"""
    
    total_abattoirs = serializers.IntegerField()
    abattoirs_actifs = serializers.IntegerField()
    abattoirs_par_wilaya = serializers.DictField()
    capacite_totale_ovin = serializers.IntegerField()
    capacite_totale_bovin = serializers.IntegerField()
    capacite_totale_stabulation = serializers.IntegerField()
    total_chambres_froides = serializers.IntegerField()
    capacite_totale_chambres_froides = serializers.DecimalField(max_digits=12, decimal_places=2)


class StabulationSerializer(serializers.ModelSerializer):
    """Serializer pour les stabulations"""
    
    abattoir_nom = serializers.CharField(source='abattoir.nom', read_only=True)
    abattoir_wilaya = serializers.CharField(source='abattoir.wilaya', read_only=True)
    abattoir_commune = serializers.CharField(source='abattoir.commune', read_only=True)
    created_by_nom = serializers.SerializerMethodField()
    
    # Suivi des actions
    annule_par_nom = serializers.SerializerMethodField()
    finalise_par_nom = serializers.SerializerMethodField()
    
    # Propriétés calculées
    nombre_betes_actuelles = serializers.ReadOnlyField()
    capacite_maximale = serializers.ReadOnlyField()
    taux_occupation = serializers.ReadOnlyField()
    duree_stabulation_heures = serializers.ReadOnlyField()
    duree_stabulation_formatee = serializers.ReadOnlyField()
    est_pleine = serializers.ReadOnlyField()
    places_disponibles = serializers.ReadOnlyField()
    
    # Informations sur les bêtes
    betes_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Stabulation
        fields = [
            'id', 'numero_stabulation', 'abattoir', 'abattoir_nom', 'abattoir_wilaya', 'abattoir_commune',
            'type_bete', 'statut', 'date_debut', 'date_fin', 'notes',
            'nombre_betes_actuelles', 'capacite_maximale', 'taux_occupation', 
            'duree_stabulation_heures', 'duree_stabulation_formatee', 'est_pleine', 'places_disponibles',
            'betes', 'betes_info', 'created_by', 'created_by_nom',
            'annule_par', 'annule_par_nom', 'date_annulation', 'raison_annulation',
            'finalise_par', 'finalise_par_nom', 'date_finalisation',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'nombre_betes_actuelles', 
            'capacite_maximale', 'taux_occupation', 'duree_stabulation_heures', 'duree_stabulation_formatee',
            'est_pleine', 'places_disponibles', 'betes_info', 'created_by_nom',
            'annule_par_nom', 'finalise_par_nom'
        ]
    
    def get_created_by_nom(self, obj):
        """Retourne le nom complet du créateur"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
    
    def get_annule_par_nom(self, obj):
        """Retourne le nom complet de l'utilisateur qui a annulé"""
        if obj.annule_par:
            return obj.annule_par.get_full_name() or obj.annule_par.username
        return None
    
    def get_finalise_par_nom(self, obj):
        """Retourne le nom complet de l'utilisateur qui a finalisé"""
        if obj.finalise_par:
            return obj.finalise_par.get_full_name() or obj.finalise_par.username
        return None
    
    def get_betes_info(self, obj):
        """Retourne des informations sur les bêtes en stabulation"""
        betes = obj.betes.all()
        return [
            {
                'id': bete.id,
                'num_boucle': bete.num_boucle,
                'nom': f"{bete.num_boucle} - {bete.espece.nom if bete.espece else 'N/A'}",
                'espece': bete.espece.nom if bete.espece else None,
                'race': None,  # Pas de champ race dans le modèle Bete
                'poids': float(bete.poids_vif) if bete.poids_vif else None,
                'statut': bete.statut,
                'etat_sante': bete.etat_sante,
                'sexe': bete.get_sexe_display(),
                'abattage_urgence': bete.abattage_urgence,
                'notes': bete.notes,
                'created_at': bete.created_at.isoformat() if bete.created_at else None,
            }
            for bete in betes
        ]
    
    def validate_numero_stabulation(self, value):
        """Valide l'unicité du numéro de stabulation"""
        if self.instance and self.instance.numero_stabulation == value:
            return value
        
        if Stabulation.objects.filter(numero_stabulation=value).exists():
            raise serializers.ValidationError("Ce numéro de stabulation existe déjà.")
        return value
    
    def validate(self, data):
        """Validation globale"""
        # Vérifier que la date de fin est après la date de début
        if data.get('date_fin') and data.get('date_debut'):
            if data['date_fin'] <= data['date_debut']:
                raise serializers.ValidationError(
                    "La date de fin doit être postérieure à la date de début."
                )
        
        # Vérifier la capacité selon le type de bête
        abattoir = data.get('abattoir')
        type_bete = data.get('type_bete')
        
        if abattoir and type_bete:
            if type_bete == 'BOVIN' and abattoir.capacite_stabulation_bovin == 0:
                raise serializers.ValidationError(
                    "Cet abattoir n'a pas de capacité de stabulation pour les bovins."
                )
            elif type_bete == 'OVIN' and abattoir.capacite_stabulation_ovin == 0:
                raise serializers.ValidationError(
                    "Cet abattoir n'a pas de capacité de stabulation pour les ovins."
                )
        
        return data


class StabulationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de stabulations"""
    
    automatic_count = serializers.IntegerField(required=False, min_value=1, allow_null=True, write_only=True)
    type_bete = serializers.CharField()  # Override pour gérer la conversion
    
    class Meta:
        model = Stabulation
        fields = [
            'abattoir', 'type_bete', 'date_debut', 
            'notes', 'betes', 'automatic_count'
        ]
    
    def validate_date_debut(self, value):
        """Valide que la date de début n'est pas dans le passé"""
        from django.utils import timezone
        from datetime import datetime, date
        
        if value:
            # Convertir en date (sans heure) pour la comparaison
            selected_date = value.date() if hasattr(value, 'date') else value
            today = timezone.now().date()
            
            if selected_date < today:
                raise serializers.ValidationError(
                    "Impossible de créer un ordre d'abattage avec une date d'hier ou antérieure."
                )
        
        return value
    
    def validate_automatic_count(self, value):
        """Valide le nombre d'animaux pour la sélection automatique"""
        if value is not None:
            # Vérifier que le nombre ne dépasse pas la capacité maximale
            abattoir_id = self.initial_data.get('abattoir')
            type_bete = self.initial_data.get('type_bete')
            
            if abattoir_id and type_bete:
                try:
                    from .models import Abattoir
                    abattoir = Abattoir.objects.get(id=abattoir_id)
                    
                    # Déterminer la capacité selon le type de bête
                    if type_bete == 'BOVIN':
                        capacite_max = abattoir.capacite_stabulation_bovin or 50
                    elif type_bete in ['OVIN', 'CAPRIN']:
                        capacite_max = abattoir.capacite_stabulation_ovin or 100
                    else:
                        capacite_max = 100
                    
                    if value > capacite_max:
                        raise serializers.ValidationError(
                            f"Le nombre d'animaux ({value}) dépasse la capacité maximale de l'abattoir ({capacite_max})."
                        )
                except Abattoir.DoesNotExist:
                    pass
        
        return value
    
    def validate_betes(self, value):
        """Valide que les bêtes sont du bon type"""
        if not value:
            return value
        
        type_bete = self.initial_data.get('type_bete')
        if not type_bete:
            return value
        
        for bete in value:
            if bete.espece.nom.upper() != type_bete.upper():
                raise serializers.ValidationError(
                    f"La bête {bete.num_boucle} n'est pas de type {type_bete}."
                )
        
        return value
    
    def validate_type_bete(self, value):
        """Normaliser le type de bête en majuscules"""
        if not value:
            return value
            
        # Mapping des noms formatés vers les codes
        mapping = {
            'Bovin': 'BOVIN',
            'Ovin': 'OVIN', 
            'Caprin': 'CAPRIN',
            'Autre': 'AUTRE',
            # Ajouter aussi les variantes possibles
            'bovin': 'BOVIN',
            'ovin': 'OVIN',
            'caprin': 'CAPRIN',
            'autre': 'AUTRE',
            'BOVIN': 'BOVIN',
            'OVIN': 'OVIN',
            'CAPRIN': 'CAPRIN',
            'AUTRE': 'AUTRE'
        }
        
        # Essayer le mapping d'abord
        normalized_value = mapping.get(value)
        if normalized_value:
            return normalized_value
            
        # Si pas trouvé, convertir en majuscules
        return value.upper()

    def validate(self, data):
        """Validation globale pour s'assurer qu'on a soit des bêtes, soit un nombre automatique"""
        betes = data.get('betes', [])
        automatic_count = data.get('automatic_count')
        
        # Si pas de bêtes sélectionnées et pas de nombre automatique
        if not betes and not automatic_count:
            raise serializers.ValidationError(
                "Vous devez soit sélectionner des bêtes, soit spécifier un nombre pour la sélection automatique."
            )
        
        # Si les deux sont fournis, priorité aux bêtes sélectionnées
        if betes and automatic_count:
            # On ignore automatic_count si des bêtes sont sélectionnées
            data['automatic_count'] = None
        
        return data
    
    def validate_abattoir(self, value):
        """Validation des permissions pour l'abattoir"""
        user = self.context['request'].user
        
        # Si l'utilisateur n'est pas superuser, forcer son abattoir
        if not user.is_superuser:
            if not user.abattoir:
                raise serializers.ValidationError(
                    "Vous n'êtes pas assigné à un abattoir. Contactez l'administrateur."
                )
            
            # Forcer l'abattoir de l'utilisateur
            return user.abattoir
        
        # Superuser peut choisir n'importe quel abattoir
        return value
    
    def create(self, validated_data):
        """Override create pour gérer automatic_count"""
        # Extraire automatic_count des données validées
        automatic_count = validated_data.pop('automatic_count', None)
        
        # Créer la stabulation sans automatic_count
        stabulation = super().create(validated_data)
        
        # Stocker automatic_count dans l'instance pour l'utiliser dans la vue
        stabulation._automatic_count = automatic_count
        
        return stabulation


class StabulationUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour de stabulations avec historique"""
    
    class Meta:
        model = Stabulation
        fields = ['date_debut', 'notes', 'betes']
    
    def validate(self, data):
        """Validation pour s'assurer que la stabulation peut être modifiée"""
        instance = self.instance
        
        if instance.statut not in ['EN_COURS']:
            raise serializers.ValidationError(
                f"Impossible de modifier une stabulation {instance.get_statut_display().lower()}"
            )
        
        return data
    
    def update(self, instance, validated_data):
        """Mise à jour avec enregistrement de l'historique"""
        user = self.context['request'].user
        
        # Enregistrer les modifications dans l'historique
        for field, new_value in validated_data.items():
            old_value = getattr(instance, field)
            
            # Pour les bêtes, comparer les listes d'IDs
            if field == 'betes':
                old_betes_ids = set(instance.betes.values_list('id', flat=True))
                new_betes_ids = set([b.id for b in new_value] if new_value else [])
                
                if old_betes_ids != new_betes_ids:
                    instance.enregistrer_modification(
                        user, 
                        'betes', 
                        list(old_betes_ids), 
                        list(new_betes_ids)
                    )
            else:
                # Pour les autres champs
                if old_value != new_value:
                    instance.enregistrer_modification(
                        user, 
                        field, 
                        old_value, 
                        new_value
                    )
        
        # Effectuer la mise à jour
        return super().update(instance, validated_data)


class HistoriqueStabulationSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des modifications"""
    
    utilisateur_nom = serializers.CharField(source='utilisateur.get_full_name', read_only=True)
    utilisateur_username = serializers.CharField(source='utilisateur.username', read_only=True)
    
    class Meta:
        model = HistoriqueStabulation
        fields = [
            'id', 'champ_modifie', 'ancienne_valeur', 'nouvelle_valeur',
            'date_modification', 'utilisateur_nom', 'utilisateur_username'
        ]


class StabulationStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des stabulations"""
    
    total_stabulations = serializers.IntegerField()
    stabulations_en_cours = serializers.IntegerField()
    stabulations_terminees = serializers.IntegerField()
    stabulations_annulees = serializers.IntegerField()
    stabulations_par_type = serializers.DictField()
    taux_occupation_moyen = serializers.FloatField()
    total_betes_en_stabulation = serializers.IntegerField()
