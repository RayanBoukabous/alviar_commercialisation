from django.core.management.base import BaseCommand
from abattoir.models import Stabulation
from bete.models import Bete


class Command(BaseCommand):
    help = 'Corrige les statuts des bêtes dans les stabulations pour assurer la cohérence des données'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Affiche ce qui serait fait sans effectuer les modifications',
        )
        parser.add_argument(
            '--stabulation-id',
            type=int,
            help='Corriger seulement une stabulation spécifique',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        stabulation_id = options.get('stabulation_id')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Mode dry-run activé - aucune modification ne sera effectuée'))
        
        # Filtrer les stabulations à traiter
        if stabulation_id:
            stabulations = Stabulation.objects.filter(id=stabulation_id)
            if not stabulations.exists():
                self.stdout.write(self.style.ERROR(f'Stabulation ID {stabulation_id} non trouvée'))
                return
        else:
            stabulations = Stabulation.objects.all()
        
        total_corrected = 0
        
        for stab in stabulations:
            self.stdout.write(f'\n🔍 Traitement de la stabulation {stab.id} ({stab.numero_stabulation}) - Statut: {stab.statut}')
            
            if stab.statut == 'EN_COURS':
                # Bêtes dans stabulation EN_COURS doivent être EN_STABULATION
                betes_vivant = stab.betes.filter(statut='VIVANT')
                if betes_vivant.exists():
                    self.stdout.write(f'  ⚠️  {betes_vivant.count()} bêtes avec statut VIVANT dans stabulation EN_COURS')
                    if not dry_run:
                        corrected = betes_vivant.update(statut='EN_STABULATION')
                        total_corrected += corrected
                        self.stdout.write(f'  ✅ {corrected} bêtes mises au statut EN_STABULATION')
                    else:
                        self.stdout.write(f'  🔄 {betes_vivant.count()} bêtes seraient mises au statut EN_STABULATION')
                
                # Vérifier les bêtes avec d'autres statuts incorrects
                betes_autres = stab.betes.exclude(statut='EN_STABULATION')
                if betes_autres.exists():
                    self.stdout.write(f'  ⚠️  {betes_autres.count()} bêtes avec statut incorrect: {list(betes_autres.values_list("statut", flat=True))}')
                    if not dry_run:
                        corrected = betes_autres.update(statut='EN_STABULATION')
                        total_corrected += corrected
                        self.stdout.write(f'  ✅ {corrected} bêtes mises au statut EN_STABULATION')
            
            elif stab.statut == 'TERMINE':
                # Bêtes dans stabulation TERMINE doivent être ABATTU
                betes_non_abattu = stab.betes.exclude(statut='ABATTU')
                if betes_non_abattu.exists():
                    self.stdout.write(f'  ⚠️  {betes_non_abattu.count()} bêtes non abattues dans stabulation TERMINE')
                    if not dry_run:
                        corrected = betes_non_abattu.update(statut='ABATTU')
                        total_corrected += corrected
                        self.stdout.write(f'  ✅ {corrected} bêtes mises au statut ABATTU')
            
            elif stab.statut == 'ANNULE':
                # Bêtes dans stabulation ANNULE doivent être VIVANT
                betes_non_vivant = stab.betes.exclude(statut='VIVANT')
                if betes_non_vivant.exists():
                    self.stdout.write(f'  ⚠️  {betes_non_vivant.count()} bêtes non vivantes dans stabulation ANNULE')
                    if not dry_run:
                        corrected = betes_non_vivant.update(statut='VIVANT')
                        total_corrected += corrected
                        self.stdout.write(f'  ✅ {corrected} bêtes remises au statut VIVANT')
        
        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'\n🔍 Mode dry-run: {total_corrected} bêtes seraient corrigées'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Correction terminée: {total_corrected} bêtes corrigées'))
