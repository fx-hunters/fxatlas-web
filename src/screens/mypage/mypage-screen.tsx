import { ApiStateView } from '../../components/common/api-state-view';
import { Icon } from '../../components/common/icon';
import type { NavTabId } from '../../types/navigation';
import type { MyPageViewData } from '../../types/mypage';
import { MyPageSettingsForm } from './mypage-settings-form';
import { useMyPage, type MyPageDependencies } from './use-mypage';

export interface MyPageScreenProps {
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly onLogin?: () => void;
  readonly onLogout?: () => void;
  readonly onStartTour?: () => void;
  readonly dependencies?: MyPageDependencies;
}

const CARD_STYLE = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  padding: 'clamp(1.25rem, 3.5vw, 2rem)',
  borderRadius: 'var(--radius-2xl)',
} as const;

const BADGE_STYLE = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '0.375rem 0.75rem',
  borderRadius: 'var(--radius-lg)',
  fontVariantNumeric: 'tabular-nums',
} as const;

const SECTION_TITLE_STYLE = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--text)',
} as const;

export function MyPageScreen({
  onNavigate,
  onLogin,
  onLogout,
  onStartTour,
  dependencies,
}: MyPageScreenProps) {
  const { state, saveState, reload, saveSettings } = useMyPage(dependencies);

  if (state.status === 'loading') {
    return (
      <ApiStateView
        status="loading"
        title="마이페이지를 불러오는 중입니다"
        message="프로필과 서버 설정을 확인하고 있습니다."
      />
    );
  }

  if (state.status === 'error') {
    return (
      <ApiStateView
        status="error"
        title="마이페이지를 불러오지 못했습니다"
        message={state.message}
        onRetry={reload}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: '48rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <ProfileCard
        data={state.data}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      <RiskProfileCard data={state.data} />

      <section style={{ ...CARD_STYLE, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2
          style={{
            ...SECTION_TITLE_STYLE,
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem',
          }}
        >
          기본 설정
        </h2>
        <MyPageSettingsForm
          settings={state.data.settings}
          saveState={saveState}
          onSave={saveSettings}
        />
      </section>

      <NotificationsCard data={state.data} />

      <ShortcutsCard onNavigate={onNavigate} onStartTour={onStartTour} />
    </div>
  );
}

function ProfileCard({
  data,
  onLogin,
  onLogout,
}: {
  readonly data: MyPageViewData;
  readonly onLogin?: () => void;
  readonly onLogout?: () => void;
}) {
  const { profile } = data;

  return (
    <section
      style={{
        ...CARD_STYLE,
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          width: '5rem',
          height: '5rem',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          flexShrink: 0,
        }}
      >
        <Icon name="user" size={40} className="text-muted" />
      </div>

      <div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.25rem',
            color: 'var(--text)',
          }}
        >
          {profile.name}
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {profile.email}
        </p>
      </div>

      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          {profile.accountLabel}
        </span>

        {profile.isDemoAccount
          ? onLogin && (
              <button
                type="button"
                onClick={onLogin}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-content)',
                  border: 'none',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Icon name="logIn" size={15} />
                <span>로그인</span>
              </button>
            )
          : onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Icon name="logOut" size={15} />
                <span>로그아웃</span>
              </button>
            )}
      </div>
    </section>
  );
}

function RiskProfileCard({ data }: { readonly data: MyPageViewData }) {
  return (
    <section style={CARD_STYLE}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ ...SECTION_TITLE_STYLE, marginBottom: '0.5rem' }}>
          의사결정 프로필 (투자성향)
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
          }}
        >
          안전 버킷 하한과 집중도 기준선 판정에 쓰입니다.
        </p>
      </div>

      {data.riskProfile?.isMeasured ? (
        <div
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Icon name="shield" size={28} className="text-primary" />
            <span
              style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}
            >
              {data.riskProfile.gradeLabel}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {data.riskProfile.scoreLabel && (
              <span style={BADGE_STYLE}>{data.riskProfile.scoreLabel}</span>
            )}
            {data.riskProfile.diagnosedOnLabel && (
              <span style={BADGE_STYLE}>{data.riskProfile.diagnosedOnLabel}</span>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          아직 성향 진단 결과가 없습니다. 진단을 마치면 이곳에 표시됩니다.
        </p>
      )}

      {data.riskProfile?.limitationNote && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            marginTop: '1rem',
            lineHeight: 1.6,
          }}
        >
          {data.riskProfile.limitationNote}
        </p>
      )}
    </section>
  );
}

function NotificationsCard({ data }: { readonly data: MyPageViewData }) {
  return (
    <section style={CARD_STYLE}>
      <h2
        style={{
          ...SECTION_TITLE_STYLE,
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        최근 알림
      </h2>
      {data.notifications.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          새 알림이 없습니다.
        </p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.notifications.map((notification) => (
            <li
              key={notification.id}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <strong style={{ color: 'var(--text)', fontSize: '0.9375rem' }}>
                  {notification.title}
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {notification.receivedAtLabel}
                  {notification.isRead ? '' : ' · 새 알림'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {notification.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ShortcutsCard({
  onNavigate,
  onStartTour,
}: {
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly onStartTour?: () => void;
}) {
  const handleNavigate = (tab: NavTabId) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <section style={CARD_STYLE}>
      <h2
        style={{
          ...SECTION_TITLE_STYLE,
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        바로가기
      </h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleNavigate('assets')}
          style={{
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontWeight: 600,
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-xl)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          자산 내역 편집 <Icon name="arrowRight" size={16} className="text-muted" />
        </button>
        <button
          type="button"
          onClick={() => handleNavigate('planner')}
          className="btn-primary-glow"
          style={{
            fontSize: '0.875rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-content)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-xl)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
          }}
        >
          외화 목표 편집 <Icon name="arrowRight" size={16} className="opacity-70" />
        </button>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            style={{
              fontSize: '0.875rem',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontWeight: 600,
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-xl)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Icon name="sparkles" size={16} className="text-primary" />
            <span>가이드 투어 다시보기</span>
          </button>
        )}
      </div>
    </section>
  );
}
