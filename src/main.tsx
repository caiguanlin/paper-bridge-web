import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { queryClient } from './app/queryClient';
import './index.css';
import './styles/global.css';

/**
 * Ant Design theme aligned with DESIGN.md (Apple-inspired design system).
 * - Primary: Action Blue #0066cc
 * - Border radius: 8px (rounded-sm)
 * - Font: Inter, system-ui
 * - No shadows on cards/buttons – elevation via surface color changes
 */
const appleTheme = {
  token: {
    // ── Colors ──
    colorPrimary: '#0066cc',
    colorLink: '#0066cc',
    colorLinkHover: '#0071e3',
    colorLinkActive: '#004999',
    colorText: '#1d1d1f',
    colorTextSecondary: '#333333',
    colorTextTertiary: '#7a7a7a',
    colorTextQuaternary: '#cccccc',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f7',
    colorBgElevated: '#ffffff',
    colorBorder: '#e0e0e0',
    colorBorderSecondary: '#f0f0f0',
    colorSplit: '#f0f0f0',
    colorSuccess: '#34c759',
    colorWarning: '#ff9500',
    colorError: '#ff3b30',
    colorInfo: '#0066cc',

    // ── Typography ──
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 28,
    fontSizeHeading2: 21,
    fontSizeHeading3: 17,
    fontSizeHeading4: 14,
    fontWeightStrong: 600,

    // ── Shape ──
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 5,

    // ── Spacing ──
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,

    // ── Elevation ──
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.08)',

    // ── Motion ──
    motionDurationFast: '0.15s',
    motionDurationMid: '0.25s',
    motionDurationSlow: '0.35s',

    // ── Control ──
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // ── Line ──
    lineWidth: 1,
    lineType: 'solid' as const,
  },
  components: {
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Card: {
      boxShadowTertiary: 'none',
    },
    Table: {
      headerBg: '#fafafc',
      headerColor: '#1d1d1f',
      headerSplitColor: '#f0f0f0',
      rowHoverBg: '#fafafc',
      borderColor: '#f0f0f0',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(0, 102, 204, 0.06)',
      itemSelectedColor: '#0066cc',
      itemHoverBg: 'rgba(0, 102, 204, 0.04)',
      itemHoverColor: '#0066cc',
      itemActiveBg: 'rgba(0, 102, 204, 0.08)',
      subMenuItemBg: 'transparent',
      itemBorderRadius: 8,
      iconSize: 16,
      itemMarginBlock: 2,
      itemMarginInline: 8,
      itemPaddingInline: 12,
    },
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#f5f5f7',
      headerPadding: '0 24px',
      headerHeight: 56,
    },
    Input: {
      activeBorderColor: '#0066cc',
      hoverBorderColor: '#0071e3',
    },
    Select: {
      optionSelectedBg: 'rgba(0, 102, 204, 0.06)',
    },
    Tabs: {
      inkBarColor: '#0066cc',
      itemSelectedColor: '#0066cc',
      itemHoverColor: '#0071e3',
      itemActiveColor: '#004999',
    },
    Modal: {
      titleFontSize: 17,
    },
    Alert: {
      colorInfoBg: 'rgba(0, 102, 204, 0.04)',
      colorInfoBorder: 'rgba(0, 102, 204, 0.15)',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={appleTheme}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
