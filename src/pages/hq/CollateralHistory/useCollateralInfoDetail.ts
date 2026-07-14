import { useTranslation } from '../../../i18n'
import data from './collateralInfoDetailData.json'

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
 * collateralInfoDetailData.json(더미)을 읽어 라벨만 번역해 반환한다.
 * Figma 시안이 단일 샘플이라 행과 무관하게 같은 내용을 보여준다 —
 * 추후 실 연동 시 이 훅이 회원 id를 받아 API 조회로 교체되면 오버레이는 그대로 동작한다.
 */
export function useCollateralInfoDetail() {
  const { t } = useTranslation()

  const fields = (data.fields as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
    newRow: f.newRow,
  }))

  const metrics = (data.metrics as MetricRaw[]).map((m) => ({
    label: t(m.labelKey),
    value: m.value,
    tone: m.tone,
  }))

  return { fields, metrics, activities: data.activities as ActivityRow[] }
}
