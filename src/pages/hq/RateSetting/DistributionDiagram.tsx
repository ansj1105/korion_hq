import type { ReactNode } from 'react'
import { useTranslation } from '../../../i18n'
import styles from './DistributionDiagram.module.css'

/** 다이어그램 셀 색 — 본사(회색)/리더(초록)/파트너(노랑)/가맹점(청회색) */
export type DiagramCellColor = 'hq' | 'leader' | 'partner' | 'merchant'

/** 배분 셀 — value 없으면 종착지(가맹점 라벨)로 표시 */
export interface DiagramCell {
  color: DiagramCellColor
  value?: string
}

/** 배분 행 — 경로 라벨(파트너 경유/직계약) + 좌→우 배분 셀들 */
export interface DiagramRow {
  route: 'via' | 'direct'
  cells: DiagramCell[]
}

interface DistributionDiagramProps {
  rows: DiagramRow[]
  /** 헤더 행 맨 앞(경로 라벨 열)에 놓일 제목 — Figma상 제목이 역할 배지와 같은 줄 */
  titleSlot?: ReactNode
  /** 헤더 행 맨 뒤(우측 끝)에 놓일 액션(페이지의 "저장" 버튼 등) */
  action?: ReactNode
}

/*
 * DistributionDiagram — 기본 배분 구조 다이어그램 (배분율 설정 페이지/모달 공용)
 * ------------------------------------------------------------------
 * Figma상 제목·역할 배지(본사→리더→파트너→가맹점)·저장 버튼이 모두 한 줄(헤더 행)이라
 * titleSlot/action을 헤더 행 안에 배치한다. 헤더/데이터 행이 같은 grid 컬럼 템플릿을
 * 공유해 역할 배지와 값 배지의 열이 항상 맞는다. 값은 데이터(번역 안 함),
 * 경로/역할 라벨은 UI 텍스트(번역). 입력 동작은 없음(표시 전용, Figma 시안 값).
 */
export default function DistributionDiagram({ rows, titleSlot, action }: DistributionDiagramProps) {
  const { t } = useTranslation()

  const colorClass: Record<DiagramCellColor, string> = {
    hq: styles.bHq,
    leader: styles.bLeader,
    partner: styles.bPartner,
    merchant: styles.bMerchant,
  }
  const headerLabels: { color: DiagramCellColor; label: string }[] = [
    { color: 'hq', label: t('hqRate.diagram.hq') },
    { color: 'leader', label: t('hqRate.diagram.leader') },
    { color: 'partner', label: t('hqRate.diagram.partner') },
    { color: 'merchant', label: t('hqRate.diagram.merchant') },
  ]

  return (
    <div className={styles.scroll}>
      {/* 헤더 행 — [제목][본사][리더][파트너][가맹점][액션] 이 한 줄 (Figma 실측) */}
      <div className={`${styles.grid} ${styles.headerGrid}`}>
        <span className={styles.titleCell}>{titleSlot}</span>
        {headerLabels.map((h) => (
          <span key={h.color} className={styles.slotGroup}>
            <span className={`${styles.badge} ${colorClass[h.color]} ${styles.headerBadge}`}>{h.label}</span>
          </span>
        ))}
        <span className={styles.actionCell}>{action}</span>
      </div>

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.grid}>
          {/* 경로 라벨 배지 (파트너 경유=보라 / 직계약=파랑) */}
          <span className={`${styles.badge} ${row.route === 'via' ? styles.bVia : styles.bDirect}`}>
            {row.route === 'via' ? t('hqRate.diagram.via') : t('hqRate.diagram.direct')}
          </span>

          {/* 배분 셀들 — [값 배지][%] + (다음 셀 있으면) [→] */}
          {[0, 1, 2, 3].map((i) => {
            const cell = row.cells[i]
            return (
              <span key={i} className={styles.slotGroup}>
                {cell && (
                  <>
                    <span className={`${styles.badge} ${colorClass[cell.color]}`}>
                      {cell.value ?? t('hqRate.diagram.merchant')}
                    </span>
                    <span className={styles.pct}>%</span>
                    {row.cells[i + 1] && <span className={styles.arrow}>→</span>}
                  </>
                )}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
