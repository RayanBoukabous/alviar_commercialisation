from django.core.management.base import BaseCommand
from abattoir.models import Stabulation
from bete.models import Bete


class Command(BaseCommand):
    help = 'Corrige le statut des bêtes qui sont dans les stabulations mais n\'ont pas le statut EN_STABULATION'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Correction des statuts des bêtes en stabulation...')
        
        # Récupérer toutes les stabulations actives
        stabulations = Stabulation.objects.filter(statut='EN_COURS')
        total_corrigees = 0
        
        for stabulation in stabulations:
            # Récupérer les bêtes de cette stabulation
            betes_en_stabulation = stabulation.betes.all()
            
            if betes_en_stabulation.exists():
                # Identifier les bêtes qui n'ont pas le bon statut
                betes_incorrectes = betes_en_stabulation.filter(statut='VIVANT')
                
                if betes_incorrectes.exists():
                    # Corriger le statut
                    betes_incorrectes.update(statut='EN_STABULATION')
                    count = betes_incorrectes.count()
                    total_corrigees += count
                    
                    self.stdout.write(
                        f'✅ Stabulation {stabulation.numero_stabulation}: {count} bêtes corrigées'
                    )
                else:
                    self.stdout.write(
                        f'✅ Stabulation {stabulation.numero_stabulation}: toutes les bêtes ont le bon statut'
                    )
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Correction terminée: {total_corrigees} bêtes corrigées au total')
        )
        
        # Vérification finale
        betes_en_stabulation_count = Bete.objects.filter(statut='EN_STABULATION').count()
        self.stdout.write(f'📊 Nombre total de bêtes avec statut EN_STABULATION: {betes_en_stabulation_count}')
