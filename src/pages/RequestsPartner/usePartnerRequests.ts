import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import data from './partnerData.json'

/** 파트너 테이블 행 원본 데이터 형태 */
export interface PartnerRow {
  no: string
  code: string
  name: string
  region: string
  subCount: string
  volume: string
  txCount: string
  hqStatus: string
  opStatus: string
  date: string
}

/** 테이블 컬럼 정의 (구조 설정 — 화면에 채워질 '데이터'가 아니라 레이아웃 설정) */
export const PARTNER_COLUMNS: Column[] = [
  { key: 'no', label: '번호', width: '0.5fr', align: 'center' },
  { key: 'code', label: '파트너 코드', width: '1.1fr' },
  { key: 'name', label: '파트너명', width: '1.1fr' },
  { key: 'region', label: '담당 지역', width: '0.9fr' },
  { key: 'subCount', label: '하위 가맹점 수', width: '1fr' },
  { key: 'volume', label: '월 거래액', width: '1.2fr' },
  { key: 'txCount', label: '월 거래 건수', width: '1fr' },
  { key: 'hqStatus', label: '본사승인 상태', width: '1fr' },
  { key: 'opStatus', label: '운영 상태', width: '0.9fr' },
  { key: 'date', label: '신청일', width: '1.1fr' },
  { key: 'action', label: '액션', width: '1.8fr' },
]

/** 모든 행 공통 액션 배지 라벨 */
export const PARTNER_ACTIONS = ['승인요청', '정지요청', '상세'] as const

/*
 * usePartnerRequests — 파트너 가입 요청 데이터 훅
 * ------------------------------------------------------------------
 * 현재는 partnerData.json(하드코딩)을 반환한다.
 * 추후 실데이터 연동 시 이 훅 내부만 API 호출로 교체하면 화면은 그대로 동작한다.
 */
export function usePartnerRequests() {
  // JSON에서 tagAccent 등은 string으로 추론되므로 컴포넌트 타입으로 단언한다.
  return {
    stats: data.stats as StatCardData[],
    rows: data.rows as PartnerRow[],
  }
}
