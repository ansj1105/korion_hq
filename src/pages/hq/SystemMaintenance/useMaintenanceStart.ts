import { useTranslation } from '../../../i18n'
import data from './maintenanceStartData.json'

interface OptionRaw {
  labelKey: string
  on: boolean
}

/*
 * useMaintenanceStart — "점검 시작" 폼 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * maintenanceStartData.json(더미 예시값)을 읽어 옵션 라벨만 번역해 반환한다.
 * 선택 상태(on)는 시안 고정값(기능별 점검/즉시 점검 시작 선택, 대상 전체 체크).
 * 날짜/시간/안내 문구 예시값은 데이터라 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 교체하면 MaintenanceStartOverlay는 그대로 동작한다.
 */
export function useMaintenanceStart() {
  const { t } = useTranslation()

  const toOptions = (raw: OptionRaw[]) => raw.map((o) => ({ label: t(o.labelKey), on: o.on }))

  return {
    scopes: toOptions(data.scopes as OptionRaw[]),
    features: toOptions(data.features as OptionRaw[]),
    timing: toOptions(data.timing as OptionRaw[]),
    schedule: data.schedule,
  }
}
