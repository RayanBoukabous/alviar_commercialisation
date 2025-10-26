from django.core.management.base import BaseCommand
from abattoir.models import Stabulation
from bete.models import Bete


class Command(BaseCommand):
    help = 'Teste la finalisation d\'une stabulation pour créer des bêtes abattues'

    def handle(self, *args, **options):
        self.stdout.write('🧪 Test de finalisation de stabulation...')
        
        # Récupérer une stabulation en cours avec des bêtes
        stabulation = Stabulation.objects.filter(
            statut='EN_COURS',
            betes__isnull=False
        ).first()
        
        if not stabulation:
            self.stdout.write(
                self.style.WARNING('❌ Aucune stabulation en cours avec des bêtes trouvée')
            )
            return
        
        betes_count = stabulation.betes.count()
        self.stdout.write(f'📋 Stabulation trouvée: {stabulation.numero_stabulation}')
        self.stdout.write(f'🐄 Nombre de bêtes: {betes_count}')
        
        # Afficher les bêtes avant finalisation
        self.stdout.write('\n🐄 Bêtes avant finalisation:')
        for bete in stabulation.betes.all():
            self.stdout.write(f'  - {bete.num_boucle} (ID: {bete.id}) - Statut: {bete.statut}')
        
        # Finaliser la stabulation
        self.stdout.write('\n🔄 Finalisation de la stabulation...')
        stabulation.terminer_stabulation()
        
        # Vérifier les bêtes après finalisation
        self.stdout.write('\n✅ Bêtes après finalisation:')
        for bete in stabulation.betes.all():
            bete.refresh_from_db()  # Recharger depuis la DB
            self.stdout.write(f'  - {bete.num_boucle} (ID: {bete.id}) - Statut: {bete.statut}')
        
        # Vérifier le statut de la stabulation
        stabulation.refresh_from_db()
        self.stdout.write(f'\n📊 Statut de la stabulation: {stabulation.statut}')
        
        # Compter les bêtes abattues
        betes_abattues = Bete.objects.filter(statut='ABATTU').count()
        self.stdout.write(f'🎯 Total bêtes abattues dans le système: {betes_abattues}')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Test terminé: {betes_count} bêtes finalisées')
        )
