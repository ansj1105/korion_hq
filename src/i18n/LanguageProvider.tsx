import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import ko from './ko.json'
import en from './en.json'

/*
 * 경량 i18n (다국어) — 외부 라이브러리 없이 React Context로 구현.
 * ------------------------------------------------------------------
 * - 화면의 UI 텍스트는 ko.json / en.json에 "키 → 번역" 으로 보관한다.
 * - 컴포넌트는 useTranslation().t('키') 로 현재 언어의 문구를 가져온다.
 * - 우측 상단 언어 버튼이 toggleLang()으로 한↔영을 전환하면 전체가 다시 그려진다.
 * (데이터 행 값 등은 번역 대상이 아니며 그대로 표시한다)
 */
export type Lang = 'ko' | 'en'

const DICTS: Record<Lang, Record<string, string>> = { ko, en }

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** 키에 해당하는 번역 문구. 없으면 키를 그대로 반환(누락 표시용). */
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko') // 기본 한국어

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))
  }, [])

  const t = useCallback((key: string) => DICTS[lang][key] ?? key, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

/** 번역 훅 — 컴포넌트에서 t/lang/toggleLang을 사용. */
export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useTranslation은 LanguageProvider 안에서만 사용할 수 있습니다.')
  }
  return ctx
}
