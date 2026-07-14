import { useTranslation } from '../../../i18n'

interface OptionRaw {
  labelKey: string
  on: boolean
}

/*
 * useMaintenanceStart — "점검 시작" 폼 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * 옵션 라벨과 기본 선택값만 제공한다. 샘플 날짜/안내 문구는 노출하지 않는다.
 */
export function useMaintenanceStart() {
  const { t } = useTranslation()

  const toOptions = (raw: OptionRaw[]) => raw.map((o) => ({ label: t(o.labelKey), on: o.on }))
  const scopes: OptionRaw[] = [
    { labelKey: 'hqSystemMaintenance.start.scope.all', on: false },
    { labelKey: 'hqSystemMaintenance.start.scope.payMethod', on: false },
    { labelKey: 'hqSystemMaintenance.start.scope.feature', on: true },
  ]
  const features: OptionRaw[] = [
    { labelKey: 'hqSystemMaintenance.start.feature.pay', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.offline', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.qr', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.nfc', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.bluetooth', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.topup', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.release', on: true },
    { labelKey: 'hqSystemMaintenance.start.feature.settle', on: true },
  ]
  const timing: OptionRaw[] = [
    { labelKey: 'hqSystemMaintenance.start.timing.now', on: true },
    { labelKey: 'hqSystemMaintenance.start.timing.reserve', on: false },
  ]

  return {
    scopes: toOptions(scopes),
    features: toOptions(features),
    timing: toOptions(timing),
    schedule: {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      userMessage: '',
    },
  }
}
