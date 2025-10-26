from django.core.management.base import BaseCommand
from abattoir.models import Stabulation
from bete.models import Bete


class Command(BaseCommand):
    help = 'Corrige les stabulations terminées en mettant leurs bêtes au statut ABATTU'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Correction des stabulations terminées...')
        
        # Récupérer les stabulations terminées avec des bêtes
        stabulations_terminees = Stabulation.objects.filter(
            statut='TERMINE',
            betes__isnull=False
        )
        
        total_corrigees = 0
        
        for stabulation in stabulations_terminees:
            betes_count = stabulation.betes.count()
            self.stdout.write(f'\n📋 Stabulation: {stabulation.numero_stabulation}')
            self.stdout.write(f'🐄 Nombre de bêtes: {betes_count}')
            
            # Vérifier l'état actuel des bêtes
            betes_vivantes = stabulation.betes.filter(statut='VIVANT')
            betes_en_stabulation = stabulation.betes.filter(statut='EN_STABULATION')
            betes_abattues = stabulation.betes.filter(statut='ABATTU')
            
            self.stdout.write(f'  - VIVANT: {betes_vivantes.count()}')
            self.stdout.write(f'  - EN_STABULATION: {betes_en_stabulation.count()}')
            self.stdout.write(f'  - ABATTU: {betes_abattues.count()}')
            
            # Corriger les bêtes qui ne sont pas encore abattues
            betes_a_corriger = stabulation.betes.exclude(statut='ABATTU')
            if betes_a_corriger.exists():
                betes_a_corriger.update(statut='ABATTU')
                count = betes_a_corriger.count()
                total_corrigees += count
                self.stdout.write(f'  ✅ {count} bêtes corrigées au statut ABATTU')
            else:
                self.stdout.write(f'  ✅ Toutes les bêtes sont déjà au statut ABATTU')
        
        # Vérification finale
        betes_abattues_total = Bete.objects.filter(statut='ABATTU').count()
        self.stdout.write(f'\n📊 Total bêtes abattues dans le système: {betes_abattues_total}')
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Correction terminée: {total_corrigees} bêtes corrigées')
        )
