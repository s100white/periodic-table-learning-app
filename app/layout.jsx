import './globals.css';

export const metadata = {
  title: '원소 비교 주기율표',
  description: '대학생 입문자를 위한 비교 중심 원소 주기율표 학습앱',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

