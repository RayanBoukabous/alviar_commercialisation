-- Script SQL pour ajouter les champs de suivi des actions à la table stabulation
-- À exécuter manuellement si les migrations ne fonctionnent pas

-- Ajouter les colonnes pour le suivi des actions d'annulation
ALTER TABLE abattoir_stabulation 
ADD COLUMN annule_par_id INTEGER NULL,
ADD COLUMN date_annulation TIMESTAMP NULL,
ADD COLUMN raison_annulation TEXT NULL;

-- Ajouter les colonnes pour le suivi des actions de finalisation  
ALTER TABLE abattoir_stabulation
ADD COLUMN finalise_par_id INTEGER NULL,
ADD COLUMN date_finalisation TIMESTAMP NULL;

-- Ajouter les contraintes de clés étrangères
ALTER TABLE abattoir_stabulation 
ADD CONSTRAINT fk_stabulation_annule_par 
FOREIGN KEY (annule_par_id) REFERENCES users_user(id) ON DELETE SET NULL;

ALTER TABLE abattoir_stabulation 
ADD CONSTRAINT fk_stabulation_finalise_par 
FOREIGN KEY (finalise_par_id) REFERENCES users_user(id) ON DELETE SET NULL;

-- Ajouter les index pour améliorer les performances
CREATE INDEX idx_stabulation_annule_par ON abattoir_stabulation(annule_par_id);
CREATE INDEX idx_stabulation_finalise_par ON abattoir_stabulation(finalise_par_id);
CREATE INDEX idx_stabulation_date_annulation ON abattoir_stabulation(date_annulation);
CREATE INDEX idx_stabulation_date_finalisation ON abattoir_stabulation(date_finalisation);


