import { useEffect, useState } from 'react'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { listUserEquipment, detectEquipment, addEquipment, deleteEquipment } from './api.js'

export function useEquipment(session, showToast) {
  const [scannerState, setScannerState] = useState('')
  const [macbookAdded, setMacbookAdded] = useState(false)
  const [scannedEquipment, setScannedEquipment] = useState(null)
  const [registeredEquipment, setRegisteredEquipment] = useState([])
  const [equipmentStatus, setEquipmentStatus] = useState('loading')
  const [inventoryVersion, setInventoryVersion] = useState(0)
  useEffect(() => {
    if (!hasLocalApi || !session?.token) {
      setRegisteredEquipment([])
      setEquipmentStatus('idle')
      return undefined
    }
    let active = true
    setEquipmentStatus('loading')
    listUserEquipment()
      .then(items => { if (active) { if (!Array.isArray(items)) throw new Error('Resposta inválida do backend.'); setRegisteredEquipment(items); setEquipmentStatus('ready') } })
      .catch(error => { if (active) { setEquipmentStatus('error'); showToast(error.message) } })
    return () => { active = false }
  }, [session?.token, inventoryVersion])

  const startScan = async () => {
    setScannedEquipment(null)
    setScannerState('reading')
    if (!hasLocalApi) return
    try {
      const detected = await detectEquipment()
      setScannedEquipment(detected)
      setScannerState('complete')
    } catch (error) {
      setScannerState('')
      showToast(error.message || 'Não foi possível ler este computador.')
    }
  }

  const confirmScan = async () => {
    if (!hasLocalApi) {
      setMacbookAdded(true)
      setScannerState('')
      return
    }
    try {
      if (!scannedEquipment) throw new Error('Nenhum equipamento foi detectado.')
      await addEquipment(scannedEquipment)
      setInventoryVersion(value => value + 1)
      showToast('Equipamento salvo no banco de dados')
    } catch (error) {
      showToast(error.message || 'Não foi possível salvar o equipamento.')
    }
    setScannerState('')
  }

  const refreshEquipment = () => setInventoryVersion(value => value + 1)
  const removeEquipment = async id => {
    if (!hasLocalApi) {
      showToast('Demonstração: exclusão não disponível.')
      return
    }
    if (!window.confirm('Deseja excluir este equipamento?')) return
    try {
      await deleteEquipment(id)
      setRegisteredEquipment(items => items.filter(item => item.id !== id))
      showToast('Equipamento excluído.')
    } catch (error) {
      showToast(error.message || 'Não foi possível excluir o equipamento.')
    }
  }

  return { equipmentStatus, refreshEquipment, removeEquipment, scannerState, setScannerState, macbookAdded, scannedEquipment, registeredEquipment, setRegisteredEquipment, startScan, confirmScan }
}
