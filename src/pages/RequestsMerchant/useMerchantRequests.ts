import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import data from './merchantData.json'

/** 가맹점 테이블 행 원본 데이터 형태 */
export interface MerchantRow {
  no: string
  code: string
  name: string
  telegram: string
  region: string
  industry: string
  opStatus: string
  date: string
}

/** 테이블 컬럼 정의 (레이아웃 설정) */
export const MERCHANT_COLUMNS: Column[] = [
  { key: 'no', label: '번호', width: '0.5fr', align: 'center' },
  { key: 'code', label: '코드', width: '1.1fr' },
  { key: 'name', label: '가맹점 명', width: '1.2fr' },
  { key: 'telegram', label: 'Telegram ID', width: '1.1fr' },
  { key: 'region', label: '담당 지역', width: '0.9fr' },
  { key: 'industry', label: '업종', width: '0.9fr' },
  { key: 'opStatus', label: '운영상태', width: '0.9fr' },
  { key: 'date', label: '신청일', width: '1.1fr' },
  { key: 'action', label: '액션', width: '1.8fr' },
]

/** 모든 행 공통 액션 배지 라벨 */
export const MERCHANT_ACTIONS = ['승인', '거절', '보류', '자료요청', '상세'] as const

/*
 * useMerchantRequests — 가맹점 가입 요청 데이터 훅
 * ------------------------------------------------------------------
 * 현재는 merchantData.json(하드코딩)을 반환한다.
 * 추후 실데이터 연동 시 이 훅 내부만 API 호출로 교체하면 화면은 그대로 동작한다.
 */
export function useMerchantRequests() {
  return {
    stats: data.stats as StatCardData[],
    rows: data.rows as MerchantRow[],
  }
}
