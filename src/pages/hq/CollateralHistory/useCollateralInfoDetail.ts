import { useTranslation } from '../../../i18n'

/** 메트릭/상태 색조 — Figma 시안의 시안/초록/호박 3색 */
export type InfoDetailTone = 'cyan' | 'green' | 'amber'

interface FieldRaw {
  labelKey: string
  value: string
  /** true면 2열 그리드에서 강제로 왼쪽 열(새 행)부터 시작 — Figma의 빈 칸 배치 재현용 */
  newRow?: boolean
}

interface MetricRaw {
  labelKey: string
  value: string
  tone: InfoDetailTone
}

/** 최근 활동 행 — 값(일시/유형/금액/상태)은 데이터라 번역하지 않는다(CLAUDE.md 11번). */
interface ActivityRow {
  at: string
  type: string
  amount: string
  status: string
  statusTone: InfoDetailTone
}

/*
 * useCollateralInfoDetail — "회원 담보금 상세 정보" 오버레이(Figma 81:29553) 데이터 훅
 * ------------------------------------------------------------------
 * 행 데이터가 없는 예외 상태에서 빈 상세를 반환한다.
 * 실제 오버레이 값은 CollateralHistory API 행 데이터를 사용한다.
 */
export function useCollateralInfoDetail() {
  const { t } = useTranslation()

  const fields = ([] as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
    newRow: f.newRow,
  }))

  const metrics = ([] as MetricRaw[]).map((m) => ({
    label: t(m.labelKey),
    value: m.value,
    tone: m.tone,
  }))

  return { fields, metrics, activities: [] as ActivityRow[] }
}
