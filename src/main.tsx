import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n'
import './styles/global.css'

// 앱 진입점.
// - LanguageProvider: 다국어(한/영) 컨텍스트 제공 (우측 상단 버튼으로 전환)
// - BrowserRouter: 사이드바 네비게이션 라우팅 (서버 통신·인증은 범위 외)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
)
