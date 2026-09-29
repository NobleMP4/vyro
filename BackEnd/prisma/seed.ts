/**
 * VYRO seed — reference data only.
 *
 * This seed never creates users or user-owned data. It only upserts the
 * shared exercise catalog, keyed on `slug`, so it is safe to run repeatedly.
 * Activity types, badges and demo challenges are added with their phases.
 */
import {
  Difficulty,
  Equipment,
  ExerciseTrackingType,
  MuscleGroup,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

interface CatalogExercise {
  slug: string;
  name: string;
  description: string;
  instructions: string;
  tips: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  trackingType: ExerciseTrackingType;
}

const exercises: CatalogExercise[] = [
  {
    slug: 'bench-press',
    name: 'Développé couché',
    description: 'Exercice polyarticulaire de référence pour les pectoraux.',
    instructions:
      'Allongé sur le banc, pieds au sol, descends la barre contrôlée jusqu’au milieu de la poitrine puis pousse jusqu’à l’extension des bras.',
    tips: 'Garde les omoplates serrées et les coudes à environ 45° du buste.',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'back-squat',
    name: 'Squat',
    description: 'Mouvement fondamental pour le bas du corps.',
    instructions:
      'Barre sur les trapèzes, descends en poussant les hanches vers l’arrière jusqu’à ce que les cuisses soient au moins parallèles au sol, puis remonte.',
    tips: 'Genoux dans l’axe des pieds, dos neutre, poids réparti sur tout le pied.',
    muscleGroup: MuscleGroup.QUADRICEPS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.CORE],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'deadlift',
    name: 'Soulevé de terre',
    description: 'Mouvement de tirage complet sollicitant toute la chaîne postérieure.',
    instructions:
      'Barre au-dessus du milieu du pied, saisis-la, gaine-toi puis pousse dans le sol en gardant la barre près des jambes jusqu’à la position debout.',
    tips: 'Ne jamais arrondir le bas du dos. Commence léger pour maîtriser la technique.',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.FOREARMS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.ADVANCED,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'pull-up',
    name: 'Tractions',
    description: 'Exercice au poids du corps pour le dos et les biceps.',
    instructions:
      'Suspendu à la barre, mains en pronation, tire jusqu’à passer le menton au-dessus de la barre puis redescends lentement.',
    tips: 'Évite l’élan. Utilise un élastique pour progresser si nécessaire.',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.REPS,
  },
  {
    slug: 'overhead-press',
    name: 'Développé militaire',
    description: 'Poussée verticale pour les épaules.',
    instructions:
      'Debout, barre au niveau des clavicules, pousse au-dessus de la tête jusqu’à l’extension complète des bras.',
    tips: 'Serre les fessiers et les abdominaux pour ne pas cambrer.',
    muscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.CORE],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'dumbbell-curl',
    name: 'Curl biceps',
    description: 'Exercice d’isolation des biceps.',
    instructions:
      'Debout, haltères en mains, fléchis les coudes pour monter les charges puis redescends sous contrôle.',
    tips: 'Garde les coudes collés au corps et évite de balancer le buste.',
    muscleGroup: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'triceps-pushdown',
    name: 'Extension triceps',
    description: 'Isolation des triceps à la poulie haute.',
    instructions:
      'Face à la poulie, coudes fixes le long du corps, pousse la barre vers le bas jusqu’à l’extension complète.',
    tips: 'Seuls les avant-bras bougent.',
    muscleGroup: MuscleGroup.TRICEPS,
    equipment: Equipment.CABLE,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'barbell-row',
    name: 'Rowing barre',
    description: 'Tirage horizontal pour l’épaisseur du dos.',
    instructions:
      'Buste penché, dos plat, tire la barre vers le bas du ventre puis redescends sous contrôle.',
    tips: 'Serre les omoplates en fin de mouvement.',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'push-up',
    name: 'Pompes',
    description: 'Poussée au poids du corps.',
    instructions:
      'Mains un peu plus larges que les épaules, corps gainé, descends la poitrine près du sol puis pousse.',
    tips: 'Le corps reste aligné de la tête aux talons.',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS, MuscleGroup.CORE],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.REPS,
  },
  {
    slug: 'lunge',
    name: 'Fentes',
    description: 'Exercice unilatéral pour les jambes et l’équilibre.',
    instructions:
      'Fais un grand pas en avant, descends jusqu’à ce que le genou arrière frôle le sol puis reviens.',
    tips: 'Le genou avant ne doit pas rentrer vers l’intérieur.',
    muscleGroup: MuscleGroup.QUADRICEPS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'romanian-deadlift',
    name: 'Soulevé de terre roumain',
    description: 'Charnière de hanche ciblant les ischio-jambiers.',
    instructions:
      'Jambes légèrement fléchies, descends la barre le long des cuisses en poussant les hanches en arrière, puis remonte.',
    tips: 'Arrête la descente dès que le dos commence à s’arrondir.',
    muscleGroup: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.BACK],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'hip-thrust',
    name: 'Hip thrust',
    description: 'Extension de hanche pour les fessiers.',
    instructions:
      'Haut du dos sur un banc, barre sur les hanches, pousse les hanches vers le haut jusqu’à l’alignement buste-cuisses.',
    tips: 'Menton rentré, contracte les fessiers en haut du mouvement.',
    muscleGroup: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'lat-pulldown',
    name: 'Tirage vertical',
    description: 'Tirage à la poulie haute pour les dorsaux.',
    instructions:
      'Assis, cuisses bloquées, tire la barre vers le haut de la poitrine puis remonte lentement.',
    tips: 'Tire avec les coudes, pas avec les mains.',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: Equipment.CABLE,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'leg-press',
    name: 'Presse à cuisses',
    description: 'Poussée guidée pour les jambes.',
    instructions:
      'Pieds à largeur d’épaules sur la plateforme, descends jusqu’à 90° de flexion puis pousse.',
    tips: 'Ne verrouille pas complètement les genoux en haut.',
    muscleGroup: MuscleGroup.QUADRICEPS,
    secondaryMuscles: [MuscleGroup.GLUTES],
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'lateral-raise',
    name: 'Élévations latérales',
    description: 'Isolation du deltoïde moyen.',
    instructions:
      'Haltères le long du corps, monte les bras sur les côtés jusqu’à hauteur d’épaules, puis redescends lentement.',
    tips: 'Utilise une charge légère et évite de hausser les épaules.',
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'standing-calf-raise',
    name: 'Mollets debout',
    description: 'Isolation des mollets.',
    instructions:
      'Sur la pointe des pieds, monte le plus haut possible puis redescends en étirement.',
    tips: 'Marque une pause en haut et en bas.',
    muscleGroup: MuscleGroup.CALVES,
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
  {
    slug: 'plank',
    name: 'Gainage',
    description: 'Exercice isométrique pour la sangle abdominale.',
    instructions: 'En appui sur les avant-bras et les pointes de pieds, maintiens le corps aligné.',
    tips: 'Respire normalement, ne laisse pas les hanches descendre.',
    muscleGroup: MuscleGroup.CORE,
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.DURATION,
  },
  {
    slug: 'dips',
    name: 'Dips',
    description: 'Poussée au poids du corps pour triceps et pectoraux.',
    instructions:
      'En appui sur les barres parallèles, descends jusqu’à 90° de flexion des coudes puis remonte.',
    tips: 'Buste droit pour les triceps, penché pour les pectoraux.',
    muscleGroup: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.REPS,
  },
  {
    slug: 'rowing-machine',
    name: 'Rameur',
    description: 'Cardio complet sur ergomètre.',
    instructions:
      'Pousse avec les jambes, puis bascule le buste et tire la poignée vers le bas des côtes.',
    tips: 'Ordre : jambes, buste, bras — puis l’inverse au retour.',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscles: [MuscleGroup.BACK, MuscleGroup.QUADRICEPS],
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    trackingType: ExerciseTrackingType.DISTANCE_DURATION,
  },
  {
    slug: 'kettlebell-swing',
    name: 'Kettlebell swing',
    description: 'Mouvement balistique de charnière de hanche.',
    instructions:
      'Kettlebell entre les jambes, projette-la jusqu’à hauteur de poitrine grâce à une extension explosive des hanches.',
    tips: 'Ce sont les hanches qui travaillent, pas les bras.',
    muscleGroup: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.CORE],
    equipment: Equipment.KETTLEBELL,
    difficulty: Difficulty.INTERMEDIATE,
    trackingType: ExerciseTrackingType.WEIGHT_REPS,
  },
];

async function main(): Promise<void> {
  for (const { slug, secondaryMuscles, ...data } of exercises) {
    const payload = { ...data, secondaryMuscles: secondaryMuscles ?? [] };
    await prisma.exercise.upsert({
      where: { slug },
      create: { slug, ...payload },
      update: payload,
    });
  }
  console.log(`Seed : ${exercises.length} exercices du catalogue synchronisés.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
