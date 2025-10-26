from django.core.management.base import BaseCommand
from abattoir.models import Stabulation
from bete.models import Bete


class Command(BaseCommand):
    help = 'Synchronise les statuts des bêtes avec les stabulations pour assurer la cohérence des données'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Affiche ce qui serait fait sans effectuer les modifications',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Mode dry-run activé - aucune modification ne sera effectuée'))
        
        # 1. Mettre à jour les bêtes dans les stabulations EN_COURS
        stabulations_en_cours = Stabulation.objects.filter(statut='EN_COURS')
        betes_updated_to_stabulation = 0
        
        for stab in stabulations_en_cours:
            betes_in_stab = stab.betes.filter(statut__ne='EN_STABULATION')
            if betes_in_stab.exists():
                if not dry_run:
                    betes_in_stab.update(statut='EN_STABULATION')
                betes_updated_to_stabulation += betes_in_stab.count()
                self.stdout.write(
                    f'Stabulation {stab.numero_stabulation}: {betes_in_stab.count()} bêtes mises à jour vers EN_STABULATION'
                )
        
        # 2. Remettre les bêtes des stabulations terminées/annulées au statut VIVANT
        stabulations_finished = Stabulation.objects.filter(statut__in=['TERMINE', 'ANNULE'])
        betes_updated_to_vivant = 0
        
        for stab in stabulations_finished:
            betes_in_stab = stab.betes.filter(statut='EN_STABULATION')
            if betes_in_stab.exists():
                if not dry_run:
                    betes_in_stab.update(statut='VIVANT')
                betes_updated_to_vivant += betes_in_stab.count()
                self.stdout.write(
                    f'Stabulation {stab.numero_stabulation} ({stab.statut}): {betes_in_stab.count()} bêtes remises à VIVANT'
                )
        
        # 3. Vérifier les bêtes orphelines (EN_STABULATION mais pas dans une stabulation EN_COURS)
        betes_orphelines = Bete.objects.filter(statut='EN_STABULATION').exclude(
            stabulations__statut='EN_COURS'
        )
        
        if betes_orphelines.exists():
            self.stdout.write(
                self.style.WARNING(f'{betes_orphelines.count()} bêtes orphelines trouvées (EN_STABULATION mais pas dans une stabulation EN_COURS)')
            )
            if not dry_run:
                betes_orphelines.update(statut='VIVANT')
                self.stdout.write(f'{betes_orphelines.count()} bêtes orphelines remises à VIVANT')
        
        # Résumé
        self.stdout.write(self.style.SUCCESS('\n=== RÉSUMÉ ==='))
        self.stdout.write(f'Bêtes mises à jour vers EN_STABULATION: {betes_updated_to_stabulation}')
        self.stdout.write(f'Bêtes remises à VIVANT: {betes_updated_to_vivant}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Mode dry-run - aucune modification effectuée'))
        else:
            self.stdout.write(self.style.SUCCESS('Synchronisation terminée avec succès'))
