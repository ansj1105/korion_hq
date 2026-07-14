import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n'
import DistributionDiagram, { type DiagramRow } from './DistributionDiagram'
import type { RateCountryOption, RateModalData } from './useRateSetting'
import styles from './RateFormModal.module.css'

interface RateFormModalProps {
  /** add: "국가별 배분율 추가" CTA(하단 추가하기) / edit: 행(상세) 클릭(하단 수정하기) */
  variant: 'add' | 'edit'
  data: RateModalData
  countries: RateCountryOption[]
  diagramRows: DiagramRow[]
  onClose: () => void
  onSubmit: (payload: RateModalData) => Promise<void>
  onDelete: (countryCode: string) => Promise<void>
}

/*
 * RateFormModal — "국가별 배분율 설정/추가" 모달 (Figma 81:23083 내 Modal Card, 855×602)
 * ------------------------------------------------------------------
 * 특정 국가에만 별도 배분율을 적용하는 폼. 좌측 네브바를 제외한 콘텐츠 영역 기준
 * 가운데 정렬(수수료 관리 모달과 동일 backdrop 방식). Figma에 추가하기/수정하기 버튼이
 * 함께 있어 CTA 진입(add)/행 진입(edit) 두 모드로 나눠 하단 버튼만 바꾼다.
 * 배분 다이어그램은 페이지와 동일한 DistributionDiagram을 재사용(표시 전용).
 */
export default function RateFormModal({ variant, data, countries, diagramRows, onClose, onSubmit, onDelete }: RateFormModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<RateModalData>(data)
  const [draftRows, setDraftRows] = useState<DiagramRow[]>(() => modalRowsFromData(diagramRows, data))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm(data)
    setDraftRows(modalRowsFromData(diagramRows, data))
  }, [data, diagramRows])

  const eventLabel = form.eventEnabled ? t('hqRate.modal.eventActive') : t('hqRate.modal.eventInactive')

  const countryOptions = useMemo(() => countries.length ? countries : [{ code: form.countryCode, name: form.country }], [countries, form.country, form.countryCode])

  const update = <K extends keyof RateModalData>(key: K, value: RateModalData[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateCountry = (countryCode: string) => {
    const country = countryOptions.find((item) => item.code === countryCode)
    setForm((current) => ({
      ...current,
      countryCode,
      country: country?.name ?? current.country,
    }))
  }

  const submit = async () => {
    const routedRow = draftRows[0]
    setIsSaving(true)
    try {
      await onSubmit({
        ...form,
        hqRate: routedRow?.hqRate ?? form.hqRate,
        leaderRate: routedRow?.leaderRate ?? form.leaderRate,
        partnerRate: routedRow?.partnerRate ?? form.partnerRate,
      })
      onClose()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(t('hqRate.modal.deleteConfirm'))) return
    setIsSaving(true)
    try {
      await onDelete(form.countryCode)
      onClose()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqRate.modal.title')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 제목/설명(좌) + 이벤트 적용중 배지 · ON 토글(우) */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRate.modal.title')}</h2>
            <p className={styles.desc}>{t('hqRate.modal.desc')}</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.eventBadge}>{eventLabel}</span>
            <button
              type="button"
              className={form.eventEnabled ? styles.toggleOn : styles.toggleOff}
              onClick={() => update('eventEnabled', !form.eventEnabled)}
            >
              {form.eventEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('hqRate.modal.countrySelect')}</span>
          <select className={styles.selectBox} value={form.countryCode} onChange={(event) => updateCountry(event.target.value)}>
            {countryOptions.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        {/* 기본 배분 구조 설정 — 페이지 다이어그램 재사용 (제목이 역할 배지와 한 줄) */}
        <div className={styles.diagramSection}>
          <DistributionDiagram
            rows={draftRows}
            titleSlot={<h3 className={styles.diagramTitle}>{t('hqRate.diagram.title')}</h3>}
            editable
            onRowsChange={setDraftRows}
          />
        </div>

        <label className={`${styles.field} ${styles.memoField}`}>
          <span className={styles.fieldLabel}>{t('hqRate.modal.adminMemo')}</span>
          <textarea
            className={styles.memoBox}
            value={form.adminMemo}
            placeholder={t('hqRate.modal.memoPlaceholder')}
            maxLength={200}
            onChange={(event) => update('adminMemo', event.target.value)}
          />
        </label>

        <div className={styles.footer}>
          {variant === 'edit' && (
            <button type="button" className={styles.deleteButton} disabled={isSaving} onClick={remove}>
              {t('hqRate.modal.delete')}
            </button>
          )}
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('hqRate.modal.cancel')}
          </button>
          <button type="button" className={styles.submitButton} disabled={isSaving} onClick={submit}>
            {variant === 'add' ? t('hqRate.modal.add') : t('hqRate.modal.edit')}
          </button>
        </div>
      </div>
    </div>
  )
}

function modalRowsFromData(rows: DiagramRow[], data: RateModalData): DiagramRow[] {
  return rows.map((row, index) => {
    if (index !== 0) return row
    return {
      ...row,
      hqRate: data.hqRate,
      leaderRate: data.leaderRate,
      partnerRate: data.partnerRate,
      merchantRate: '0',
      cells: row.cells.map((cell) => {
        if (cell.color === 'hq') return { ...cell, value: data.hqRate }
        if (cell.color === 'leader') return { ...cell, value: data.leaderRate }
        if (cell.color === 'partner') return { ...cell, value: data.partnerRate }
        return cell
      }),
    }
  })
}
