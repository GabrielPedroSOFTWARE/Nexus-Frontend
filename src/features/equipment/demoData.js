export const demoComputerInventory = {
  desktop: {
    id: '001', nickname: 'Desktop de usuário', status: 'Em Manutenção', statusType: 'maintenance',
    lastMaintenance: 'Em andamento', warranty: '-------------', model: 'Desktop Lenovo ThinkCenter',
    kind: 'desktop', cpu: 'Intel core i5 10500F', ram: '8GB', gpu: 'Intel graphics', operatingSystem: 'Window 11 PRO',
    details: [['Armazenamento', 'SSD 1TB'], ['Memória', '8GB, DDR4, 2666 MHZ']],
  },
  macbook: {
    id: '002', nickname: 'MacBook de usuário', status: 'Em uso', statusType: 'inUse',
    lastMaintenance: '28/06/2026', warranty: '12/2026', model: 'MacBook air',
    kind: 'laptop', cpu: 'Apple M3', ram: '16GB', gpu: 'Apple Silicon', operatingSystem: 'MacOS',
    details: [['S.O', 'MacOS'], ['CPU', 'Apple M3'], ['Tela', 'Liquid Retina 13,6 Polegadas'], ['GPU', 'Apple Silicon']],
  },
}
