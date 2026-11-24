export function mapBackendEquipment(item) {
  const model = [item.fabricante, item.modelo].filter(Boolean).join(' ') || 'Equipamento'
  return {
    id: item.id,
    nickname: model,
    status: 'Em uso',
    statusType: 'inUse',
    lastMaintenance: '—',
    warranty: item.garantia || '—',
    model,
    ehNotebook: item.ehNotebook === true,
    cpu: item.processador || 'Não identificado',
    ram: (item.ram || 0) + 'GB',
    gpu: (item.placasDeVideo || []).join(', ') || 'Não identificada',
    operatingSystem: 'Não informado',
    details: [['Discos', (item.discos || []).join(', ') || 'Não informado'], ['Garantia', item.garantia || 'Não informada']],
  }
}
