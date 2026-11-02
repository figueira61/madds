import type { PortraitName } from '../art/sprites/portraits';

export interface CutsceneLine {
  speaker: 'madds' | 'bekas' | 'hunter' | 'robot' | 'collector' | 'narrador';
  portrait?: PortraitName;
  text: string;
}

export type CutsceneId = 'w1-intro' | 'w1-preboss' | 'w1-reunion' | 'w2-intro' | 'w2-preboss' | 'w2-outro'
  | 'w3-intro' | 'w3-preboss' | 'w3-outro';

export const SPEAKER_NAME: Record<CutsceneLine['speaker'], string> = {
  madds: 'Madds',
  bekas: 'Bekas',
  hunter: 'Caçador',
  robot: 'Robô de Blocos',
  collector: 'O Colecionador',
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
  'w2-intro': [
    { speaker: 'narrador', text: 'A Madds e a Bekas seguem o rasto do Caçador até à Cidade de Blocos.' },
    { speaker: 'madds', portrait: 'madds-surprised', text: 'OMG! A cidade está toda desmontada...' },
    { speaker: 'narrador', text: 'As torres, as pontes, os parques: alguém levou as peças, uma a uma.' },
    { speaker: 'bekas', portrait: 'bekas-happy', text: 'Snif, snif... Ão!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Farejaste alguma coisa? Mostra o caminho, Bekas. Vamos montar isto outra vez!' },
  ],
  'w2-preboss': [
    { speaker: 'narrador', text: 'No centro da fábrica, as peças roubadas mexem-se sozinhas... e levantam-se.' },
    { speaker: 'robot', portrait: 'robot', text: 'PEÇAS. CONFISCADAS. POR. ORDEM. DO. COLECIONADOR.' },
    { speaker: 'madds', portrait: 'madds-hands', text: 'Ele construiu um robô com as peças da cidade inteira?!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Então vamos desmontá-lo peça a peça. Bekas, comigo!' },
  ],
  'w2-outro': [
    { speaker: 'narrador', text: 'As peças do robô voltam para os seus lugares. A cidade monta-se outra vez, bloco a bloco.' },
    { speaker: 'madds', portrait: 'madds-happy', text: 'WOW! Olha, Bekas, as torres estão de pé outra vez!' },
    { speaker: 'collector', portrait: 'collector', text: 'Bravo, bravo... Uma rapariga e uma cadela a estragar a minha coleção.' },
    { speaker: 'collector', portrait: 'collector', text: 'Mas os animais e os blocos eram só o aperitivo. No Estádio guardo a peça mais rara de todas: o grande troféu.' },
    { speaker: 'collector', portrait: 'collector', text: 'Vem buscá-lo, se fores capaz!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Um estádio? Então vais jogar no MEU campo. Vamos, Bekas!' },
  ],
  'w3-intro': [
    { speaker: 'narrador', text: 'O Estádio. Hoje há corrida no circuito à volta do relvado, e as bancadas estão cheias.' },
    { speaker: 'collector', portrait: 'collector', text: 'Senhoras e senhores! O grande troféu é MEU. E quem o quiser, que o venha buscar... a correr!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Corrida, futebol, e um troféu para recuperar? Este é o meu mundo.' },
    { speaker: 'bekas', portrait: 'bekas-happy', text: 'Ão! Ão!' },
    { speaker: 'narrador', text: 'Nas boxes, os carros já aquecem os motores. O ecrã não vai esperar por ninguém!' },
  ],
  'w3-preboss': [
    { speaker: 'narrador', text: 'No meio do relvado, o Colecionador espera num trono dourado a flutuar.' },
    { speaker: 'collector', portrait: 'collector', text: 'Animais, cidades, carros... Tu estragaste tudo. Mas este troféu ninguém me tira!' },
    { speaker: 'madds', portrait: 'madds-determined', text: 'Isso vamos ver. Até agora não falhei nenhum remate.' },
    { speaker: 'collector', portrait: 'collector', text: 'Então tenta! Ah, e já agora... na baliza ninguém me passa.' },
  ],
  'w3-outro': [
    { speaker: 'narrador', text: 'O Colecionador foge pela saída do túnel. O troféu fica no relvado, a brilhar.' },
    { speaker: 'madds', portrait: 'madds-happy', text: 'WOW... Conseguimos, Bekas! Conseguimos MESMO!' },
    { speaker: 'bekas', portrait: 'bekas-happy', text: 'Ão! Ão! Ão!' },
    { speaker: 'narrador', text: 'Os animais voltam ao santuário. A cidade de blocos está de pé. E o estádio inteiro grita um nome.' },
    { speaker: 'madds', portrait: 'madds-hands', text: 'Este troféu não é só meu. É de todos os que ajudámos... e da melhor parceira do mundo.' },
  ],
};
