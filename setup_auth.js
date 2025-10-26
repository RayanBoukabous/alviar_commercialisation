#!/usr/bin/env node

/**
 * Script pour configurer l'authentification dans le frontend
 * Ce script configure le localStorage avec le token d'authentification
 */

const token = 'd79c5797219ba347c138077104375776b80674a9';
const userData = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  is_superuser: true,
  is_staff: true,
  abattoir: {
    id: 6,
    nom: 'Abattoir de Test',
    wilaya: 'Blida',
    commune: 'Blida'
  }
};

console.log('🔧 Configuration de l\'authentification frontend...');
console.log(`🔑 Token: ${token}`);
console.log(`👤 Utilisateur: ${userData.username}`);
console.log(`🏢 Abattoir: ${userData.abattoir.nom}`);

// Instructions pour l'utilisateur
console.log('\n📝 Instructions:');
console.log('1. Ouvrez les outils de développement du navigateur (F12)');
console.log('2. Allez dans l\'onglet "Application" ou "Storage"');
console.log('3. Dans "Local Storage", sélectionnez "http://localhost:3000"');
console.log('4. Ajoutez les clés suivantes:');
console.log(`   - django_token: ${token}`);
console.log(`   - django_user: ${JSON.stringify(userData)}`);

console.log('\n🌐 Ou utilisez cette commande dans la console du navigateur:');
console.log(`
localStorage.setItem('django_token', '${token}');
localStorage.setItem('django_user', '${JSON.stringify(userData)}');
`);

console.log('\n✅ Après avoir configuré le localStorage, rechargez la page.');
console.log('🎉 L\'erreur "Erreur lors du chargement des abattoirs" devrait être résolue!');
