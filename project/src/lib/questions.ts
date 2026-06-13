export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  image?: string;
}

export const questions: Question[] = [
  {
    id: 1,
    question: '¿Cuándo y dónde nació Victoria?',
    options: [
      'Bosconia, Cesar, 17 jun 1956',
      'Dificil, Magdalena, 17 jun 1956',
      'Santa Marta, Magdalena, 12 mar 1956',
      'Aracataca, Magdalena, 17 jun 1954',
    ],
    correctIndex: 1,
    image: '/victoria-padres.gif',
    explanation: 'Todo gran viaje comienza con un primer capítulo.',
  },

  {
    id: 2,
    question: '¿Cuál es su comida favorita?',
    options: [
      'Sancocho',
      'Pasta con champiñones y verduras',
      'Arroz con pollo',
      'Ensalada César',
    ],
    correctIndex: 1,
    image: '/victoria-comida.gif',
    explanation: 'Los sabores favoritos también cuentan historias.',
  },

  {
    id: 3,
    question: '¿Cuál es su color favorito?',
    options: ['Azul', 'Verde', 'Rojo', 'Amarillo'],
    correctIndex: 2,
    image: '/victoria-color.gif',
    explanation: 'Un color puede decir mucho de una personalidad.',
  },

  {
    id: 4,
    question: '¿A qué hora se levanta todos los días?',
    options: ['6:00 a.m.', '5:00 a.m.', '7:00 a.m.', '4:00 a.m.'],
    correctIndex: 1,
    image: '/victoria-actual.gif',
    explanation: 'La disciplina ha sido una de sus grandes fortalezas.',
  },

  {
    id: 5,
    question: '¿Qué frase repite mucho?',
    options: [
      'Todo pasa por algo',
      'Hay que tener paciencia',
      'Si es la voluntad de Dios',
      'Mañana será otro día',
    ],
    correctIndex: 2,
    image: '/victoria-frase.gif',
    explanation: 'Una frase que refleja su fe y forma de ver la vida.',
  },

  {
    id: 6,
    question: '¿Qué le encanta hacer en las fiestas?',
    options: ['Bailar y cantar', 'Jugar cartas', 'Tomar fotos', 'Cocinar'],
    correctIndex: 0,
    image: '/victoria-bailando.gif',
    explanation: 'Donde hay música, siempre hay alegría.',
  },

  {
    id: 7,
    question: 'En 1997, en su trabajo de visitadora médica, ¿qué reconocimiento obtuvo?',
    options: [
      'Empresario Senior',
      'Mejor RMP de su zona',
      'Mejor vendedora del mes',
      'Premio de liderazgo',
    ],
    correctIndex: 1,
    image: '/victoria-rmp.gif',
    explanation: 'El esfuerzo siempre encuentra la forma de ser reconocido.',
  },

  {
    id: 8,
    question: '¿Qué título obtuvo el 18 de diciembre de 2015?',
    options: ['Contadora', 'Abogada', 'Psicóloga', 'Enfermera'],
    correctIndex: 2,
    image: '/victoria-psicologa.gif',
    explanation: 'Nunca es tarde para cumplir un sueño.',
  },

  {
    id: 9,
    question: '¿Cómo se llaman los nietos de Victoria?',
    options: [
      'Emmanuel y Luciana',
      'Santiago y Luciana',
      'Emmanuel y Valentina',
      'Samuel y Luciana',
    ],
    correctIndex: 0,
    image: '/victoria-nietos.gif',
    explanation: 'Emmanuel y Luciana son dos de las mayores alegrías de su vida.',
  },

  {
    id: 10,
    question: '¿Cómo se llama su nuera?',
    options: ['Karina', 'Camila', 'Daniela', 'Andrea'],
    correctIndex: 0,
    image: '/victoria-familia.gif',
    explanation: 'La familia ha sido siempre el centro de su vida.',
  },

  {
    id: 11,
    question: 'En Jafra, ¿qué título alcanzó en menos de un año, un récord en la historia de la compañía?',
    options: [
      'Directora regional',
      'Lady Master nacional',
      'Embajadora de marca',
      'Consultora estrella',
    ],
    correctIndex: 1,
    image: '/victoria-jafra.gif',
    explanation: 'Un logro extraordinario para una mujer extraordinaria.',
  },

  {
    id: 12,
    question: '¿Cómo se llamaba el colegio que fundó en 2012?',
    options: [
      'Little Stars',
      'Bright Minds',
      'Extraordinary Children',
      'Happy Kids',
    ],
    correctIndex: 2,
    image: '/victoria-colegio.gif',
    explanation: 'Educar fue una de las formas más hermosas de servir.',
  },

  {
    id: 13,
    question: '¿Cuántos hermanos y hermanas tiene Victoria?',
    options: [
      '3 hermanas y 2 hermanos',
      '5 hermanas y 1 hermano',
      '4 hermanas y 1 hermano',
      '2 hermanas y 3 hermanos',
    ],
    correctIndex: 1,
    image: '/victoria-hermanos.gif',
    explanation: 'Una familia numerosa llena de recuerdos.',
  },

  {
    id: 14,
    question: '¿Con qué medio periodístico trabajó Victoria en Valledupar?',
    options: ['El Tiempo', 'El Pilón', 'El Espectador', 'Vanguardia'],
    correctIndex: 2,
    image: '/victoria-espectador.gif',
    explanation: '¡Pregunta trampa! Muchos piensan en El Pilón, pero la respuesta correcta es El Espectador.',
  },

  {
    id: 15,
    question: '¿Cuál es su serie favorita actualmente?',
    options: ['La casa de papel', 'Élite', 'Valle Salvaje', 'Bridgerton'],
    correctIndex: 2,
    image: '/victoria-serie.gif',
    explanation: 'Siempre hay tiempo para una buena historia.',
  },

  {
    id: 16,
    question: '¿A qué edad Victoria manejó un tractor?',
    options: ['10 años', '12 años', '14 años', '16 años'],
    correctIndex: 2,
    image: '/victoria-tractor.gif',
    explanation: 'Valiente e independiente desde muy joven.',
  },

  {
    id: 17,
    question: '¿Dónde fue el primer trabajo de Victoria en Bosconia?',
    options: [
      'Alcaldía de Bosconia',
      'Hospital San Juan Bosco',
      'Colegio Cooperativo de Bosconia',
      'Banco Ganadero',
    ],
    correctIndex: 2,
    image: '/victoria-primer-trabajo.gif',
    explanation: 'Ahí comenzó una trayectoria llena de logros.',
  },

  {
    id: 18,
    question: '¿Cuál es la fruta favorita de Victoria?',
    options: ['Mango', 'Guanábana', 'Papaya', 'Piña'],
    correctIndex: 1,
    image: '/victoria-actual.gif',
    explanation: 'Terminamos con uno de sus gustos más dulces.',
  },
];