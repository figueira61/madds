import type { PortraitName } from '../art/sprites/portraits';

export interface CutsceneLine {
  speaker: 'madds' | 'bekas' | 'hunter' | 'narrador';
  portrait?: PortraitName;
  text: string;
}

export type CutsceneId = 'w1-intro' | 'w1-preboss' | 'w1-reunion';

export const SPEAKER_NAME: Record<CutsceneLine['speaker'], string> = {
  madds: 'Madds',
  bekas: 'Bekas',
  hunter: 'Caçador',
  narrador: '',
};

export const CUTSCENES: Record<CutsceneId, CutsceneLine[]> = {
  'w1-intro': [
    { speaker: 'narrador', text: 'Sábado de manhã. A Madds chega a casa depois do treino na A.D.Q.C.' },
    { speaker: 'madds', portrait: 'madds-surprised', text: 'Bekas? BEKAS! Onde é que te meteste?' },
    { speaker: 'narrador', text: 'O portão do quintal está aberto. No chão há pegadas... e restos de uma rede.' },
    { speaker: 'madds', portrait: 'madds-sad', text: 'Alguém levou a Bekas...' },
    { speaker: 'narrador', text: 'Os vizinhos contam-lhe: um tal Colecionador anda a apanhar animais no Santuário da floresta.' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Aguenta, Bekas. Eu vou buscar-te!' },
  ],
  'w1-preboss': [
    { speaker: 'hunter', portrait: 'hunter', text: 'Então és tu a miúda que anda a abrir as jaulas do patrão.' },
    { speaker: 'hunter', portrait: 'hunter', text: 'A cadela preta e branca? Agora faz parte da coleção do Colecionador!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'A Bekas não é de coleção nenhuma. É a minha melhor amiga.' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'E tu vais aprender como é que se marca um golo.' },
  ],
  'w1-reunion': [
    { speaker: 'narrador', text: 'O cadeado cede. A porta da jaula abre-se devagar...' },
    { speaker: 'madds', portrait: 'madds-hands', text: 'BEKAS!' },
    { speaker: 'bekas', portrait: 'bekas-happy', text: 'Ão! Ão! Ão!' },
    { speaker: 'madds', portrait: 'madds-happy', text: 'Estás bem! Que saudades que eu tive tuas...' },
    { speaker: 'hunter', portrait: 'hunter', text: 'Isto não fica assim! O Colecionador não vai gostar nada disto!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Ele que se prepare. Agora somos duas.' },
  ],
};
