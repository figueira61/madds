/** What each of the 12 cromos shows, in CROMO_IDS order. `frame` is in the texture's sheet. */
export interface CromoArt {
  title: string;
  texture: string;
  frame: number;
  colour: number;
}

export const CROMO_ART: Record<string, CromoArt> = {
  '1-1': { title: 'Madds', texture: 'madds', frame: 0, colour: 0x6cbf4f },
  '1-2': { title: 'Coelho', texture: 'animals', frame: 0, colour: 0x6cbf4f },
  '1-3': { title: 'Raposa', texture: 'animals', frame: 6, colour: 0x6cbf4f },
  '1-boss': { title: 'O Caçador', texture: 'hunter', frame: 0, colour: 0x45913a },
  '2-1': { title: 'Bekas', texture: 'bekas', frame: 0, colour: 0xff9a3a },
  '2-2': { title: 'Boneco', texture: 'minifig', frame: 0, colour: 0xff9a3a },
  '2-3': { title: 'Caixa de Peças', texture: 'brick-box', frame: 0, colour: 0xff9a3a },
  '2-boss': { title: 'Robô de Blocos', texture: 'robot', frame: 0, colour: 0xd8642a },
  '3-1': { title: 'Kart', texture: 'racer', frame: 0, colour: 0x4a8cff },
  '3-2': { title: 'Carro de Corrida', texture: 'car', frame: 0, colour: 0x4a8cff },
  '3-3': { title: 'A.D.Q.C. n.º 11', texture: 'madds-adqc', frame: 0, colour: 0x2457c9 },
  '3-boss': { title: 'O Grande Troféu', texture: 'trophy', frame: 0, colour: 0xd99a1a },
};
