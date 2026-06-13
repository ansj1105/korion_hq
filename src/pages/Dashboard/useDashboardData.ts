import type { KpiCardData } from '../../components/molecules/KpiCard'
import dashboardData from './dashboardData.json'

/*
 * useDashboardData — 대시보드 데이터 훅
 * ------------------------------------------------------------------
 * 현재는 dashboardData.json(하드코딩 JSON)을 그대로 반환한다.
 * 추후 실데이터 연동 시 이 훅 내부만 API 호출(fetch / react-query 등)로 교체하면,
 * 화면 컴포넌트는 수정 없이 동작한다. → 데이터 출처를 한 곳에 격리하는 패턴.
 */
export function useDashboardData() {
  // JSON에서 accent 등은 string으로 추론되므로 컴포넌트 타입으로 단언한다.
  const kpis = dashboardData.kpis as KpiCardData[]
  return { kpis }
}
